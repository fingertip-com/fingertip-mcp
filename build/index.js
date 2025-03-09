import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import Fingertip from "fingertip";
const apiKey = process.env.FINGERTIP_API_KEY;
if (!apiKey) {
    console.error("FINGERTIP_API_KEY environment variable is not set");
    process.exit(1);
}
// Create server instance
const server = new McpServer({
    name: "fingertip",
    version: "1.0.0",
});
// Register Fingertip tools for sites
server.tool("get-sites", "Get a list of sites", {
    pageSize: z.number().optional().describe("Number of items to return"),
    cursor: z.string().optional().describe("Pagination cursor"),
}, async ({ pageSize, cursor }) => {
    try {
        const client = new Fingertip({ apiKey });
        const params = {};
        if (pageSize)
            params.pageSize = pageSize.toString();
        if (cursor)
            params.cursor = cursor;
        const sitesData = await client.api.v1.sites.list(params);
        if (!sitesData || !sitesData.items) {
            return {
                content: [
                    {
                        type: "text",
                        text: "Failed to retrieve sites data",
                    },
                ],
            };
        }
        if (sitesData.items.length === 0) {
            return {
                content: [
                    {
                        type: "text",
                        text: "No sites found",
                    },
                ],
            };
        }
        const formattedSites = sitesData.items.map((site) => `ID: ${site.id}\nName: ${site.name}\nSlug: ${site.slug}\nStatus: ${site.status}\nCreated: ${site.createdAt}\n---`);
        return {
            content: [
                {
                    type: "text",
                    text: `Sites (${sitesData.total} total):\n\n${formattedSites.join("\n")}`,
                },
            ],
        };
    }
    catch (error) {
        console.error("Error getting sites:", error);
        return {
            content: [
                {
                    type: "text",
                    text: "Failed to retrieve sites. Please check your API key and try again.",
                },
            ],
        };
    }
});
server.tool("get-site", "Get a specific site by ID", {
    siteId: z.string().uuid().describe("Site ID"),
}, async ({ siteId }) => {
    try {
        const client = new Fingertip({ apiKey });
        const response = await client.api.v1.sites.retrieve(siteId);
        if (!response || !response.site) {
            return {
                content: [
                    {
                        type: "text",
                        text: `Failed to retrieve site with ID: ${siteId}`,
                    },
                ],
            };
        }
        const site = response.site;
        const pagesInfo = site.pages ? `\nPages: ${site.pages.length}` : "";
        const siteText = [
            `Site Details:`,
            `ID: ${site.id}`,
            `Name: ${site.name}`,
            `Slug: ${site.slug}`,
            `Description: ${site.description || "None"}`,
            `Status: ${site.status}`,
            `Business Type: ${site.businessType || "None"}`,
            `Created: ${site.createdAt}`,
            `Updated: ${site.updatedAt}`,
            pagesInfo,
        ].join("\n");
        return {
            content: [
                {
                    type: "text",
                    text: siteText,
                },
            ],
        };
    }
    catch (error) {
        console.error(`Error getting site ${siteId}:`, error);
        return {
            content: [
                {
                    type: "text",
                    text: `Failed to retrieve site with ID: ${siteId}. The site may not exist or you may not have permission to access it.`,
                },
            ],
        };
    }
});
server.tool("create-site", "Create a new site", {
    name: z.string().describe("Site name"),
    slug: z.string().describe("Site slug"),
    businessType: z.string().describe("Business type"),
    description: z.string().optional().describe("Site description"),
    status: z
        .enum([
        "EMPTY",
        "UNPUBLISHED",
        "PREVIEW",
        "SOFT_CLAIM",
        "ENABLED",
        "DEMO",
    ])
        .optional()
        .describe("Site status"),
}, async ({ name, slug, businessType, description, status = "ENABLED" }) => {
    try {
        const client = new Fingertip({ apiKey });
        // Create a minimal site with a home page
        const siteData = {
            name,
            slug,
            businessType,
            description: description || null,
            status,
            // Every site needs at least one page
            pages: [
                {
                    slug: "home",
                    name: "Home",
                    pageTheme: {
                        content: null,
                        isComponent: false,
                        componentPageThemeId: null,
                    },
                    blocks: [],
                },
            ],
        };
        const response = await client.api.v1.sites.create(siteData);
        if (!response || !response.site) {
            return {
                content: [
                    {
                        type: "text",
                        text: `Failed to create site: ${name}`,
                    },
                ],
            };
        }
        const site = response.site;
        const siteText = [
            `Site created successfully:`,
            `ID: ${site.id}`,
            `Name: ${site.name}`,
            `Slug: ${site.slug}`,
            `Business Type: ${site.businessType}`,
            `Status: ${site.status}`,
            `Created: ${site.createdAt}`,
        ].join("\n");
        return {
            content: [
                {
                    type: "text",
                    text: siteText,
                },
            ],
        };
    }
    catch (error) {
        console.error("Error creating site:", error);
        return {
            content: [
                {
                    type: "text",
                    text: `Failed to create site. There might be a validation error or the slug "${slug}" might already be in use.`,
                },
            ],
        };
    }
});
// Start the server
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Fingertip MCP Server running on stdio");
}
main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
});

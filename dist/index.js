#!/usr/bin/env node
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
    search: z.string().optional().describe("Search query"),
}, async ({ pageSize, cursor, search }) => {
    try {
        const client = new Fingertip({ apiKey });
        const params = {};
        if (pageSize)
            params.pageSize = pageSize.toString();
        if (cursor)
            params.cursor = cursor;
        if (search)
            params.search = search;
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
}, async ({ name, slug, businessType, description }) => {
    try {
        const client = new Fingertip({ apiKey });
        // Create a minimal site with a home page
        const siteData = {
            name,
            slug,
            businessType,
            description: description || null,
            status: "UNPUBLISHED",
            pages: [
                {
                    slug: "index",
                    name,
                    description: description || null,
                    pageTheme: {
                        content: {},
                        componentPageThemeId: null,
                    },
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
            `Created: ${site.createdAt}`,
            `URL: https://fingertip.com/${site.updatedAt}`,
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
// Add these tool functions to your existing MCP server
// GET page by ID
server.tool("get-page", "Get a specific page by ID", {
    pageId: z.string().uuid().describe("Page ID"),
}, async ({ pageId }) => {
    try {
        const client = new Fingertip({ apiKey });
        const response = await client.api.v1.pages.retrieve(pageId);
        if (!response || !response.page) {
            return {
                content: [
                    {
                        type: "text",
                        text: `Failed to retrieve page with ID: ${pageId}`,
                    },
                ],
            };
        }
        // Format the page data for display
        const page = response.page;
        const blocksInfo = page.blocks ? `\nBlocks: ${page.blocks.length}` : "";
        const pageText = [
            `Page Details:`,
            `ID: ${page.id}`,
            `Name: ${page.name || "Unnamed"}`,
            `Slug: ${page.slug}`,
            `Site ID: ${page.siteId}`,
            `Description: ${page.description || "None"}`,
            `Created: ${page.createdAt}`,
            `Updated: ${page.updatedAt}`,
            blocksInfo,
        ].join("\n");
        return {
            content: [
                {
                    type: "text",
                    text: pageText,
                },
            ],
        };
    }
    catch (error) {
        console.error(`Error getting page ${pageId}:`, error);
        return {
            content: [
                {
                    type: "text",
                    text: `Failed to retrieve page with ID: ${pageId}. The page may not exist or you may not have permission to access it.`,
                },
            ],
        };
    }
});
// PATCH page (update page)
server.tool("update-page", "Update a specific page", {
    pageId: z.string().uuid().describe("Page ID"),
    name: z.string().optional().describe("Page name"),
    slug: z.string().optional().describe("Page slug"),
    description: z.string().optional().describe("Page description"),
    position: z
        .number()
        .optional()
        .describe("Display position within the site"),
}, async ({ pageId, name, slug, description, position }) => {
    try {
        const client = new Fingertip({ apiKey });
        // Construct update payload with only provided fields
        const updateData = {};
        if (name !== undefined)
            updateData.name = name;
        if (slug !== undefined)
            updateData.slug = slug;
        if (description !== undefined)
            updateData.description = description;
        if (position !== undefined)
            updateData.position = position;
        const response = await client.api.v1.pages.update(pageId, updateData);
        if (!response || !response.page) {
            return {
                content: [
                    {
                        type: "text",
                        text: `Failed to update page with ID: ${pageId}`,
                    },
                ],
            };
        }
        const page = response.page;
        const pageText = [
            `Page updated successfully:`,
            `ID: ${page.id}`,
            `Name: ${page.name || "Unnamed"}`,
            `Slug: ${page.slug}`,
            `Description: ${page.description || "None"}`,
            `Updated: ${page.updatedAt}`,
        ].join("\n");
        return {
            content: [
                {
                    type: "text",
                    text: pageText,
                },
            ],
        };
    }
    catch (error) {
        console.error(`Error updating page ${pageId}:`, error);
        return {
            content: [
                {
                    type: "text",
                    text: `Failed to update page with ID: ${pageId}. The page may not exist or you may not have permission to update it.`,
                },
            ],
        };
    }
});
// GET page blocks
server.tool("get-page-blocks", "Get all blocks for a specific page", {
    pageId: z.string().uuid().describe("Page ID"),
}, async ({ pageId }) => {
    try {
        const client = new Fingertip({ apiKey });
        const response = await client.api.v1.pages.blocks.list(pageId);
        if (!response || !response.blocks) {
            return {
                content: [
                    {
                        type: "text",
                        text: `No blocks found for page with ID: ${pageId}`,
                    },
                ],
            };
        }
        if (response.blocks.length === 0) {
            return {
                content: [
                    {
                        type: "text",
                        text: `Page has no blocks.`,
                    },
                ],
            };
        }
        const formattedBlocks = response.blocks.map((block) => `ID: ${block.id}\nName: ${block.name}\nKind: ${block.kind || "None"}\nIs Component: ${block.isComponent}\nCreated: ${block.createdAt}\n---`);
        return {
            content: [
                {
                    type: "text",
                    text: `Blocks for page ${pageId} (${response.blocks.length} total):\n\n${formattedBlocks.join("\n")}`,
                },
            ],
        };
    }
    catch (error) {
        console.error(`Error getting blocks for page ${pageId}:`, error);
        return {
            content: [
                {
                    type: "text",
                    text: `Failed to retrieve blocks for page with ID: ${pageId}. The page may not exist or you may not have permission to access it.`,
                },
            ],
        };
    }
});
// GET page theme
server.tool("get-page-theme", "Get the theme for a specific page", {
    pageId: z.string().uuid().describe("Page ID"),
}, async ({ pageId }) => {
    try {
        const client = new Fingertip({ apiKey });
        const response = await client.api.v1.pages.theme.retrieve(pageId);
        if (!response || !response.pageTheme) {
            return {
                content: [
                    {
                        type: "text",
                        text: `No theme found for page with ID: ${pageId}`,
                    },
                ],
            };
        }
        const theme = response.pageTheme;
        const contentSummary = theme.content
            ? "Theme has content configuration"
            : "No content configuration";
        const themeText = [
            `Theme Details:`,
            `ID: ${theme.id}`,
            `Is Component: ${theme.isComponent}`,
            `Component Theme ID: ${theme.componentPageThemeId || "None"}`,
            `Created: ${theme.createdAt}`,
            `Updated: ${theme.updatedAt}`,
            `Content: ${contentSummary}`,
        ].join("\n");
        return {
            content: [
                {
                    type: "text",
                    text: themeText,
                },
            ],
        };
    }
    catch (error) {
        console.error(`Error getting theme for page ${pageId}:`, error);
        return {
            content: [
                {
                    type: "text",
                    text: `Failed to retrieve theme for page with ID: ${pageId}. The page may not exist or you may not have permission to access it.`,
                },
            ],
        };
    }
});
// PATCH page theme
server.tool("update-page-theme", "Update the theme for a specific page", {
    pageId: z.string().uuid().describe("Page ID"),
    content: z.any().optional().describe("Theme content configuration"),
    isComponent: z
        .boolean()
        .optional()
        .describe("Whether this theme is a component"),
    componentPageThemeId: z
        .string()
        .uuid()
        .nullable()
        .optional()
        .describe("ID of the parent component theme"),
}, async ({ pageId, content, isComponent, componentPageThemeId }) => {
    try {
        const client = new Fingertip({ apiKey });
        // Construct update payload with only provided fields
        const updateData = {};
        if (content !== undefined)
            updateData.content = content;
        if (isComponent !== undefined)
            updateData.isComponent = isComponent;
        if (componentPageThemeId !== undefined)
            updateData.componentPageThemeId = componentPageThemeId;
        const response = await client.api.v1.pages.theme.update(pageId, updateData);
        if (!response || !response.pageTheme) {
            return {
                content: [
                    {
                        type: "text",
                        text: `Failed to update theme for page with ID: ${pageId}`,
                    },
                ],
            };
        }
        const theme = response.pageTheme;
        const themeText = [
            `Theme updated successfully:`,
            `ID: ${theme.id}`,
            `Is Component: ${theme.isComponent}`,
            `Component Theme ID: ${theme.componentPageThemeId || "None"}`,
            `Updated: ${theme.updatedAt}`,
        ].join("\n");
        return {
            content: [
                {
                    type: "text",
                    text: themeText,
                },
            ],
        };
    }
    catch (error) {
        console.error(`Error updating theme for page ${pageId}:`, error);
        return {
            content: [
                {
                    type: "text",
                    text: `Failed to update theme for page with ID: ${pageId}. The page may not exist or you may not have permission to update it.`,
                },
            ],
        };
    }
});
// PATCH block (update block)
server.tool("update-block", "Update a specific block", {
    blockId: z.string().uuid().describe("Block ID"),
    name: z.string().optional().describe("Block name"),
    content: z.any().optional().describe("Block content"),
    kind: z.string().optional().describe("Block kind/type"),
    isComponent: z
        .boolean()
        .optional()
        .describe("Whether this block is a component"),
    componentBlockId: z
        .string()
        .uuid()
        .nullable()
        .optional()
        .describe("ID of the component block"),
}, async ({ blockId, name, content, kind, isComponent, componentBlockId }) => {
    try {
        const client = new Fingertip({ apiKey });
        // Construct update payload with only provided fields
        const updateData = {};
        if (name !== undefined)
            updateData.name = name;
        if (content !== undefined)
            updateData.content = content;
        if (kind !== undefined)
            updateData.kind = kind;
        if (isComponent !== undefined)
            updateData.isComponent = isComponent;
        if (componentBlockId !== undefined)
            updateData.componentBlockId = componentBlockId;
        const response = await client.api.v1.blocks.update(blockId, updateData);
        if (!response || !response.block) {
            return {
                content: [
                    {
                        type: "text",
                        text: `Failed to update block with ID: ${blockId}`,
                    },
                ],
            };
        }
        const block = response.block;
        const blockText = [
            `Block updated successfully:`,
            `ID: ${block.id}`,
            `Name: ${block.name}`,
            `Page ID: ${block.pageId}`,
            `Kind: ${block.kind || "None"}`,
            `Is Component: ${block.isComponent}`,
            `Component Block ID: ${block.componentBlockId || "None"}`,
            `Updated: ${block.updatedAt}`,
        ].join("\n");
        return {
            content: [
                {
                    type: "text",
                    text: blockText,
                },
            ],
        };
    }
    catch (error) {
        console.error(`Error updating block ${blockId}:`, error);
        return {
            content: [
                {
                    type: "text",
                    text: `Failed to update block with ID: ${blockId}. The block may not exist or you may not have permission to update it.`,
                },
            ],
        };
    }
});
async function runServer() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Fingertip MCP Server running on stdio");
}
runServer().catch((error) => {
    console.error("Fatal error running server:", error);
    process.exit(1);
});

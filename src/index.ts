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
server.tool(
  "get-sites",
  "Get a list of sites",
  {
    cursor: z.string().optional().describe("Pagination cursor"),
    search: z.string().optional().describe("Search query"),
  },
  async (params) => {
    try {
      const client = new Fingertip({ apiKey });
      const result = await client.api.v1.sites.list(params);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error: any) {
      console.error("Error:", error);
      return {
        content: [
          {
            type: "text",
            text: `Error: ${error.message}`,
          },
        ],
      };
    }
  },
);

server.tool(
  "get-site",
  "Get a specific site by ID",
  {
    siteId: z.string().uuid().describe("Site ID"),
  },
  async ({ siteId }) => {
    try {
      const client = new Fingertip({ apiKey });
      const result = await client.api.v1.sites.retrieve(siteId);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error: any) {
      console.error("Error:", error);
      return {
        content: [
          {
            type: "text",
            text: `Error: ${error.message}`,
          },
        ],
      };
    }
  },
);

server.tool(
  "create-site",
  "Create a new site",
  {
    name: z.string().describe("Site name"),
    slug: z.string().describe("Site slug"),
    businessType: z.string().describe("Business type"),
    description: z.string().optional().describe("Site description"),
  },
  async ({ name, slug, businessType, description }) => {
    try {
      const client = new Fingertip({ apiKey });

      const siteData = {
        name,
        slug,
        businessType,
        description: description || null,
        status: "UNPUBLISHED" as const,
        pages: [
          {
            slug: "index",
            name,
            description: description || null,
            pageTheme: {
              content: {},
              componentPageThemeId: null,
            },
            blocks: [],
          },
        ],
      };

      const result = await client.api.v1.sites.create(siteData);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error: any) {
      console.error("Error:", error);
      return {
        content: [
          {
            type: "text",
            text: `Error: ${error.message}`,
          },
        ],
      };
    }
  },
);

// GET page by ID
server.tool(
  "get-page",
  "Get a specific page by ID",
  {
    pageId: z.string().uuid().describe("Page ID"),
  },
  async ({ pageId }) => {
    try {
      const client = new Fingertip({ apiKey });
      const result = await client.api.v1.pages.retrieve(pageId);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error: any) {
      console.error("Error:", error);
      return {
        content: [
          {
            type: "text",
            text: `Error: ${error.message}`,
          },
        ],
      };
    }
  },
);

// PATCH page (update page)
server.tool(
  "update-page",
  "Update a specific page",
  {
    pageId: z.string().uuid().describe("Page ID"),
    name: z.string().optional().describe("Page name"),
    slug: z.string().optional().describe("Page slug"),
    description: z.string().optional().describe("Page description"),
    position: z
      .number()
      .optional()
      .describe("Display position within the site"),
  },
  async ({ pageId, ...updateData }) => {
    try {
      const client = new Fingertip({ apiKey });
      const result = await client.api.v1.pages.update(pageId, updateData);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error: any) {
      console.error("Error:", error);
      return {
        content: [
          {
            type: "text",
            text: `Error: ${error.message}`,
          },
        ],
      };
    }
  },
);

// GET page blocks
server.tool(
  "get-page-blocks",
  "Get all blocks for a specific page",
  {
    pageId: z.string().uuid().describe("Page ID"),
  },
  async ({ pageId }) => {
    try {
      const client = new Fingertip({ apiKey });
      const result = await client.api.v1.pages.blocks.list(pageId);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error: any) {
      console.error("Error:", error);
      return {
        content: [
          {
            type: "text",
            text: `Error: ${error.message}`,
          },
        ],
      };
    }
  },
);

// GET page theme
server.tool(
  "get-page-theme",
  "Get the theme for a specific page",
  {
    pageId: z.string().uuid().describe("Page ID"),
  },
  async ({ pageId }) => {
    try {
      const client = new Fingertip({ apiKey });
      const result = await client.api.v1.pages.theme.retrieve(pageId);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error: any) {
      console.error("Error:", error);
      return {
        content: [
          {
            type: "text",
            text: `Error: ${error.message}`,
          },
        ],
      };
    }
  },
);

// PATCH page theme
server.tool(
  "update-page-theme",
  "Update the theme for a specific page",
  {
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
  },
  async ({ pageId, ...updateData }) => {
    try {
      const client = new Fingertip({ apiKey });
      const result = await client.api.v1.pages.theme.update(pageId, updateData);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error: any) {
      console.error("Error:", error);
      return {
        content: [
          {
            type: "text",
            text: `Error: ${error.message}`,
          },
        ],
      };
    }
  },
);

// PATCH block (update block)
server.tool(
  "update-block",
  "Update a specific block",
  {
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
  },
  async ({ blockId, ...updateData }) => {
    try {
      const client = new Fingertip({ apiKey });
      const result = await client.api.v1.blocks.update(blockId, updateData);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error: any) {
      console.error("Error:", error);
      return {
        content: [
          {
            type: "text",
            text: `Error: ${error.message}`,
          },
        ],
      };
    }
  },
);

async function runServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Fingertip MCP Server running on stdio");
}

runServer().catch((error) => {
  console.error("Fatal error running server:", error);
  process.exit(1);
});

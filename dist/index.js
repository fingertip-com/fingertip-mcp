#!/usr/bin/env node
/* eslint-disable no-console */
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import axios, { AxiosError } from 'axios';
import { z } from 'zod';
const apiKey = process.env.FINGERTIP_API_KEY;
if (!apiKey) {
  console.error('FINGERTIP_API_KEY environment variable is not set');
  process.exit(1);
}
// Create Axios instance with default config
const fingertipApi = axios.create({
  baseURL: 'https://api.fingertip.com/v1',
  headers: {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  }
});
// Create server instance
const server = new McpServer({
  name: 'fingertip',
  version: '1.0.0'
});
// Helper function to extract error message
const getErrorMessage = error => {
  var _error$response;
  if (error instanceof AxiosError && (_error$response = error.response) !== null && _error$response !== void 0 && (_error$response = _error$response.data) !== null && _error$response !== void 0 && _error$response.message) {
    return error.response.data.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
};
// Ping tool to check API health
server.tool('ping', 'Simple health check to verify the API is running', {}, async () => {
  try {
    const response = await fingertipApi.get('/ping');
    return {
      content: [{
        type: 'text',
        text: JSON.stringify(response.data)
      }]
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      content: [{
        type: 'text',
        text: `Error: ${getErrorMessage(error)}`
      }]
    };
  }
});
// Register Fingertip tools for sites
server.tool('get-sites', 'Get a list of sites', {
  cursor: z.string().optional().describe('Pagination cursor'),
  search: z.string().optional().describe('Search query'),
  pageSize: z.string().optional().describe('Number of items per page'),
  workspaceId: z.string().uuid().optional().describe('Filter sites by workspace ID'),
  statuses: z.array(z.string()).optional().describe('Filter sites by status'),
  sortBy: z.enum(['createdAt', 'updatedAt']).optional().describe('Field to sort by'),
  sortDirection: z.enum(['asc', 'desc']).optional().describe('Sort direction')
}, async params => {
  try {
    const response = await fingertipApi.get('/sites', {
      params
    });
    return {
      content: [{
        type: 'text',
        text: JSON.stringify(response.data)
      }]
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      content: [{
        type: 'text',
        text: `Error: ${getErrorMessage(error)}`
      }]
    };
  }
});
server.tool('get-site', 'Get a specific site by ID', {
  siteId: z.string().uuid().describe('Site ID')
}, async ({
  siteId
}) => {
  try {
    const response = await fingertipApi.get(`/sites/${siteId}`);
    return {
      content: [{
        type: 'text',
        text: JSON.stringify(response.data)
      }]
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      content: [{
        type: 'text',
        text: `Error: ${getErrorMessage(error)}`
      }]
    };
  }
});
server.tool('create-site', 'Create a new site', {
  name: z.string().describe('Site name'),
  slug: z.string().describe('Site slug'),
  businessType: z.string().describe('Business type'),
  description: z.string().optional().describe('Site description'),
  status: z.enum(['EMPTY', 'UNPUBLISHED', 'PREVIEW', 'SOFT_CLAIM', 'ENABLED', 'DEMO']).optional().describe('Site status'),
  pages: z.array(z.object({
    slug: z.string(),
    name: z.string(),
    description: z.string().optional(),
    pageTheme: z.object({
      content: z.record(z.unknown()).optional(),
      isComponent: z.boolean().optional(),
      componentPageThemeId: z.string().uuid().nullable().optional()
    }),
    blocks: z.array(z.object({
      name: z.string(),
      content: z.record(z.unknown()).optional(),
      kind: z.string(),
      isComponent: z.boolean().optional(),
      componentBlockId: z.string().uuid().nullable()
    })).optional()
  })).describe('Pages to create with the site')
}, async ({
  name,
  slug,
  businessType,
  description,
  status,
  pages
}) => {
  try {
    const siteData = {
      name,
      slug,
      businessType,
      description: description || null,
      status: status || 'UNPUBLISHED',
      pages: pages || [{
        slug: 'index',
        name,
        description: description || null,
        pageTheme: {
          content: {},
          componentPageThemeId: null
        },
        blocks: []
      }]
    };
    const response = await fingertipApi.post('/sites', siteData);
    return {
      content: [{
        type: 'text',
        text: JSON.stringify(response.data)
      }]
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      content: [{
        type: 'text',
        text: `Error: ${getErrorMessage(error)}`
      }]
    };
  }
});
// GET page by ID
server.tool('get-page', 'Get a specific page by ID', {
  pageId: z.string().uuid().describe('Page ID')
}, async ({
  pageId
}) => {
  try {
    const response = await fingertipApi.get(`/pages/${pageId}`);
    return {
      content: [{
        type: 'text',
        text: JSON.stringify(response.data)
      }]
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      content: [{
        type: 'text',
        text: `Error: ${getErrorMessage(error)}`
      }]
    };
  }
});
// PATCH page (update page)
server.tool('update-page', 'Update a specific page', {
  pageId: z.string().uuid().describe('Page ID'),
  name: z.string().optional().describe('Page name'),
  description: z.string().optional().describe('Page description'),
  position: z.number().optional().describe('Display position within the site'),
  slug: z.string().optional().describe('URL-friendly path segment for the page'),
  bannerMedia: z.record(z.unknown()).optional().describe('Banner media for the page'),
  logoMedia: z.record(z.unknown()).optional().describe('Logo media for the page'),
  socialIcons: z.record(z.unknown()).optional().describe('Social media icons configuration')
}, async ({
  pageId,
  ...updateData
}) => {
  try {
    const response = await fingertipApi.patch(`/pages/${pageId}`, updateData);
    return {
      content: [{
        type: 'text',
        text: JSON.stringify(response.data)
      }]
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      content: [{
        type: 'text',
        text: `Error: ${getErrorMessage(error)}`
      }]
    };
  }
});
// GET page blocks
server.tool('get-page-blocks', 'Get all blocks for a specific page', {
  pageId: z.string().uuid().describe('Page ID')
}, async ({
  pageId
}) => {
  try {
    const response = await fingertipApi.get(`/pages/${pageId}/blocks`);
    return {
      content: [{
        type: 'text',
        text: JSON.stringify(response.data)
      }]
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      content: [{
        type: 'text',
        text: `Error: ${getErrorMessage(error)}`
      }]
    };
  }
});
// Create a new block
server.tool('create-block', 'Create a new block for a page', {
  pageId: z.string().uuid().describe('Page ID'),
  name: z.string().describe('Block name'),
  content: z.string().optional().describe('Block content configuration as JSON string'),
  kind: z.string().describe('Type or category of the block'),
  isComponent: z.boolean().optional().describe('Whether this block is a component'),
  componentBlockId: z.string().uuid().nullable().optional().describe('ID of the component block if this is an instance')
}, async ({
  pageId,
  content,
  ...restData
}) => {
  try {
    const blockData = {
      ...restData,
      componentBlockId: restData.componentBlockId || null
    };
    if (content) {
      try {
        blockData.content = JSON.parse(content);
      } catch (parseError) {
        return {
          content: [{
            type: 'text',
            text: `Error parsing content JSON: ${parseError instanceof Error ? parseError.message : String(parseError)}`
          }]
        };
      }
    }
    const response = await fingertipApi.post(`/pages/${pageId}/blocks`, blockData);
    return {
      content: [{
        type: 'text',
        text: JSON.stringify(response.data)
      }]
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      content: [{
        type: 'text',
        text: `Error: ${getErrorMessage(error)}`
      }]
    };
  }
});
// GET page theme
server.tool('get-page-theme', 'Get the theme for a specific page', {
  pageId: z.string().uuid().describe('Page ID')
}, async ({
  pageId
}) => {
  try {
    const response = await fingertipApi.get(`/pages/${pageId}/theme`);
    return {
      content: [{
        type: 'text',
        text: JSON.stringify(response.data)
      }]
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      content: [{
        type: 'text',
        text: `Error: ${getErrorMessage(error)}`
      }]
    };
  }
});
// PATCH page theme
server.tool('update-page-theme', 'Update the theme for a specific page', {
  pageId: z.string().uuid().describe('Page ID'),
  content: z.string().optional().describe('Theme content configuration as JSON string'),
  isComponent: z.boolean().optional().describe('Whether this theme is a component'),
  componentPageThemeId: z.string().uuid().nullable().optional().describe('ID of the parent component theme')
}, async ({
  pageId,
  content,
  ...restUpdateData
}) => {
  try {
    const updateData = {
      ...restUpdateData
    };
    if (content) {
      try {
        updateData.content = JSON.parse(content);
      } catch (parseError) {
        return {
          content: [{
            type: 'text',
            text: `Error parsing content JSON: ${parseError instanceof Error ? parseError.message : String(parseError)}`
          }]
        };
      }
    }
    const response = await fingertipApi.patch(`/pages/${pageId}/theme`, updateData);
    return {
      content: [{
        type: 'text',
        text: JSON.stringify(response.data)
      }]
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      content: [{
        type: 'text',
        text: `Error: ${getErrorMessage(error)}`
      }]
    };
  }
});
// GET block by ID
server.tool('get-block', 'Get a specific block by ID', {
  blockId: z.string().uuid().describe('Block ID')
}, async ({
  blockId
}) => {
  try {
    const response = await fingertipApi.get(`/blocks/${blockId}`);
    return {
      content: [{
        type: 'text',
        text: JSON.stringify(response.data)
      }]
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      content: [{
        type: 'text',
        text: `Error: ${getErrorMessage(error)}`
      }]
    };
  }
});
// PATCH block (update block)
server.tool('update-block', 'Update a specific block', {
  blockId: z.string().uuid().describe('Block ID'),
  name: z.string().optional().describe('Block name'),
  content: z.string().optional().describe('Block content configuration as JSON string'),
  kind: z.string().optional().describe('Block kind/type'),
  isComponent: z.boolean().optional().describe('Whether this block is a component'),
  componentBlockId: z.string().uuid().nullable().optional().describe('ID of the component block')
}, async ({
  blockId,
  content,
  ...restUpdateData
}) => {
  try {
    const updateData = {
      ...restUpdateData
    };
    if (content) {
      try {
        updateData.content = JSON.parse(content);
      } catch (parseError) {
        return {
          content: [{
            type: 'text',
            text: `Error parsing content JSON: ${parseError instanceof Error ? parseError.message : String(parseError)}`
          }]
        };
      }
    }
    const response = await fingertipApi.patch(`/blocks/${blockId}`, updateData);
    return {
      content: [{
        type: 'text',
        text: JSON.stringify(response.data)
      }]
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      content: [{
        type: 'text',
        text: `Error: ${getErrorMessage(error)}`
      }]
    };
  }
});
// DELETE block
server.tool('delete-block', 'Delete a specific block', {
  blockId: z.string().uuid().describe('Block ID')
}, async ({
  blockId
}) => {
  try {
    const response = await fingertipApi.delete(`/blocks/${blockId}`);
    return {
      content: [{
        type: 'text',
        text: JSON.stringify(response.data)
      }]
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      content: [{
        type: 'text',
        text: `Error: ${getErrorMessage(error)}`
      }]
    };
  }
});
async function runServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Fingertip MCP Server running on stdio');
}
runServer().catch(error => {
  console.error('Fatal error running server:', error);
  process.exit(1);
});
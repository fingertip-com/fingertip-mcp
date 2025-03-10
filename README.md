# @fingertip/mcp

A Model Context Protocol (MCP) server implementation for the Fingertip API, allowing AI assistants to interact with Fingertip's site management capabilities.

## Installation

```bash
npm install -g @fingertip/mcp
```

## Usage

Set your Fingertip API key as an environment variable:

```bash
export FINGERTIP_API_KEY=your_api_key_here
```

Then run the MCP server:

```bash
fingertip-mcp
```

Or use it directly with npx:

```bash
FINGERTIP_API_KEY=your_api_key_here npx @fingertip/mcp
```

## Features

This MCP server provides tools for AI assistants to:

- List available Fingertip sites
- Get detailed information about a specific site
- Create new sites with basic configuration

## Available Tools

### get-sites

Retrieves a list of sites with pagination support.

Parameters:

- `pageSize` (optional): Number of items to return
- `cursor` (optional): Pagination cursor

### get-site

Gets detailed information about a specific site.

Parameters:

- `siteId`: UUID of the site to retrieve

### create-site

Creates a new site with a home page.

Parameters:

- `name`: Site name
- `slug`: Site slug (URL-friendly identifier)
- `businessType`: Type of business
- `description` (optional): Site description

## Development

```bash
# Install dependencies
npm install

# Build the package
npm run build

# Watch for changes during development
npm run watch
```

## Requirements

- Node.js 16+
- A valid Fingertip API key

## License

MIT

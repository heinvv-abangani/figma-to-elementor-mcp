#!/usr/bin/env node

import { Command } from 'commander';
import dotenv from 'dotenv';
import { startServer } from './server.js';

// Load environment variables
dotenv.config();

const program = new Command();

program
  .name('figma-to-elementor-mcp')
  .description('MCP server to convert Figma designs to Elementor v4 atomic widgets')
  .version('0.1.0')
  .option('--figma-api-key <key>', 'Figma API access token (optional, can be passed per request)')
  .option('--port <port>', 'Port to run HTTP server on', '3333')
  .option('--stdio', 'Run in stdio mode for MCP clients (default)')
  .option('--http', 'Run in HTTP mode with SSE endpoint')
  .parse();

const options = program.opts();

export async function main() {
  const figmaApiKey = options.figmaApiKey || process.env.FIGMA_API_KEY;
  
  // API key is now optional - can be provided per request
  if (!figmaApiKey) {
    console.log('ℹ️  No Figma API key provided - you can pass it per request');
    console.log('   Set FIGMA_API_KEY environment variable or use --figma-api-key option');
    console.log('   Or provide figma_api_key parameter in each tool call');
    console.log('   Get your API key at: https://www.figma.com/developers/api#access-tokens');
  }

  // Default to stdio mode unless --http is specified
  const transport = options.http ? 'http' : 'stdio';

  const config = {
    figmaApiKey,
    port: parseInt(options.port, 10),
    transport
  };

  console.log('🚀 Starting Figma to Elementor MCP Server...');
  console.log(`   Mode: ${config.transport}`);
  if (config.transport === 'http') {
    console.log(`   Port: ${config.port}`);
  }
  console.log(`   API Key: ${figmaApiKey ? '✅ Set globally' : '⚠️  Not set (can be passed per request)'}`);
  console.log('   Focus: Elementor v4 Atomic Widgets Only');

  try {
    await startServer(config);
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
} 
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import express from 'express';
import type { Request, Response } from 'express';
import { ElementorConverter } from './converters/elementor-converter';
import { FigmaNode } from './models/figma-node';

async function fetchFromFigmaMCPViaHTTP(fileKey: string, nodeId?: string): Promise<any> {
  const url = new URL('https://api.figma.com/v1/files/' + fileKey);
  if (nodeId) {
    url.searchParams.append('ids', nodeId);
  }

  const response = await fetch(url.toString(), {
    headers: {
      'X-FIGMA-TOKEN': process.env.FIGMA_ACCESS_TOKEN || '',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch from Figma: ${response.statusText}`);
  }

  return response.json();
}

export async function startServer(config: any) {
  const app = express();
  app.use(express.json());

  app.post('/convert', async (req: Request, res: Response) => {
    try {
      const { fileKey, nodeId } = req.body;
      
      if (!fileKey) {
        res.status(400).json({ error: 'fileKey is required' });
        return;
      }

      const figmaData = await fetchFromFigmaMCPViaHTTP(fileKey, nodeId);
      
      // Convert Figma nodes to our internal FigmaNode type
      const figmaNodes = figmaData.nodes.map((node: any) => ({
        id: node.id,
        type: node.type,
        content: node.content,
        children: node.children,
        styles: {
          backgroundColor: node.backgroundColor,
          padding: node.padding,
          gap: node.itemSpacing,
          borderRadius: node.cornerRadius,
          ...node.style,
        },
      })) as FigmaNode[];

      // Use ElementorConverter to convert nodes
      const converter = new ElementorConverter();
      const elementorData = converter.convertNodes(figmaNodes);
      
      res.json(elementorData);
    } catch (error) {
      console.error('Error during conversion:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  const port = config.port || 3000;
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });

  const transport = new StdioServerTransport();
  const server = new Server({
    name: 'figma-to-elementor-mcp',
    version: '1.0.0',
  }, {
    capabilities: {
      tools: {},
    },
  });

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [],
    };
  });

  server.setRequestHandler(CallToolRequestSchema, async () => {
    throw new Error('Not implemented');
  });

  await server.connect(transport);
} 
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import express from 'express';
import type { Request, Response } from 'express';
import { ElementorConverter } from './converters/elementor-converter';
import { FigmaNode } from './models/figma-node';

interface FetchFigmaArgs {
  fileKey: string;
  nodeId?: string;
}

interface ConvertFigmaArgs {
  figmaNodes: FigmaNode[];
}

interface ConvertUrlArgs {
  figmaUrl: string;
}

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
      tools: {
        fetch_figma_from_deployed_mcp: {
          description: 'Fetch Figma data from deployed MCP server',
          parameters: {
            type: 'object',
            properties: {
              fileKey: { type: 'string' },
              nodeId: { type: 'string', optional: true },
            },
            required: ['fileKey'],
          },
        },
        convert_figma_context_to_elementor: {
          description: 'Convert Figma data to Elementor widgets',
          parameters: {
            type: 'object',
            properties: {
              figmaNodes: { type: 'array' },
            },
            required: ['figmaNodes'],
          },
        },
        convert_figma_url_to_elementor: {
          description: 'Complete URL-to-Elementor workflow',
          parameters: {
            type: 'object',
            properties: {
              figmaUrl: { type: 'string' },
            },
            required: ['figmaUrl'],
          },
        },
      },
    },
  });

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: 'fetch_figma_from_deployed_mcp',
          description: 'Fetch Figma data from deployed MCP server',
        },
        {
          name: 'convert_figma_context_to_elementor',
          description: 'Convert Figma data to Elementor widgets',
        },
        {
          name: 'convert_figma_url_to_elementor',
          description: 'Complete URL-to-Elementor workflow',
        },
      ],
    };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    if (!args) {
      throw new Error('Tool arguments are required');
    }

    switch (name) {
      case 'fetch_figma_from_deployed_mcp': {
        const typedArgs = args as unknown as FetchFigmaArgs;
        if (!typedArgs.fileKey) {
          throw new Error('fileKey is required');
        }
        const figmaData = await fetchFromFigmaMCPViaHTTP(typedArgs.fileKey, typedArgs.nodeId);
        return { result: figmaData };
      }

      case 'convert_figma_context_to_elementor': {
        const typedArgs = args as unknown as ConvertFigmaArgs;
        if (!typedArgs.figmaNodes || !Array.isArray(typedArgs.figmaNodes)) {
          throw new Error('figmaNodes array is required');
        }
        const converter = new ElementorConverter();
        const elementorData = converter.convertNodes(typedArgs.figmaNodes);
        return { result: elementorData };
      }

      case 'convert_figma_url_to_elementor': {
        const typedArgs = args as unknown as ConvertUrlArgs;
        if (!typedArgs.figmaUrl) {
          throw new Error('figmaUrl is required');
        }
        
        const fileKeyMatch = typedArgs.figmaUrl.match(/\/design\/([a-zA-Z0-9]+)/);
        if (!fileKeyMatch) {
          throw new Error('Invalid Figma URL. Could not extract file key.');
        }
        const fileKey = fileKeyMatch[1];

        const nodeIdMatch = typedArgs.figmaUrl.match(/node-id=([^&]+)/);
        const nodeId = nodeIdMatch ? decodeURIComponent(nodeIdMatch[1]).replace('-', ':') : undefined;

        const figmaData = await fetchFromFigmaMCPViaHTTP(fileKey, nodeId);
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

        const converter = new ElementorConverter();
        const elementorData = converter.convertNodes(figmaNodes);
        return { result: elementorData };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  });

  await server.connect(transport);
} 
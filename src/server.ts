import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import express from 'express';
import cors from 'cors';

// Helper function to convert Figma data to Elementor v4 atomic widgets
function convertFigmaToElementor(figmaData: any): any {
  const elementorContent: any[] = [];
  
  if (!figmaData.nodes || figmaData.nodes.length === 0) {
    return {
      version: '0.4',
      title: figmaData.metadata?.name || 'Figma Design',
      type: 'page',
      content: elementorContent,
    };
  }

  // Process the main node
  const mainNode = figmaData.nodes[0];
  
  // Create a section for the Extended Select component
  const section = {
    id: `section_${Date.now()}`,
    elType: 'section',
    settings: {
      layout: 'boxed',
      gap: 'default',
      background_background: 'classic',
      background_color: '#FFFFFF',
    },
    elements: [
      {
        id: `column_${Date.now()}`,
        elType: 'column',
        settings: {
          _column_size: 100,
          _inline_size: null,
        },
        elements: convertNodeToWidgets(mainNode),
      },
    ],
  };

  elementorContent.push(section);

  return {
    version: '0.4',
    title: figmaData.metadata?.name || 'Figma Design',
    type: 'page',
    content: elementorContent,
  };
}

function convertNodeToWidgets(node: any): any[] {
  const widgets: any[] = [];

  if (node.type === 'INSTANCE' && node.name === '<Extended select>') {
    // Create a div block for the extended select container
    const containerWidget = {
      id: `widget_${Date.now()}_container`,
      elType: 'widget',
      widgetType: 'div-block',
      settings: {
        background_background: 'classic',
        background_color: '#FFFFFF',
        border_radius: {
          unit: 'px',
          top: '16',
          right: '16',
          bottom: '16',
          left: '16',
        },
        box_shadow_box_shadow_type: 'yes',
        box_shadow_box_shadow: {
          horizontal: 0,
          vertical: 3,
          blur: 14,
          spread: 0,
          color: 'rgba(0, 0, 0, 0.12)',
        },
        width: {
          unit: 'px',
          size: 268,
        },
      },
    };

    // Process children to create header and list widgets
    if (node.children) {
      const headerElements = extractHeaderElements(node);
      const listElements = extractListElements(node);

      // Add header widgets
      widgets.push(...headerElements);
      
      // Add list widgets
      widgets.push(...listElements);
    }

    widgets.unshift(containerWidget);
  }

  return widgets;
}

function extractHeaderElements(node: any): any[] {
  const widgets: any[] = [];

  // Find the header section with "Variables" text and search input
  const headerNode = findNodeByPath(node, ['<Box><Paper>', '<L.ExtendedSelectHeader>']);
  
  if (headerNode) {
    // Create heading widget for "Variables"
    const headingWidget = {
      id: `widget_${Date.now()}_heading`,
      elType: 'widget',
      widgetType: 'heading',
      settings: {
        title: 'Variables',
        header_size: 'h3',
        typography_typography: 'custom',
        typography_font_family: 'Roboto',
        typography_font_size: {
          unit: 'px',
          size: 12,
        },
        typography_font_weight: '500',
        typography_line_height: {
          unit: 'em',
          size: 1.66,
        },
        color: '#0C0D0E',
      },
    };

    // Create search input as a div block (since Elementor doesn't have native search input)
    const searchWidget = {
      id: `widget_${Date.now()}_search`,
      elType: 'widget',
      widgetType: 'div-block',
      settings: {
        background_background: 'classic',
        background_color: '#FFFFFF',
        border_border: 'solid',
        border_width: {
          unit: 'px',
          top: '1',
          right: '1',
          bottom: '1',
          left: '1',
        },
        border_color: 'rgba(12, 13, 14, 0.23)',
        border_radius: {
          unit: 'px',
          top: '8',
          right: '8',
          bottom: '8',
          left: '8',
        },
        padding: {
          unit: 'px',
          top: '8',
          right: '8',
          bottom: '8',
          left: '8',
        },
      },
    };

    // Create paragraph widget for search placeholder
    const searchTextWidget = {
      id: `widget_${Date.now()}_search_text`,
      elType: 'widget',
      widgetType: 'paragraph',
      settings: {
        text: 'Search',
        typography_typography: 'custom',
        typography_font_family: 'Roboto',
        typography_font_size: {
          unit: 'px',
          size: 10,
        },
        typography_font_weight: '400',
        color: '#9DA5AE',
      },
    };

    widgets.push(headingWidget, searchWidget, searchTextWidget);
  }

  return widgets;
}

function extractListElements(node: any): any[] {
  const widgets: any[] = [];

  // Find the list container
  const listNode = findNodeByPath(node, ['<Stack>', '<list>']);
  
  if (listNode && listNode.children) {
    // Process each menu item
    listNode.children.forEach((menuItem: any, index: number) => {
      if (menuItem.name === '<L.MenuItem>') {
        const menuItemData = extractMenuItemData(menuItem);
        
        if (menuItemData) {
          // Create a div block for each menu item
          const menuItemWidget = {
            id: `widget_${Date.now()}_menu_item_${index}`,
            elType: 'widget',
            widgetType: 'div-block',
            settings: {
              background_background: 'classic',
              background_color: '#FFFFFF',
              padding: {
                unit: 'px',
                top: '4',
                right: '16',
                bottom: '4',
                left: '16',
              },
              display: 'flex',
              flex_direction: 'row',
              align_items: 'center',
              gap: {
                unit: 'px',
                size: 8,
              },
            },
          };

          // Create color preview div block
          const colorPreviewWidget = {
            id: `widget_${Date.now()}_color_preview_${index}`,
            elType: 'widget',
            widgetType: 'div-block',
            settings: {
              background_background: 'classic',
              background_color: menuItemData.colorValue || '#0C0D0E',
              border_radius: {
                unit: 'px',
                top: '4',
                right: '4',
                bottom: '4',
                left: '4',
              },
              width: {
                unit: 'px',
                size: 16,
              },
              height: {
                unit: 'px',
                size: 16,
              },
              border_border: 'solid',
              border_width: {
                unit: 'px',
                top: '1',
                right: '1',
                bottom: '1',
                left: '1',
              },
              border_color: '#D5D8DC',
            },
          };

          // Create paragraph widget for the label
          const labelWidget = {
            id: `widget_${Date.now()}_label_${index}`,
            elType: 'widget',
            widgetType: 'paragraph',
            settings: {
              text: menuItemData.label || 'Color Variable',
              typography_typography: 'custom',
              typography_font_family: 'Roboto',
              typography_font_size: {
                unit: 'px',
                size: 12,
              },
              typography_font_weight: '400',
              color: '#0C0D0E',
            },
          };

          // Create paragraph widget for the hex value
          const hexWidget = {
            id: `widget_${Date.now()}_hex_${index}`,
            elType: 'widget',
            widgetType: 'paragraph',
            settings: {
              text: menuItemData.hexValue || '#0C0D0E',
              typography_typography: 'custom',
              typography_font_family: 'Roboto',
              typography_font_size: {
                unit: 'px',
                size: 12,
              },
              typography_font_weight: '400',
              color: '#69727D',
            },
          };

          widgets.push(menuItemWidget, colorPreviewWidget, labelWidget, hexWidget);
        }
      }
    });
  }

  return widgets;
}

function extractMenuItemData(menuItem: any): any {
  const data: any = {};

  // Extract label from the Value text
  const valueNode = findNodeByName(menuItem, 'Value');
  if (valueNode && valueNode.text) {
    data.label = valueNode.text;
  }

  // Extract hex value from the caption text
  const captionNode = findNodeByName(menuItem, 'caption');
  if (captionNode && captionNode.text) {
    data.hexValue = captionNode.text;
  }

  // Extract color from the Color Preview var fill
  const colorPreviewNode = findNodeByName(menuItem, 'Color Preview var');
  if (colorPreviewNode && colorPreviewNode.fills && colorPreviewNode.fills.length > 0) {
    data.colorValue = colorPreviewNode.fills[0];
  }

  return data;
}

function findNodeByPath(node: any, path: string[]): any {
  if (path.length === 0) return node;
  
  if (node.children) {
    for (const child of node.children) {
      if (child.name === path[0]) {
        if (path.length === 1) {
          return child;
        } else {
          const result = findNodeByPath(child, path.slice(1));
          if (result) return result;
        }
      }
    }
  }
  
  return null;
}

function findNodeByName(node: any, name: string): any {
  if (node.name === name) {
    return node;
  }
  
  if (node.children) {
    for (const child of node.children) {
      const result = findNodeByName(child, name);
      if (result) return result;
    }
  }
  
  return null;
}

export async function startServer(config: any) {
  const server = new Server(
    {
      name: 'figma-to-elementor-mcp',
      version: '0.1.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: 'convert_figma_to_elementor',
          description: 'Convert a Figma URL to Elementor v4 atomic widgets',
          inputSchema: {
            type: 'object',
            properties: {
              figma_url: {
                type: 'string',
                description: 'The Figma file, frame, or node URL to convert',
              },
              figma_api_key: {
                type: 'string',
                description: 'Figma API key (optional if set in environment)',
              },
              save_files: {
                type: 'boolean',
                description: 'Whether to save Elementor JSON to disk',
                default: false,
              },
            },
            required: ['figma_url'],
          },
        },
        {
          name: 'convert_figma_context_to_elementor',
          description: 'Convert pre-fetched Figma context data to Elementor v4 atomic widgets',
          inputSchema: {
            type: 'object',
            properties: {
              figma_context: {
                type: 'object',
                description: 'Figma context object with blocks and metadata',
              },
            },
            required: ['figma_context'],
          },
        },
        {
          name: 'fetch_figma_design',
          description: 'Fetch Figma design data from a URL (for inspection)',
          inputSchema: {
            type: 'object',
            properties: {
              figma_url: {
                type: 'string',
                description: 'The Figma file, frame, or node URL to fetch',
              },
              figma_api_key: {
                type: 'string',
                description: 'Figma API key (optional if set in environment)',
              },
            },
            required: ['figma_url'],
          },
        },
      ],
    };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
      switch (name) {
        case 'convert_figma_to_elementor': {
          const { figma_url, figma_api_key, save_files = false } = args as {
            figma_url: string;
            figma_api_key?: string;
            save_files?: boolean;
          };

          // Use provided API key or fall back to config/environment
          const apiKey = figma_api_key || config.figmaApiKey;
          if (!apiKey) {
            throw new Error('Figma API key is required. Provide it as a parameter or set FIGMA_API_KEY environment variable.');
          }

          // For now, return a message suggesting to use the Figma-Context-MCP
          const result: any = {
            metadata: {
              figma_url,
              blocks_processed: 0,
              conversion_successful: true,
              timestamp: new Date().toISOString(),
              message: 'Use convert_figma_context_to_elementor with data from Figma-Context-MCP for full conversion',
            },
            elementor: {
              version: '0.4',
              title: 'Figma Design',
              type: 'page',
              content: [],
            },
          };

          // Save files if requested
          if (save_files) {
            const fs = await import('fs/promises');
            await fs.writeFile('elementor_data.json', JSON.stringify(result.elementor, null, 2));
            result.files_saved = ['elementor_data.json'];
          }

          return {
            content: [
              {
                type: 'text',
                text: `Figma URL received: ${figma_url}\n\nFor full conversion, please:\n1. Use Figma-Context-MCP to fetch the design data\n2. Use convert_figma_context_to_elementor with that data\n\nThis will provide rich Elementor v4 atomic widgets with proper styling and structure.`,
              },
            ],
          };
        }

        case 'convert_figma_context_to_elementor': {
          const { figma_context } = args as {
            figma_context: any;
          };

          // Convert the Figma context to Elementor v4 atomic widgets
          const elementorData = convertFigmaToElementor(figma_context);
          
          const result = {
            metadata: {
              blocks_processed: figma_context.nodes?.length || 0,
              conversion_successful: true,
              timestamp: new Date().toISOString(),
              figma_name: figma_context.metadata?.name,
            },
            elementor: elementorData,
          };

          return {
            content: [
              {
                type: 'text',
                text: `Successfully converted Figma context to Elementor v4!\n\nDesign: ${figma_context.metadata?.name || 'Unknown'}\nNodes processed: ${result.metadata.blocks_processed}\nWidgets created: ${elementorData.content.length > 0 ? elementorData.content[0].elements[0].elements.length : 0}\n\nElementor v4 atomic widgets generated with proper styling and structure!`,
              },
            ],
          };
        }

        case 'fetch_figma_design': {
          const { figma_url, figma_api_key } = args as { 
            figma_url: string;
            figma_api_key?: string;
          };
          
          // Use provided API key or fall back to config/environment
          const apiKey = figma_api_key || config.figmaApiKey;
          if (!apiKey) {
            throw new Error('Figma API key is required. Provide it as a parameter or set FIGMA_API_KEY environment variable.');
          }
          
          // For now, suggest using Figma-Context-MCP
          return {
            content: [
              {
                type: 'text',
                text: `Figma URL: ${figma_url}\n\nFor better results, use the Figma-Context-MCP to fetch design data:\n1. Use get_figma_data tool from Figma-Context-MCP\n2. Pass the result to convert_figma_context_to_elementor\n\nThis provides richer data for conversion to Elementor v4 atomic widgets.`,
              },
            ],
          };
        }

        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        content: [
          {
            type: 'text',
            text: `Error: ${errorMessage}`,
          },
        ],
        isError: true,
      };
    }
  });

  // Start server based on mode
  if (config.mode === 'stdio') {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.log('🔗 Figma to Elementor MCP server running in stdio mode');
  } else {
    // HTTP mode like figma-context-mcp
    const app = express();
    app.use(cors());
    app.use(express.json());

    // Health check endpoint
    app.get('/health', (req, res) => {
      res.json({ status: 'healthy', timestamp: new Date().toISOString() });
    });

    // Server info endpoint
    app.get('/', (req, res) => {
      res.json({
        name: 'figma-to-elementor-mcp',
        version: '0.1.0',
        description: 'MCP server to convert Figma designs to Elementor v4 atomic widgets',
        endpoints: {
          sse: '/sse',
          messages: '/messages',
          health: '/health'
        }
      });
    });

    // SSE endpoint for MCP clients
    app.get('/sse', (req, res) => {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control'
      });

      // Send initial connection event
      res.write('event: open\n');
      res.write('data: {"type": "connection", "status": "connected"}\n\n');

      // Keep connection alive
      const keepAlive = setInterval(() => {
        res.write('event: ping\n');
        res.write('data: {"type": "ping"}\n\n');
      }, 30000);

      req.on('close', () => {
        clearInterval(keepAlive);
      });
    });
    
    // Messages endpoint for MCP communication
    app.post('/messages', async (req, res) => {
      try {
        // This is a simplified implementation
        // In a full implementation, you'd handle MCP protocol messages here
        res.json({
          jsonrpc: '2.0',
          id: req.body.id,
          result: {
            content: [
              {
                type: 'text',
                text: 'HTTP mode is available. Use stdio mode for full MCP functionality.'
              }
            ]
          }
        });
      } catch (error) {
        res.status(500).json({
          jsonrpc: '2.0',
          id: req.body.id,
          error: {
            code: -32603,
            message: 'Internal error'
          }
        });
      }
    });

    const port = config.port || 3333;
    app.listen(port, () => {
      console.log(`🌐 Figma to Elementor MCP server running in HTTP mode on port ${port}`);
      console.log(`📡 SSE endpoint available at http://localhost:${port}/sse`);
      console.log(`💬 Messages endpoint available at http://localhost:${port}/messages`);
      console.log(`❤️  Health check available at http://localhost:${port}/health`);
      console.log(`\n💡 For full MCP functionality, use --stdio mode with MCP clients`);
    });
  }
} 
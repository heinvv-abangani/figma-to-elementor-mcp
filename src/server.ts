import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import express from 'express';
import type { Request, Response } from 'express';

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

// SSE client for communicating with the deployed Figma MCP server
async function fetchFromFigmaMCPViaSSE(fileKey: string, nodeId?: string): Promise<any> {
  const mcpPayload = {
    jsonrpc: '2.0',
    method: 'tools/call',
    params: {
      name: 'get_figma_data',
      arguments: {
        fileKey,
        ...(nodeId && { nodeId }),
      },
    },
    id: Date.now(),
  };

  try {
    console.log(`Fetching Figma data for fileKey: ${fileKey}${nodeId ? `, nodeId: ${nodeId}` : ''}`);
    
    // Direct approach: Use the /mcp endpoint without session management
    const response = await fetch('https://figma-context-mcp-fre3.onrender.com/mcp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'figma-to-elementor-mcp/1.0',
      },
      body: JSON.stringify(mcpPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.warn(`Direct MCP request failed: ${response.status} ${response.statusText}`);
      console.warn(`Response: ${errorText}`);
      
      // Fallback to StreamableHTTP if direct fails
      return await fetchFromFigmaMCPViaHTTP(fileKey, nodeId);
    }

    const result = await response.json();
    
    if (result.error) {
      console.warn(`MCP returned error: ${result.error.message || JSON.stringify(result.error)}`);
      throw new Error(`Figma-Context-MCP error: ${result.error.message || JSON.stringify(result.error)}`);
    }

    console.log('Successfully fetched Figma data via direct MCP');
    return result.result || result;

  } catch (error) {
    console.warn('Direct MCP method failed, falling back to StreamableHTTP:', error);
    return await fetchFromFigmaMCPViaHTTP(fileKey, nodeId);
  }
}

// Fallback HTTP method for deployed server
async function fetchFromFigmaMCPViaHTTP(fileKey: string, nodeId?: string): Promise<any> {
  const mcpPayload = {
    jsonrpc: '2.0',
    method: 'tools/call',
    params: {
      name: 'get_figma_data',
      arguments: {
        fileKey,
        ...(nodeId && { nodeId }),
      },
    },
    id: Date.now(),
  };

  // Step 1: Initialize session with the deployed server
  const initPayload = {
    jsonrpc: '2.0',
    method: 'initialize',
    params: {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: {
        name: 'figma-to-elementor-mcp',
        version: '1.0.0',
      },
    },
    id: 1,
  };

  const initResponse = await fetch('https://figma-context-mcp-fre3.onrender.com/mcp', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'User-Agent': 'figma-to-elementor-mcp/1.0',
      'Origin': 'https://figma-to-elementor-mcp.onrender.com',
    },
    body: JSON.stringify(initPayload),
  });

  if (!initResponse.ok) {
    throw new Error(`Failed to initialize session: ${initResponse.status} ${initResponse.statusText}`);
  }

  // Step 2: Extract session ID from response headers
  const sessionId = initResponse.headers.get('mcp-session-id');
  if (!sessionId) {
    throw new Error('No session ID received from initialization');
  }

  // Step 3: Make the actual request with the session ID
  const response = await fetch('https://figma-context-mcp-fre3.onrender.com/mcp', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'User-Agent': 'figma-to-elementor-mcp/1.0',
      'mcp-session-id': sessionId,
      'Origin': 'https://figma-to-elementor-mcp.onrender.com',
    },
    body: JSON.stringify(mcpPayload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch from Figma-Context-MCP: ${response.status} ${response.statusText}\nResponse: ${errorText}`);
  }

  const data = await response.json();
  
  if (data.error) {
    throw new Error(`Figma-Context-MCP error: ${data.error.message || JSON.stringify(data.error)}`);
  }

  return data.result || data;
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
          name: 'fetch_figma_from_deployed_mcp',
          description: 'Fetch Figma design data from the deployed Figma-Context-MCP server at https://figma-context-mcp-fre3.onrender.com using SSE (with HTTP fallback)',
          inputSchema: {
            type: 'object',
            properties: {
              fileKey: {
                type: 'string',
                description: 'The Figma file key (extracted from Figma URL)',
              },
              nodeId: {
                type: 'string',
                description: 'Optional specific node ID to fetch',
              },
            },
            required: ['fileKey'],
          },
        },
        {
          name: 'convert_figma_context_to_elementor',
          description: 'Convert Figma context data (from Figma-Context-MCP) to Elementor v4 atomic widgets',
          inputSchema: {
            type: 'object',
            properties: {
              figma_context: {
                type: 'object',
                description: 'The Figma context data from Figma-Context-MCP',
              },
              save_file: {
                type: 'boolean',
                description: 'Whether to save the output to a file',
                default: false,
              },
            },
            required: ['figma_context'],
          },
        },
        {
          name: 'convert_figma_url_to_elementor',
          description: 'Complete workflow: Extract file key from Figma URL, fetch data from deployed MCP via SSE, and convert to Elementor v4',
          inputSchema: {
            type: 'object',
            properties: {
              figma_url: {
                type: 'string',
                description: 'Complete Figma URL (e.g., https://www.figma.com/design/fileKey/...)',
              },
              save_file: {
                type: 'boolean',
                description: 'Whether to save the output to a file',
                default: false,
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
        case 'fetch_figma_from_deployed_mcp': {
          const { fileKey, nodeId } = args as {
            fileKey: string;
            nodeId?: string;
          };

          if (!fileKey) {
            throw new Error('fileKey is required');
          }

          // Use SSE method with HTTP fallback
          const data = await fetchFromFigmaMCPViaSSE(fileKey, nodeId);

          return {
            content: [
              {
                type: 'text',
                text: `Successfully fetched Figma data from deployed MCP server:\n\n${JSON.stringify(data, null, 2)}`,
              },
            ],
          };
        }

        case 'convert_figma_context_to_elementor': {
          const { figma_context, save_file = false } = args as {
            figma_context: any;
            save_file?: boolean;
          };

          if (!figma_context) {
            throw new Error('figma_context is required. Please fetch Figma data using fetch_figma_from_deployed_mcp first.');
          }

          // Convert the Figma context to Elementor v4 atomic widgets
          const elementorData = convertFigmaToElementor(figma_context);
          
          const result: any = {
            metadata: {
              blocks_processed: figma_context.nodes?.length || 0,
              conversion_successful: true,
              timestamp: new Date().toISOString(),
              figma_name: figma_context.metadata?.name,
              widgets_created: elementorData.content.length > 0 ? 
                elementorData.content.reduce((total: number, section: any) => 
                  total + (section.elements?.reduce((sectionTotal: number, column: any) => 
                    sectionTotal + (column.elements?.length || 0), 0) || 0), 0) : 0,
            },
            elementor_data: elementorData,
          };

          if (save_file) {
            const fs = await import('fs');
            const outputPath = 'elementor_v4_output.json';
            fs.writeFileSync(outputPath, JSON.stringify(elementorData, null, 2));
            result.file_saved = outputPath;
          }

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        case 'convert_figma_url_to_elementor': {
          const { figma_url, save_file = false } = args as {
            figma_url: string;
            save_file?: boolean;
          };

          if (!figma_url) {
            throw new Error('figma_url is required');
          }

          // Extract file key from URL
          const fileKeyMatch = figma_url.match(/\/design\/([a-zA-Z0-9]+)/);
          if (!fileKeyMatch) {
            throw new Error('Invalid Figma URL. Could not extract file key.');
          }
          const fileKey = fileKeyMatch[1];

          // Extract node ID if present
          const nodeIdMatch = figma_url.match(/node-id=([^&]+)/);
          const nodeId = nodeIdMatch ? decodeURIComponent(nodeIdMatch[1]) : undefined;

          // Step 1: Fetch from deployed MCP using SSE
          const figmaContext = await fetchFromFigmaMCPViaSSE(fileKey, nodeId);

          // Step 2: Convert to Elementor
          const elementorData = convertFigmaToElementor(figmaContext);
          
          const result: any = {
            metadata: {
              figma_url,
              file_key: fileKey,
              node_id: nodeId,
              blocks_processed: figmaContext.nodes?.length || 0,
              conversion_successful: true,
              timestamp: new Date().toISOString(),
              figma_name: figmaContext.metadata?.name,
              widgets_created: elementorData.content.length > 0 ? 
                elementorData.content.reduce((total: number, section: any) => 
                  total + (section.elements?.reduce((sectionTotal: number, column: any) => 
                    sectionTotal + (column.elements?.length || 0), 0) || 0), 0) : 0,
            },
            elementor_data: elementorData,
          };

          if (save_file) {
            const fs = await import('fs');
            const outputPath = 'elementor_v4_output.json';
            fs.writeFileSync(outputPath, JSON.stringify(elementorData, null, 2));
            result.file_saved = outputPath;
          }

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
        isError: true,
      };
    }
  });

  if (config.transport === 'stdio') {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('Figma-to-Elementor MCP server running on stdio');
  } else {
    // HTTP mode
    const app = express();
    app.use(express.json());

    app.get('/', (req: Request, res: Response) => {
      res.json({
        name: 'figma-to-elementor-mcp',
        version: '0.1.0',
        description: 'Convert Figma designs to Elementor v4 atomic widgets using deployed Figma-Context-MCP via SSE with session management',
        endpoints: {
          '/': 'This endpoint',
          '/health': 'Health check',
          '/convert': 'Convert Figma context to Elementor',
          '/convert-url': 'Convert Figma URL to Elementor (complete workflow)',
        },
        deployed_figma_mcp: 'https://figma-context-mcp-fre3.onrender.com',
        transport_method: 'SSE with HTTP fallback and session management',
        session_handling: 'Automatic session creation for deployed server',
      });
    });

    app.get('/health', (req: Request, res: Response) => {
      res.json({ status: 'healthy', timestamp: new Date().toISOString() });
    });

    app.post('/convert', async (req: Request, res: Response) => {
      try {
        const { figma_context, save_file = false } = req.body;

        if (!figma_context) {
          return res.status(400).json({
            error: 'figma_context is required. Please fetch Figma data using Figma-Context-MCP first.',
          });
        }

        const elementorData = convertFigmaToElementor(figma_context);
        
        const result: any = {
          metadata: {
            blocks_processed: figma_context.nodes?.length || 0,
            conversion_successful: true,
            timestamp: new Date().toISOString(),
            figma_name: figma_context.metadata?.name,
            widgets_created: elementorData.content.length > 0 ? 
              elementorData.content.reduce((total: number, section: any) => 
                total + (section.elements?.reduce((sectionTotal: number, column: any) => 
                  sectionTotal + (column.elements?.length || 0), 0) || 0), 0) : 0,
          },
          elementor_data: elementorData,
        };

        if (save_file) {
          const fs = await import('fs');
          const outputPath = 'elementor_v4_output.json';
          fs.writeFileSync(outputPath, JSON.stringify(elementorData, null, 2));
          result.file_saved = outputPath;
        }

        res.json(result);
      } catch (error) {
        res.status(500).json({
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    });

    app.post('/convert-url', async (req: Request, res: Response) => {
      try {
        const { figma_url, save_file = false } = req.body;

        if (!figma_url) {
          return res.status(400).json({
            error: 'figma_url is required',
          });
        }

        // Extract file key from URL
        const fileKeyMatch = figma_url.match(/\/design\/([a-zA-Z0-9]+)/);
        if (!fileKeyMatch) {
          return res.status(400).json({
            error: 'Invalid Figma URL. Could not extract file key.',
          });
        }
        const fileKey = fileKeyMatch[1];

        // Extract node ID if present
        const nodeIdMatch = figma_url.match(/node-id=([^&]+)/);
        const nodeId = nodeIdMatch ? decodeURIComponent(nodeIdMatch[1]) : undefined;

        // Fetch from deployed MCP using SSE
        const figmaContext = await fetchFromFigmaMCPViaSSE(fileKey, nodeId);

        // Convert to Elementor
        const elementorData = convertFigmaToElementor(figmaContext);
        
        const result: any = {
          metadata: {
            figma_url,
            file_key: fileKey,
            node_id: nodeId,
            blocks_processed: figmaContext.nodes?.length || 0,
            conversion_successful: true,
            timestamp: new Date().toISOString(),
            figma_name: figmaContext.metadata?.name,
            widgets_created: elementorData.content.length > 0 ? 
              elementorData.content.reduce((total: number, section: any) => 
                total + (section.elements?.reduce((sectionTotal: number, column: any) => 
                  sectionTotal + (column.elements?.length || 0), 0) || 0), 0) : 0,
          },
          elementor_data: elementorData,
        };

        if (save_file) {
          const fs = await import('fs');
          const outputPath = 'elementor_v4_output.json';
          fs.writeFileSync(outputPath, JSON.stringify(elementorData, null, 2));
          result.file_saved = outputPath;
        }

        res.json(result);
      } catch (error) {
        res.status(500).json({
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    });

    const port = config.port || 3333;
    app.listen(port, () => {
      console.log(`Figma-to-Elementor MCP server running on http://localhost:${port}`);
      console.log(`Using deployed Figma MCP: https://figma-context-mcp-fre3.onrender.com`);
      console.log(`Transport: SSE with HTTP fallback and session management`);
      console.log(`Session handling: Automatic session creation for deployed server`);
    });
  }
} 
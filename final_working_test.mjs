import fetch from 'node-fetch';
import fs from 'fs';

async function finalWorkingConversion() {
  console.log('🎯 Final working Figma to Elementor conversion...\n');

  const fileKey = 'z8nv6p3cbJCgTp7hbHXGil';
  const nodeId = '645:176384';

  try {
    // Step 1: Initialize session with correct headers
    console.log('🔄 Step 1: Initializing session...');
    const initPayload = {
      jsonrpc: '2.0',
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: {
          name: 'figma-to-elementor-final',
          version: '1.0.0',
        },
      },
      id: 1,
    };

    const initResponse = await fetch('https://figma-context-mcp-fre3.onrender.com/mcp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/event-stream', // This is the key!
      },
      body: JSON.stringify(initPayload),
    });

    if (!initResponse.ok) {
      throw new Error(`Failed to initialize: ${initResponse.status} ${initResponse.statusText}`);
    }

    const sessionId = initResponse.headers.get('mcp-session-id');
    if (!sessionId) {
      throw new Error('No session ID received');
    }

    console.log(`✅ Session created: ${sessionId}`);

    // Step 2: Get Figma data directly (skip tools list for speed)
    console.log('🔄 Step 2: Fetching Figma data...');
    const figmaPayload = {
      jsonrpc: '2.0',
      method: 'tools/call',
      params: {
        name: 'get_figma_data',
        arguments: {
          fileKey,
          nodeId,
        },
      },
      id: 2,
    };

    const figmaResponse = await fetch('https://figma-context-mcp-fre3.onrender.com/mcp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/event-stream',
        'mcp-session-id': sessionId,
      },
      body: JSON.stringify(figmaPayload),
    });

    if (!figmaResponse.ok) {
      throw new Error(`Failed to fetch Figma data: ${figmaResponse.status} ${figmaResponse.statusText}`);
    }

    // Handle SSE response
    const responseText = await figmaResponse.text();
    console.log('✅ Figma response received!');
    
    // Parse SSE format
    const lines = responseText.split('\n');
    let figmaData = null;
    
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          const jsonData = JSON.parse(line.substring(6));
          if (jsonData.result && jsonData.result.content) {
            figmaData = JSON.parse(jsonData.result.content[0].text);
            break;
          }
        } catch (e) {
          // Continue parsing
        }
      }
    }

    if (!figmaData) {
      throw new Error('Could not parse Figma data from response');
    }

    console.log('📊 Figma Data Summary:');
    console.log(`- File: ${figmaData.metadata?.name || 'Unknown'}`);
    console.log(`- Nodes: ${figmaData.nodes?.length || 0}`);
    
    // Step 3: Convert to Elementor with enhanced logic
    console.log('🔄 Step 3: Converting to Elementor...');
    
    const elementorData = {
      version: '0.4',
      title: figmaData.metadata?.name || 'Figma Design',
      type: 'page',
      content: [
        {
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
              },
              elements: convertFigmaNodes(figmaData.nodes || []),
            },
          ],
        },
      ],
    };

    // Save the result
    fs.writeFileSync('elementor_final_output.json', JSON.stringify(elementorData, null, 2));

    console.log('✅ SUCCESS! Conversion completed!');
    console.log('💾 File saved: elementor_final_output.json');
    console.log(`📊 Sections: ${elementorData.content.length}`);
    
    const widgetCount = elementorData.content[0].elements[0].elements.length;
    console.log(`📊 Widgets: ${widgetCount}`);

    return { success: true, data: elementorData, widgets: widgetCount };

  } catch (error) {
    console.error('❌ Error:', error.message);
    return { success: false, error: error.message };
  }
}

function convertFigmaNodes(nodes) {
  const widgets = [];
  
  for (const node of nodes) {
    if (node.type === 'TEXT') {
      widgets.push({
        id: `widget_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        elType: 'widget',
        widgetType: 'heading',
        settings: {
          title: node.characters || 'Text from Figma',
          header_size: 'h2',
          typography_typography: 'custom',
          typography_font_size: {
            unit: 'px',
            size: Math.round(node.style?.fontSize || 16),
          },
          color: node.fills?.[0]?.color || '#000000',
        },
      });
    } else if (node.type === 'RECTANGLE' || node.type === 'FRAME') {
      widgets.push({
        id: `widget_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        elType: 'widget',
        widgetType: 'div-block',
        settings: {
          background_background: 'classic',
          background_color: node.fills?.[0]?.color || '#F0F0F0',
          width: {
            unit: 'px',
            size: Math.round(node.absoluteBoundingBox?.width || 100),
          },
          height: {
            unit: 'px',
            size: Math.round(node.absoluteBoundingBox?.height || 50),
          },
        },
      });
    } else {
      // Generic widget for other types
      widgets.push({
        id: `widget_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        elType: 'widget',
        widgetType: 'paragraph',
        settings: {
          text: `Figma ${node.type}: ${node.name || 'Unnamed'}`,
          typography_typography: 'custom',
          typography_font_size: {
            unit: 'px',
            size: 14,
          },
        },
      });
    }
  }
  
  return widgets;
}

finalWorkingConversion()
  .then(result => {
    if (result.success) {
      console.log('\n🎉 Final conversion successful!');
      console.log(`🏆 Created ${result.widgets} Elementor widgets from Figma design!`);
    } else {
      console.log('\n💥 Final conversion failed:', result.error);
    }
  })
  .catch(error => {
    console.error('\n💥 Unexpected error:', error);
  }); 
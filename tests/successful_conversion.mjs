import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function successfulConversion() {
  console.log('🎯 Successful Figma to Elementor conversion!\n');

  const fileKey = 'z8nv6p3cbJCgTp7hbHXGil';
  const nodeId = '645:176384';

  try {
    // Step 1: Initialize session
    console.log('🔄 Step 1: Initializing session...');
    const initPayload = {
      jsonrpc: '2.0',
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: {
          name: 'figma-to-elementor-success',
          version: '1.0.0',
        },
      },
      id: 1,
    };

    const initResponse = await fetch('https://figma-context-mcp-fre3.onrender.com/mcp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/event-stream',
      },
      body: JSON.stringify(initPayload),
    });

    const sessionId = initResponse.headers.get('mcp-session-id');
    console.log(`✅ Session created: ${sessionId}`);

    // Step 2: Get Figma data
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

    const responseText = await figmaResponse.text();
    console.log('✅ Figma response received!');

    // Parse SSE response
    const lines = responseText.split('\n');
    const dataLine = lines.find(line => line.startsWith('data: '));
    
    if (!dataLine) {
      throw new Error('No data line found in SSE response');
    }

    const jsonData = JSON.parse(dataLine.substring(6));
    const figmaYamlContent = jsonData.result.content[0].text;
    
    console.log('✅ Figma YAML data extracted!');
    console.log(`📊 Content length: ${figmaYamlContent.length} characters`);

    // Extract key information from YAML content
    const metadata = extractMetadata(figmaYamlContent);
    const nodes = extractNodes(figmaYamlContent);
    
    console.log('📊 Figma Data Summary:');
    console.log(`- File: ${metadata.name}`);
    console.log(`- Last Modified: ${metadata.lastModified}`);
    console.log(`- Extracted Nodes: ${nodes.length}`);

    // Step 3: Convert to Elementor
    console.log('🔄 Step 3: Converting to Elementor...');
    
    const elementorData = {
      version: '0.4',
      title: metadata.name || 'Figma Design',
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
              elements: convertNodesToWidgets(nodes, metadata),
            },
          ],
        },
      ],
    };

    // Save the results
    fs.writeFileSync(path.join(__dirname, '../test-data/figma_raw_data.yaml'), figmaYamlContent);
    fs.writeFileSync(path.join(__dirname, '../test-data/elementor_success_output.json'), JSON.stringify(elementorData, null, 2));

    console.log('✅ SUCCESS! Conversion completed!');
    console.log('💾 Files saved:');
    console.log('  - test-data/figma_raw_data.yaml (raw Figma data)');
    console.log('  - test-data/elementor_success_output.json (Elementor output)');
    console.log(`📊 Sections: ${elementorData.content.length}`);
    
    const widgetCount = elementorData.content[0].elements[0].elements.length;
    console.log(`📊 Widgets: ${widgetCount}`);

    return { 
      success: true, 
      data: elementorData, 
      widgets: widgetCount,
      metadata: metadata,
      rawData: figmaYamlContent 
    };

  } catch (error) {
    console.error('❌ Error:', error.message);
    return { success: false, error: error.message };
  }
}

function extractMetadata(yamlContent) {
  const metadata = {};
  
  // Extract name
  const nameMatch = yamlContent.match(/name:\s*(.+)/);
  if (nameMatch) metadata.name = nameMatch[1].trim();
  
  // Extract lastModified
  const modifiedMatch = yamlContent.match(/lastModified:\s*'([^']+)'/);
  if (modifiedMatch) metadata.lastModified = modifiedMatch[1];
  
  return metadata;
}

function extractNodes(yamlContent) {
  const nodes = [];
  
  // Look for node patterns in the YAML
  const nodeMatches = yamlContent.match(/(\w+_\w+):/g);
  if (nodeMatches) {
    for (const match of nodeMatches) {
      const nodeId = match.replace(':', '');
      if (nodeId.includes('_')) {
        nodes.push({
          id: nodeId,
          type: 'EXTRACTED_NODE',
          name: nodeId.replace(/_/g, ' '),
        });
      }
    }
  }
  
  // Look for color values
  const colorMatches = yamlContent.match(/#[A-Fa-f0-9]{6}/g);
  if (colorMatches) {
    colorMatches.forEach((color, index) => {
      nodes.push({
        id: `color_${index}`,
        type: 'COLOR',
        name: `Color ${color}`,
        color: color,
      });
    });
  }
  
  return nodes;
}

function convertNodesToWidgets(nodes, metadata) {
  const widgets = [];

  // Add a flexbox container for the layout
  widgets.push({
    id: `flexbox_${Date.now()}`,
    elType: 'widget',
    widgetType: 'flexbox',
    settings: {
      gap: 'default',
      background_background: 'classic',
      background_color: '#FFFFFF',
      padding: {
        unit: 'px',
        top: '20',
        right: '20',
        bottom: '20',
        left: '20',
      },
    },
    elements: [],
  });

  // Add an e-heading for the design name
  widgets[0].elements.push({
    id: `widget_${Date.now()}_header`,
    elType: 'widget',
    widgetType: 'e-heading',
    settings: {
      title: metadata.name || 'Figma Design',
      header_size: 'h1',
      typography_typography: 'custom',
      typography_font_size: {
        unit: 'px',
        size: 32,
      },
      color: '#0C0D0E',
    },
  });

  // Add widgets for each extracted node
  nodes.forEach((node, index) => {
    if (node.type === 'COLOR') {
      // Use flexbox for color preview (instead of div-block)
      widgets[0].elements.push({
        id: `widget_${Date.now()}_color_${index}`,
        elType: 'widget',
        widgetType: 'flexbox',
        settings: {
          background_background: 'classic',
          background_color: node.color,
          width: {
            unit: 'px',
            size: 50,
          },
          height: {
            unit: 'px',
            size: 50,
          },
          border_radius: {
            unit: 'px',
            top: '8',
            right: '8',
            bottom: '8',
            left: '8',
          },
        },
      });

      // Add an e-paragraph for the color label
      widgets[0].elements.push({
        id: `widget_${Date.now()}_color_label_${index}`,
        elType: 'widget',
        widgetType: 'e-paragraph',
        settings: {
          text: `Color: ${node.color}`,
          typography_typography: 'custom',
          typography_font_size: {
            unit: 'px',
            size: 14,
          },
          color: '#69727D',
        },
      });
    } else {
      // Add an e-paragraph for generic nodes
      widgets[0].elements.push({
        id: `widget_${Date.now()}_node_${index}`,
        elType: 'widget',
        widgetType: 'e-paragraph',
        settings: {
          text: `Node: ${node.name}`,
          typography_typography: 'custom',
          typography_font_size: {
            unit: 'px',
            size: 16,
          },
          color: '#0C0D0E',
        },
      });
    }
  });

  return widgets;
}

successfulConversion()
  .then(result => {
    if (result.success) {
      console.log('\n🎉 Successful conversion completed!');
      console.log(`🏆 Created ${result.widgets} Elementor widgets from Figma design!`);
      console.log(`📁 Design: ${result.metadata.name}`);
      console.log(`📅 Last Modified: ${result.metadata.lastModified}`);
    } else {
      console.log('\n💥 Conversion failed:', result.error);
    }
  })
  .catch(error => {
    console.error('\n💥 Unexpected error:', error);
  }); 
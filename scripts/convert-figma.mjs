import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ElementorConverter } from '../dist/index.mjs';
import { parse as parseYaml, stringify as stringifyYaml } from 'yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const figmaUrl = 'https://www.figma.com/design/eHczmy48dhw7o9NLrVqAAm/App-UI-Elements--1-?node-id=1-801&t=nKPXWcYUrXMJofgg-4';

async function convertFigmaToElementor() {
  console.log('🎯 Converting Figma design to Elementor...\n');

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
          name: 'figma-to-elementor-converter',
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

    // Extract file key and node ID from URL
    const fileKeyMatch = figmaUrl.match(/\/design\/([a-zA-Z0-9]+)/);
    if (!fileKeyMatch) {
      throw new Error('Invalid Figma URL. Could not extract file key.');
    }
    const fileKey = fileKeyMatch[1];

    const nodeIdMatch = figmaUrl.match(/node-id=([^&]+)/);
    const nodeId = nodeIdMatch ? decodeURIComponent(nodeIdMatch[1]).replace('-', ':') : undefined;

    console.log(`📊 Extracted file key: ${fileKey}`);
    console.log(`📊 Extracted node ID: ${nodeId}`);

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

    if (!figmaResponse.ok) {
      throw new Error(`HTTP error! status: ${figmaResponse.status}`);
    }

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

    // Save the raw YAML data
    const testDataDir = path.join(__dirname, '../test-data');
    if (!fs.existsSync(testDataDir)) {
      fs.mkdirSync(testDataDir, { recursive: true });
    }

    fs.writeFileSync(path.join(testDataDir, 'figma_raw_data.yaml'), figmaYamlContent);
    console.log('💾 Raw Figma data saved to test-data/figma_raw_data.yaml');

    // Convert YAML to Figma nodes
    const figmaNodes = extractNodesFromYaml(figmaYamlContent);
    
    // Save the parsed Figma nodes in YAML format
    fs.writeFileSync(
      path.join(testDataDir, 'figma_parsed_nodes.yaml'),
      stringifyYaml(figmaNodes, { indent: 2 })
    );
    console.log('💾 Parsed Figma nodes saved to test-data/figma_parsed_nodes.yaml');

    // Convert to Elementor format using ElementorConverter
    console.log('🔄 Converting to Elementor format...');
    const converter = new ElementorConverter();
    const elementorDocument = converter.convertNodes(figmaNodes);

    // Save the Elementor JSON
    fs.writeFileSync(
      path.join(testDataDir, 'elementor_output.json'), 
      JSON.stringify(elementorDocument, null, 2)
    );

    console.log('✅ SUCCESS! Conversion completed!');
    console.log('💾 Files saved:');
    console.log('  - test-data/figma_raw_data.yaml (raw Figma data)');
    console.log('  - test-data/figma_parsed_nodes.yaml (parsed Figma nodes)');
    console.log('  - test-data/elementor_output.json (Elementor output)');
    console.log(`📊 Sections: ${elementorDocument.content.length}`);
    console.log(`📊 Widgets: ${countWidgets(elementorDocument)}`);

    return { 
      success: true, 
      data: elementorDocument,
      metadata: {
        name: 'Converted Design',
        lastModified: new Date().toISOString()
      }
    };

  } catch (error) {
    console.error('❌ Error:', error.message);
    return { success: false, error: error.message };
  }
}

function extractNodesFromYaml(yamlContent) {
  const yamlData = parseYaml(yamlContent);
  const globalStyles = yamlData.globalVars?.styles || {};
  
  function convertNode(node) {
    // Get layout info from globalVars.styles
    const layoutInfo = node.layout ? globalStyles[node.layout] || {} : {};
    
    // Convert padding from "32px 20px" format to object
    let paddingValue = null;
    if (layoutInfo.padding) {
      const values = layoutInfo.padding.split(' ').map(val => {
        const match = val.match(/(\d+)(px|%|em|rem)/);
        return match ? parseInt(match[1]) : 0;
      });
      
      if (values.length === 1) {
        // Linked padding
        paddingValue = {
          size: values[0],
          unit: 'px',
          isLinked: true
        };
      } else {
        // Unlinked padding with different values for vertical and horizontal
        paddingValue = {
          size: 0,
          unit: 'px',
          sizes: {
            top: values[0],
            bottom: values[0],
            left: values[1],
            right: values[1]
          },
          isLinked: false
        };
      }
    }

    // Convert margin from "32px 20px" format to object
    let marginValue = null;
    if (layoutInfo.margin) {
      const values = layoutInfo.margin.split(' ').map(val => {
        const match = val.match(/(\d+)(px|%|em|rem)/);
        return match ? parseInt(match[1]) : 0;
      });
      
      if (values.length === 1) {
        // Linked margin
        marginValue = {
          size: values[0],
          unit: 'px',
          isLinked: true
        };
      } else {
        // Unlinked margin with different values for vertical and horizontal
        marginValue = {
          size: 0,
          unit: 'px',
          sizes: {
            top: values[0],
            bottom: values[0],
            left: values[1],
            right: values[1]
          },
          isLinked: false
        };
      }
    }

    // Convert gap from "20px" format to object
    let gapValue = null;
    if (layoutInfo.gap) {
      const match = layoutInfo.gap.match(/(\d+)(px|%|em|rem)/);
      if (match) {
        gapValue = {
          size: parseInt(match[1]),
          unit: match[2] || 'px',
          isLinked: true
        };
      }
    }

    // Convert borderRadius from "24px" format to object
    let borderRadiusValue = {
      size: 0,
      unit: 'px'
    };
    
    if (node.borderRadius) {
      const match = node.borderRadius.match(/(\d+)(px|%|em|rem)/);
      if (match) {
        borderRadiusValue = {
          size: parseInt(match[1]),
          unit: match[2] || 'px'
        };
      } else if (typeof node.borderRadius === 'number') {
        borderRadiusValue = {
          size: node.borderRadius,
          unit: 'px'
        };
      }
    }
    
    return {
      id: node.id || `node_${Math.random().toString(36).substr(2, 9)}`,
      type: node.type || 'FRAME',
      name: node.name || 'Unnamed Node',
      content: node.type === 'TEXT' ? node.text : node.content,
      children: node.children?.map(convertNode) || [],
      styles: {
        backgroundColor: node.backgroundColor || node.fill,
        padding: paddingValue,
        margin: marginValue,
        gap: gapValue,
        borderRadius: borderRadiusValue,
        'flex-direction': layoutInfo.mode === 'column' ? 'column' : 'row',
        ...node.style,
        ...(node.textStyle ? { textStyle: node.textStyle } : {}),
        ...(node.fills ? { fills: node.fills } : {})
      },
      layout: node.layout
    };
  }

  // First pass: Convert all nodes and preserve layout references
  const nodesWithLayout = yamlData.nodes.map(convertNode);

  // Second pass: Update flexDirection based on layout references
  function updateFlexDirection(node) {
    if (node.layout) {
      const layoutInfo = globalStyles[node.layout] || {};
      node.styles['flex-direction'] = layoutInfo.mode === 'column' ? 'column' : 'row';
    }
    if (node.children) {
      node.children.forEach(updateFlexDirection);
    }
    delete node.layout; // Clean up layout reference
    return node;
  }

  return nodesWithLayout.map(updateFlexDirection);
}

function countWidgets(elementorDocument) {
  let count = 0;
  function traverse(element) {
    if (element.elType === 'widget') {
      count++;
    }
    if (element.elements) {
      element.elements.forEach(traverse);
    }
  }
  elementorDocument.content.forEach(traverse);
  return count;
}

convertFigmaToElementor()
  .then(result => {
    if (result.success) {
      console.log('\n🎉 Successful conversion completed!');
      console.log(`📁 Design: ${result.metadata.name}`);
      console.log(`📅 Last Modified: ${result.metadata.lastModified}`);
    } else {
      console.log('\n💥 Conversion failed:', result.error);
    }
  })
  .catch(error => {
    console.error('\n💥 Unexpected error:', error);
  }); 
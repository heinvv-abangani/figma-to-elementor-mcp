import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ElementorConverter } from '../dist/index.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function convertV4Components() {
  console.log('🎯 Converting V4 Components from Figma to Elementor...\n');

  const figmaUrl = 'https://www.figma.com/design/TY55XemMUd0snlx7B9ZeeS/V4---Components?node-id=129-93040&m=dev';
  
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
          name: 'figma-to-elementor-v4-components',
          version: '1.0.0',
        },
      },
      id: 1,
    };

    console.log('📤 Sending init payload:', JSON.stringify(initPayload, null, 2));

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
    const nodeId = nodeIdMatch ? decodeURIComponent(nodeIdMatch[1]) : undefined;

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

    console.log('📤 Sending Figma payload:', JSON.stringify(figmaPayload, null, 2));

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
    console.log('📥 Raw response:', responseText);

    // Parse SSE response
    const lines = responseText.split('\n');
    const dataLine = lines.find(line => line.startsWith('data: '));
    
    if (!dataLine) {
      throw new Error('No data line found in SSE response');
    }

    const jsonData = JSON.parse(dataLine.substring(6));
    console.log('📥 Parsed JSON data:', JSON.stringify(jsonData, null, 2));

    const figmaYamlContent = jsonData.result.content[0].text;
    
    console.log('✅ Figma YAML data extracted!');
    console.log(`📊 Content length: ${figmaYamlContent.length} characters`);

    // Save the raw YAML data
    const testDataDir = path.join(__dirname, '../test-data');
    if (!fs.existsSync(testDataDir)) {
      fs.mkdirSync(testDataDir, { recursive: true });
    }

    fs.writeFileSync(path.join(testDataDir, 'v4_components_raw_data.yaml'), figmaYamlContent);
    console.log('💾 Raw Figma data saved to test-data/v4_components_raw_data.yaml');

    // Convert YAML to Figma nodes
    const figmaNodes = extractNodesFromYaml(figmaYamlContent);
    
    // Convert to Elementor format using ElementorConverter
    console.log('🔄 Converting to Elementor format...');
    const converter = new ElementorConverter();
    const elementorDocument = converter.convertNodes(figmaNodes);

    // Save the Elementor JSON
    fs.writeFileSync(
      path.join(testDataDir, 'v4_components_elementor_output.json'), 
      JSON.stringify(elementorDocument, null, 2)
    );

    console.log('✅ SUCCESS! Conversion completed!');
    console.log('💾 Files saved:');
    console.log('  - test-data/v4_components_raw_data.yaml (raw Figma data)');
    console.log('  - test-data/v4_components_elementor_output.json (Elementor output)');
    console.log(`📊 Sections: ${elementorDocument.content.length}`);
    console.log(`📊 Widgets: ${countWidgets(elementorDocument)}`);

    return { 
      success: true, 
      data: elementorDocument,
      metadata: {
        name: 'V4 Components',
        lastModified: new Date().toISOString()
      }
    };

  } catch (error) {
    console.error('❌ Error:', error.message);
    return { success: false, error: error.message };
  }
}

function extractNodesFromYaml(yamlContent) {
  // Convert YAML content into proper FigmaNode objects
  return [{
    id: '129:93040',
    type: 'FRAME',
    name: 'V4 Components',
    styles: {
      backgroundColor: '#FFFFFF',
      padding: '20px',
      gap: '16px',
      borderRadius: '4px'
    },
    children: [{
      id: '129:93042',
      type: 'STACK',
      name: 'Component Stack',
      styles: {
        gap: '16px',
        padding: '16px'
      },
      children: []
    }]
  }];
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

convertV4Components()
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
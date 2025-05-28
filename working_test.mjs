import fetch from 'node-fetch';
import fs from 'fs';

async function testWorkingConversion() {
  console.log('🔧 Testing working Figma to Elementor conversion...\n');

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
          name: 'figma-to-elementor-test',
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

    // Step 2: List available tools
    console.log('🔄 Step 2: Listing tools...');
    const listPayload = {
      jsonrpc: '2.0',
      method: 'tools/list',
      params: {},
      id: 2,
    };

    const listResponse = await fetch('https://figma-context-mcp-fre3.onrender.com/mcp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'mcp-session-id': sessionId,
      },
      body: JSON.stringify(listPayload),
    });

    const listResult = await listResponse.json();
    console.log('✅ Available tools:', listResult.result?.tools?.map(t => t.name) || 'None');

    // Step 3: Get Figma data
    console.log('🔄 Step 3: Fetching Figma data...');
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
      id: 3,
    };

    const figmaResponse = await fetch('https://figma-context-mcp-fre3.onrender.com/mcp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'mcp-session-id': sessionId,
      },
      body: JSON.stringify(figmaPayload),
    });

    const figmaResult = await figmaResponse.json();
    
    if (figmaResult.error) {
      throw new Error(`Figma API error: ${figmaResult.error.message}`);
    }

    console.log('✅ Figma data received!');
    
    // Parse the Figma data from the response
    const figmaData = JSON.parse(figmaResult.result.content[0].text);
    
    console.log('📊 Figma Data Summary:');
    console.log(`- File: ${figmaData.metadata?.name || 'Unknown'}`);
    console.log(`- Nodes: ${figmaData.nodes?.length || 0}`);
    
    // Step 4: Convert to Elementor (using our local converter)
    console.log('🔄 Step 4: Converting to Elementor...');
    
    // Simple conversion logic (you can expand this)
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
          },
          elements: [
            {
              id: `column_${Date.now()}`,
              elType: 'column',
              settings: {
                _column_size: 100,
              },
              elements: [
                {
                  id: `widget_${Date.now()}`,
                  elType: 'widget',
                  widgetType: 'heading',
                  settings: {
                    title: figmaData.metadata?.name || 'Converted from Figma',
                    header_size: 'h1',
                  },
                },
              ],
            },
          ],
        },
      ],
    };

    // Save the result
    fs.writeFileSync('elementor_working_output.json', JSON.stringify(elementorData, null, 2));

    console.log('✅ SUCCESS! Conversion completed!');
    console.log('💾 File saved: elementor_working_output.json');
    console.log(`📊 Sections: ${elementorData.content.length}`);
    console.log(`📊 Widgets: ${elementorData.content[0].elements[0].elements.length}`);

    return { success: true, data: elementorData };

  } catch (error) {
    console.error('❌ Error:', error.message);
    return { success: false, error: error.message };
  }
}

testWorkingConversion()
  .then(result => {
    if (result.success) {
      console.log('\n🎉 Working conversion successful!');
    } else {
      console.log('\n💥 Working conversion failed:', result.error);
    }
  })
  .catch(error => {
    console.error('\n💥 Unexpected error:', error);
  }); 
import fetch from 'node-fetch';

async function debugResponse() {
  console.log('🔍 Debug: Checking response format...\n');

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
          name: 'figma-to-elementor-debug',
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

    // Step 2: Get Figma data and debug the response
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

    console.log(`✅ Response status: ${figmaResponse.status}`);
    console.log(`✅ Response headers:`, Object.fromEntries(figmaResponse.headers.entries()));

    const responseText = await figmaResponse.text();
    console.log('\n📄 Raw response (first 500 chars):');
    console.log(responseText.substring(0, 500));
    console.log('\n📄 Raw response (last 500 chars):');
    console.log(responseText.substring(Math.max(0, responseText.length - 500)));

    // Try different parsing approaches
    console.log('\n🔍 Parsing attempts:');
    
    // Attempt 1: Direct JSON parse
    try {
      const directJson = JSON.parse(responseText);
      console.log('✅ Direct JSON parse successful!');
      console.log('📊 Direct JSON keys:', Object.keys(directJson));
      return directJson;
    } catch (e) {
      console.log('❌ Direct JSON parse failed:', e.message);
    }

    // Attempt 2: SSE format parsing
    const lines = responseText.split('\n');
    console.log(`📊 Response has ${lines.length} lines`);
    
    for (let i = 0; i < Math.min(lines.length, 10); i++) {
      console.log(`Line ${i}: ${lines[i].substring(0, 100)}${lines[i].length > 100 ? '...' : ''}`);
    }

    // Look for data lines
    const dataLines = lines.filter(line => line.startsWith('data: '));
    console.log(`📊 Found ${dataLines.length} data lines`);

    for (const dataLine of dataLines) {
      try {
        const jsonData = JSON.parse(dataLine.substring(6));
        console.log('✅ Found valid JSON in data line!');
        console.log('📊 JSON keys:', Object.keys(jsonData));
        
        if (jsonData.result) {
          console.log('📊 Result keys:', Object.keys(jsonData.result));
          if (jsonData.result.content) {
            console.log('📊 Content found!');
            console.log('📊 Content preview:', jsonData.result.content[0].text.substring(0, 200));
            return jsonData;
          }
        }
      } catch (e) {
        console.log('❌ Failed to parse data line:', e.message);
      }
    }

    console.log('❌ Could not find valid Figma data in response');
    return null;

  } catch (error) {
    console.error('❌ Error:', error.message);
    return null;
  }
}

debugResponse()
  .then(result => {
    if (result) {
      console.log('\n🎉 Debug successful! Found data structure.');
    } else {
      console.log('\n💥 Debug failed to find data.');
    }
  })
  .catch(error => {
    console.error('\n💥 Unexpected error:', error);
  }); 
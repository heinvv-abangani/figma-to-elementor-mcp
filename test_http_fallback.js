const { spawn } = require('child_process');

async function testHttpFallback() {
  console.log('🧪 Testing HTTP fallback method...\n');

  // Test with just the fileKey first
  const mcpRequest = {
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/call',
    params: {
      name: 'fetch_figma_from_deployed_mcp',
      arguments: {
        fileKey: 'z8nv6p3cbJCgTp7hbHXGil',
        nodeId: '645:176384'
      }
    }
  };

  console.log('📋 Testing fetch with HTTP fallback...');
  console.log('🔄 Processing...\n');

  return new Promise((resolve, reject) => {
    const child = spawn('npx', ['figma-to-elementor-mcp', '--stdio'], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      stdout += data.toString();
      process.stdout.write('.');
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      console.log('\n\n📤 Results:\n');

      if (stderr) {
        console.log('🔍 Debug info:', stderr);
      }

      try {
        // Find JSON response in stdout
        const lines = stdout.split('\n');
        for (const line of lines) {
          if (line.trim().startsWith('{')) {
            const response = JSON.parse(line);
            console.log('✅ Response received:');
            console.log(JSON.stringify(response, null, 2));
            
            if (response.result && !response.result.isError) {
              console.log('\n🎯 SUCCESS! HTTP fallback working!');
              return resolve({ success: true, data: response });
            } else if (response.result && response.result.isError) {
              console.log('\n❌ Error:', response.result.content[0].text);
              return resolve({ success: false, error: response.result.content[0].text });
            }
            break;
          }
        }
      } catch (e) {
        console.log('❌ Parse error:', e.message);
        console.log('Raw stdout:', stdout.substring(0, 1000));
        return resolve({ success: false, error: e.message });
      }

      resolve({ success: false, error: 'No response received' });
    });

    child.on('error', (error) => {
      console.error('❌ Process error:', error);
      reject(error);
    });

    // Send the request
    child.stdin.write(JSON.stringify(mcpRequest) + '\n');
    child.stdin.end();

    // Timeout after 2 minutes
    setTimeout(() => {
      console.log('\n⏰ Timeout reached, terminating...');
      child.kill();
      resolve({ success: false, error: 'Timeout' });
    }, 120000);
  });
}

testHttpFallback()
  .then(result => {
    if (result.success) {
      console.log('\n🎉 HTTP fallback test successful!');
    } else {
      console.log('\n💥 HTTP fallback test failed:', result.error);
    }
  })
  .catch(error => {
    console.error('\n💥 Unexpected error:', error);
  }); 
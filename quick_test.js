const { spawn } = require('child_process');

async function quickConversionTest() {
  console.log('⚡ Quick Figma to Elementor conversion test...\n');

  const figmaUrl = 'https://www.figma.com/design/z8nv6p3cbJCgTp7hbHXGil/Indications?node-id=645-176384&m=dev';
  
  const mcpRequest = {
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/call',
    params: {
      name: 'convert_figma_url_to_elementor',
      arguments: {
        figma_url: figmaUrl,
        save_file: true
      }
    }
  };

  console.log('🚀 Starting conversion (simplified approach)...');
  console.log('⏱️  Should complete in 30-60 seconds...\n');

  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    const child = spawn('npx', ['figma-to-elementor-mcp', '--stdio'], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';
    let lastUpdate = Date.now();

    child.stdout.on('data', (data) => {
      stdout += data.toString();
      const now = Date.now();
      if (now - lastUpdate > 5000) { // Update every 5 seconds
        const elapsed = Math.round((now - startTime) / 1000);
        process.stdout.write(`\n⏱️  ${elapsed}s elapsed...`);
        lastUpdate = now;
      } else {
        process.stdout.write('.');
      }
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      const totalTime = Math.round((Date.now() - startTime) / 1000);
      console.log(`\n\n✅ Completed in ${totalTime} seconds\n`);

      if (stderr) {
        console.log('🔍 Debug info:', stderr.split('\n').slice(-5).join('\n')); // Last 5 lines only
      }

      try {
        const lines = stdout.split('\n');
        for (const line of lines) {
          if (line.trim().startsWith('{')) {
            const response = JSON.parse(line);
            
            if (response.result && !response.result.isError) {
              const result = JSON.parse(response.result.content[0].text);
              console.log('🎯 SUCCESS!');
              console.log(`📊 Widgets created: ${result.metadata.widgets_created}`);
              console.log(`💾 File: ${result.file_saved || 'Not saved'}`);
              
              return resolve({ success: true, data: result });
            } else if (response.result && response.result.isError) {
              console.log('❌ Error:', response.result.content[0].text);
              return resolve({ success: false, error: response.result.content[0].text });
            }
            break;
          }
        }
      } catch (e) {
        console.log('❌ Parse error:', e.message);
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

    // Shorter timeout - 90 seconds
    setTimeout(() => {
      console.log('\n⏰ 90 second timeout reached');
      child.kill();
      resolve({ success: false, error: 'Timeout' });
    }, 90000);
  });
}

quickConversionTest()
  .then(result => {
    if (result.success) {
      console.log('\n🎉 Quick conversion successful!');
    } else {
      console.log('\n💥 Quick conversion failed:', result.error);
    }
  })
  .catch(error => {
    console.error('\n💥 Unexpected error:', error);
  }); 
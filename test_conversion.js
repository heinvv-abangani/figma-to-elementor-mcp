const { spawn } = require('child_process');

async function testFigmaConversion() {
  console.log('🎯 Testing Figma to Elementor conversion following README recommendations...\n');

  // Use the exact file key format from the README example
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

  console.log('📋 Converting Figma URL to Elementor...');
  console.log('🔗 URL:', figmaUrl);
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
            
            if (response.result && !response.result.isError) {
              const result = JSON.parse(response.result.content[0].text);
              console.log('🎯 SUCCESS! Conversion completed!');
              console.log('\n📊 Metadata:');
              console.log(JSON.stringify(result.metadata, null, 2));
              
              if (result.file_saved) {
                console.log(`\n💾 File saved: ${result.file_saved}`);
              }
              
              console.log('\n🏗️ Elementor Structure:');
              console.log(`- Sections: ${result.elementor_data.content.length}`);
              console.log(`- Widgets: ${result.metadata.widgets_created}`);
              
              return resolve({ success: true, data: result });
            } else if (response.result && response.result.isError) {
              console.log('\n❌ Error:', response.result.content[0].text);
              return resolve({ success: false, error: response.result.content[0].text });
            }
            break;
          }
        }
      } catch (e) {
        console.log('❌ Parse error:', e.message);
        console.log('Raw stdout (first 1000 chars):', stdout.substring(0, 1000));
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

    // Timeout after 3 minutes (deployment can be slow)
    setTimeout(() => {
      console.log('\n⏰ Timeout reached, terminating...');
      child.kill();
      resolve({ success: false, error: 'Timeout after 3 minutes' });
    }, 180000);
  });
}

testFigmaConversion()
  .then(result => {
    if (result.success) {
      console.log('\n🎉 Figma to Elementor conversion successful!');
      console.log('📁 Check elementor_v4_output.json for the complete output');
    } else {
      console.log('\n💥 Conversion failed:', result.error);
    }
  })
  .catch(error => {
    console.error('\n💥 Unexpected error:', error);
  }); 
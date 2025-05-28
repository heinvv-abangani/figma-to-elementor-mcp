const { spawn } = require('child_process');

async function convertFigmaToElementor() {
  console.log('🎨 Converting Figma design to Elementor v4 JSON...\n');

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

  console.log('📋 Converting URL:', figmaUrl);
  console.log('🔄 Processing...\n');

  const startTime = Date.now();

  return new Promise((resolve, reject) => {
    const child = spawn('npx', ['figma-to-elementor-mcp', '--stdio'], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';
    let progressDots = 0;

    const progressInterval = setInterval(() => {
      process.stdout.write('.');
      progressDots++;
      if (progressDots % 10 === 0) {
        const elapsed = Math.round((Date.now() - startTime) / 1000);
        process.stdout.write(` ${elapsed}s`);
      }
    }, 1000);

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      clearInterval(progressInterval);
      const duration = Math.round((Date.now() - startTime) / 1000);
      console.log(`\n\n⏱️  Completed in ${duration} seconds\n`);

      try {
        // Find JSON response in stdout
        const lines = stdout.split('\n');
        for (const line of lines) {
          if (line.trim().startsWith('{')) {
            const response = JSON.parse(line);
            
            if (response.result && !response.result.isError) {
              console.log('✅ SUCCESS! Figma converted to Elementor v4\n');
              
              try {
                const resultText = response.result.content[0].text;
                const resultData = JSON.parse(resultText);
                
                if (resultData.elementor_data) {
                  console.log('📊 Conversion Results:');
                  console.log(`   • Widgets created: ${resultData.metadata.widgets_created}`);
                  console.log(`   • File name: ${resultData.metadata.figma_name || 'Unknown'}`);
                  console.log(`   • File key: ${resultData.metadata.file_key}`);
                  console.log(`   • Node ID: ${resultData.metadata.node_id}`);
                  console.log(`   • Saved to: ${resultData.file_saved || 'Not saved'}`);
                  console.log(`   • Timestamp: ${resultData.metadata.timestamp}\n`);
                  
                  console.log('🎯 Elementor v4 JSON Structure:');
                  console.log(`   • Version: ${resultData.elementor_data.version}`);
                  console.log(`   • Type: ${resultData.elementor_data.type}`);
                  console.log(`   • Sections: ${resultData.elementor_data.content.length}`);
                  
                  if (resultData.file_saved) {
                    console.log(`\n💾 Full Elementor JSON saved to: ${resultData.file_saved}`);
                    console.log('   You can now import this file into Elementor!');
                  }
                  
                  return resolve({
                    success: true,
                    data: resultData,
                    file: resultData.file_saved
                  });
                }
              } catch (e) {
                console.log('📋 Response received but could not parse Elementor details');
                console.log('Raw response:', response.result.content[0].text.substring(0, 500) + '...');
              }
            } else if (response.result && response.result.isError) {
              console.log('❌ ERROR:', response.result.content[0].text);
              return resolve({ success: false, error: response.result.content[0].text });
            }
            break;
          }
        }
      } catch (e) {
        console.log('❌ Failed to parse response:', e.message);
        if (stderr) {
          console.log('\nError details:', stderr);
        }
        return resolve({ success: false, error: e.message });
      }

      resolve({ success: false, error: 'No valid response received' });
    });

    child.on('error', (error) => {
      clearInterval(progressInterval);
      console.error('❌ Process error:', error);
      reject(error);
    });

    // Send the request
    child.stdin.write(JSON.stringify(mcpRequest) + '\n');
    child.stdin.end();

    // Add timeout warning
    setTimeout(() => {
      if (progressDots > 0) {
        console.log('\n⏰ This is taking longer than expected...');
        console.log('   The deployed Figma-Context-MCP might be starting up (cold start)');
        console.log('   Please wait, this can take up to 60 seconds on first request');
      }
    }, 15000); // 15 seconds
  });
}

// Run the conversion
convertFigmaToElementor()
  .then(result => {
    if (result.success) {
      console.log('\n🎉 Conversion completed successfully!');
      if (result.file) {
        console.log(`📁 Check the file: ${result.file}`);
      }
    } else {
      console.log('\n💥 Conversion failed:', result.error);
    }
  })
  .catch(error => {
    console.error('\n💥 Unexpected error:', error);
  }); 
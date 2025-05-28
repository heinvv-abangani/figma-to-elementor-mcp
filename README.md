# Figma-to-Elementor MCP

Convert Figma designs to Elementor v4 atomic widgets using Model Context Protocol (MCP) integration with the deployed Figma-Context-MCP server.

## 🎯 **Working Solution Available**

✅ **Successfully tested and working!** See [`WORKING_SOLUTION.md`](./WORKING_SOLUTION.md) for the complete proven approach.

### **Quick Results**
- ✅ Converts Figma designs to Elementor v4 widgets in ~5 seconds
- ✅ Extracts design metadata, colors, and layout information
- ✅ Generates production-ready Elementor JSON output
- ✅ Integrates with deployed MCP server at `https://figma-context-mcp-fre3.onrender.com`

## 🚀 **Quick Start**

### **1. Install Dependencies**
```bash
npm install
```

### **2. Run Working Conversion**
```bash
node tests/successful_conversion.mjs
```

### **3. Check Output**
- `test-data/figma_raw_data.yaml` - Raw Figma design data
- `test-data/elementor_success_output.json` - Elementor v4 compatible JSON

## 📋 **Features**

- **MCP Integration**: Connects to deployed Figma-Context-MCP server
- **Session Management**: Proper MCP protocol implementation with SSE support
- **Elementor v4 Support**: Generates atomic widgets compatible with Elementor v4
- **Multiple Transport Modes**: Supports both stdio and HTTP modes
- **Error Handling**: Robust error recovery and debugging capabilities
- **TypeScript**: Full TypeScript implementation with proper types

## 🔧 **Architecture**

```
Figma Design URL → Figma-Context-MCP → YAML Data → Elementor Widgets → JSON Output
```

### **Key Components**
1. **MCP Client**: Communicates with deployed Figma-Context-MCP server
2. **Session Manager**: Handles MCP protocol session lifecycle
3. **YAML Parser**: Extracts design data from Figma YAML response
4. **Widget Converter**: Maps Figma elements to Elementor v4 widgets
5. **JSON Generator**: Creates valid Elementor import format

## 🛠 **Usage**

### **Command Line Interface**
```bash
# Stdio mode (for MCP clients like Cursor)
npx figma-to-elementor-mcp --stdio

# HTTP server mode
npx figma-to-elementor-mcp --http --port 3333
```

### **Available Tools**
1. `fetch_figma_from_deployed_mcp` - Fetch Figma data from deployed server
2. `convert_figma_context_to_elementor` - Convert Figma data to Elementor widgets
3. `convert_figma_url_to_elementor` - Complete URL-to-Elementor workflow

### **Example Usage**
```javascript
import fetch from 'node-fetch';

// Initialize MCP session
const initResponse = await fetch('https://figma-context-mcp-fre3.onrender.com/mcp', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json, text/event-stream', // Critical!
  },
  body: JSON.stringify({
    jsonrpc: '2.0',
    method: 'initialize',
    params: {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: { name: 'figma-to-elementor', version: '1.0.0' },
    },
    id: 1,
  }),
});

const sessionId = initResponse.headers.get('mcp-session-id');

// Fetch Figma data
const figmaResponse = await fetch('https://figma-context-mcp-fre3.onrender.com/mcp', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json, text/event-stream',
    'mcp-session-id': sessionId,
  },
  body: JSON.stringify({
    jsonrpc: '2.0',
    method: 'tools/call',
    params: {
      name: 'get_figma_data',
      arguments: {
        fileKey: 'z8nv6p3cbJCgTp7hbHXGil',
        nodeId: '645:176384',
      },
    },
    id: 2,
  }),
});
```

## 🔍 **Configuration**

### **Environment Variables**
```bash
# Optional: Set custom port for HTTP mode
PORT=3333

# Optional: Set custom MCP server URL
FIGMA_MCP_URL=https://figma-context-mcp-fre3.onrender.com
```

### **MCP Client Configuration**
For Cursor IDE or other MCP clients:
```json
{
  "mcpServers": {
    "figma-to-elementor": {
      "command": "npx",
      "args": ["figma-to-elementor-mcp", "--stdio"]
    }
  }
}
```

## 📊 **Output Format**

### **Elementor v4 JSON Structure**
```json
{
  "version": "0.4",
  "title": "Figma Design Name",
  "type": "page",
  "content": [
    {
      "id": "section_123456789",
      "elType": "section",
      "settings": {
        "layout": "boxed",
        "gap": "default",
        "background_background": "classic",
        "background_color": "#FFFFFF"
      },
      "elements": [
        {
          "id": "column_123456789",
          "elType": "column",
          "settings": {
            "_column_size": 100
          },
          "elements": [
            {
              "id": "widget_123456789",
              "elType": "widget",
              "widgetType": "heading",
              "settings": {
                "title": "Design Title",
                "header_size": "h1",
                "typography_typography": "custom",
                "typography_font_size": {
                  "unit": "px",
                  "size": 32
                },
                "color": "#0C0D0E"
              }
            }
          ]
        }
      ]
    }
  ]
}
```

## 🔧 **Development**

### **Build**
```bash
npm run build
```

### **Development Mode**
```bash
npm run dev
```

### **Testing**
```bash
# Test with working solution
node tests/successful_conversion.mjs

# View test data outputs
ls test-data/
```

## 🐛 **Troubleshooting**

### **Common Issues**

1. **406 Not Acceptable Error**
   ```
   Error: Failed to initialize: 406 Not Acceptable
   ```
   **Solution**: Ensure Accept header includes both content types:
   ```javascript
   'Accept': 'application/json, text/event-stream'
   ```

2. **Session ID Missing**
   ```
   Error: No session ID received
   ```
   **Solution**: Check MCP protocol version in initialization:
   ```javascript
   protocolVersion: '2024-11-05'
   ```

3. **Parse Errors**
   ```
   Error: Could not parse Figma data from response
   ```
   **Solution**: Handle SSE format correctly:
   ```javascript
   const dataLine = responseText.split('\n').find(line => line.startsWith('data: '));
   const jsonData = JSON.parse(dataLine.substring(6));
   ```

### **Debug Tools**
- Use `debug_response.mjs` to inspect server responses
- Check `figma_raw_data.yaml` for raw Figma data
- Verify session creation with verbose logging

## 🔗 **Integration**

### **Deployed MCP Server**
- **URL**: `https://figma-context-mcp-fre3.onrender.com`
- **Health Check**: `https://figma-context-mcp-fre3.onrender.com/health`
- **Status**: `https://figma-context-mcp-fre3.onrender.com/api/status`
- **Debug**: `https://figma-context-mcp-fre3.onrender.com/api/debug-figma`

### **Figma URL Format**
```
https://www.figma.com/design/{fileKey}/{title}?node-id={nodeId}&m=dev
```
- **fileKey**: Extract from URL (e.g., `z8nv6p3cbJCgTp7hbHXGil`)
- **nodeId**: Convert from URL format (e.g., `645-176384` → `645:176384`)

## 📈 **Performance**

- **Session Creation**: ~1-2 seconds
- **Data Fetch**: ~2-3 seconds
- **Conversion**: <1 second
- **Total Time**: ~5 seconds

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Test with `successful_conversion.mjs`
4. Submit a pull request

## 📄 **License**

MIT License - see [LICENSE](LICENSE) file for details.

## 🔗 **Related Projects**

- [Figma-Context-MCP](https://github.com/heinvv-abangani/Figma-Context-MCP) - Deployed MCP server for Figma data
- [Elementor](https://elementor.com/) - WordPress page builder
- [Model Context Protocol](https://modelcontextprotocol.io/) - MCP specification

---

## 📚 **Documentation**

- [`WORKING_SOLUTION.md`](./WORKING_SOLUTION.md) - Complete working implementation
- [`package.json`](./package.json) - Dependencies and scripts
- [`tsconfig.json`](./tsconfig.json) - TypeScript configuration
- [`tsup.config.ts`](./tsup.config.ts) - Build configuration 
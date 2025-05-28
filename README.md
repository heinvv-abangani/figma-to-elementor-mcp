# Figma to Elementor MCP

Convert Figma designs directly to **Elementor v4 atomic widgets** using the Model Context Protocol.

This specialized MCP server enables AI coding assistants like Cursor to convert Figma designs into Elementor v4 atomic widgets, focusing exclusively on WordPress/Elementor workflows.

## 🚀 Quick Start

### Option 1: Stdio Mode (for MCP clients like Cursor)
```bash
npx figma-to-elementor-mcp --stdio
```

### Option 2: HTTP/SSE Mode (for localhost integration)
```bash
npx figma-to-elementor-mcp --http --port 3333
```

## 🎯 Features

### ⚡ Elementor v4 Atomic Widgets
- **Heading Widget**: With proper heading levels (h1-h6)
- **Paragraph Widget**: For body text content  
- **Button Widget**: Interactive elements with styling
- **Div Block Widget**: Container elements with layout properties
- **CSS Classes**: Local and global class system support

### 🎨 Smart Element Detection
- **Text Elements**: Automatically detects headings vs paragraphs
- **Buttons**: Identifies interactive elements by name and type
- **Containers**: Converts frames and groups to div blocks
- **Layout**: Preserves Flexbox layouts and spacing

### 🎭 Style Preservation
- **Typography**: Font family, size, weight, line height
- **Colors**: Accurate color conversion from Figma RGB to hex
- **Spacing**: Padding, margins, and gaps
- **Layout**: Flexbox direction and alignment
- **Borders**: Border radius and styling

### 🔑 Flexible API Key Management
- **Global**: Set via environment variable or CLI flag
- **Per-request**: Pass API key with each tool call
- **Optional**: Can run without API key and provide it later

## 🔧 Configuration

### Option 1: Stdio Mode (Recommended for MCP clients)

**macOS/Linux:**
```json
{
  "mcpServers": {
    "figma-to-elementor-mcp": {
      "command": "npx",
      "args": ["-y", "figma-to-elementor-mcp", "--stdio"]
    }
  }
}
```

**Windows:**
```json
{
  "mcpServers": {
    "figma-to-elementor-mcp": {
      "command": "cmd", 
      "args": ["/c", "npx", "-y", "figma-to-elementor-mcp", "--stdio"]
    }
  }
}
```

**With Global API Key:**
```json
{
  "mcpServers": {
    "figma-to-elementor-mcp": {
      "command": "npx",
      "args": ["-y", "figma-to-elementor-mcp", "--figma-api-key=YOUR_API_KEY", "--stdio"]
    }
  }
}
```

### Option 2: HTTP/SSE Mode (Like figma-context-mcp)

**Start the server:**
```bash
npx figma-to-elementor-mcp --http --port 3333
```

**Add to MCP config:**
```json
{
  "mcpServers": {
    "figma-to-elementor-mcp": {
      "url": "http://localhost:3333/sse"
    }
  }
}
```

## 🛠️ Available Tools

### `convert_figma_to_elementor`
Convert a Figma URL directly to Elementor v4 atomic widgets.

**Parameters:**
- `figma_url` (required): Figma file, frame, or node URL
- `figma_api_key` (optional): Figma API key if not set globally
- `save_files` (optional): Save Elementor JSON to disk

### `convert_figma_context_to_elementor`
Convert pre-fetched Figma context data to Elementor v4 atomic widgets.

**Parameters:**
- `figma_context` (required): Figma context object with blocks and metadata

### `fetch_figma_design`
Fetch Figma design data from a URL (for inspection).

**Parameters:**
- `figma_url` (required): Figma file, frame, or node URL
- `figma_api_key` (optional): Figma API key if not set globally

## 📖 Usage Examples

### With Cursor Composer (No API Key Required)

```
Convert this Figma design to Elementor v4 atomic widgets:
https://www.figma.com/file/abc123/Hero-Section

Use my API key: fig_1234567890abcdef
```

### With Global API Key

```
Convert this Figma design to Elementor v4 atomic widgets:
https://www.figma.com/file/abc123/Hero-Section

Use heading, paragraph, and button widgets with proper styling.
```

### Command Line Usage

```bash
# Stdio mode (default)
npx figma-to-elementor-mcp --stdio

# HTTP mode
npx figma-to-elementor-mcp --http --port 3333

# With global API key
npx figma-to-elementor-mcp --figma-api-key=YOUR_KEY --stdio
```

## 📝 Output Example

```json
{
  "version": "0.4",
  "title": "Hero Section",
  "type": "page",
  "content": [
    {
      "id": "section1",
      "elType": "section",
      "settings": {
        "layout": "boxed",
        "gap": "default"
      },
      "elements": [
        {
          "id": "column1", 
          "elType": "column",
          "settings": {
            "_column_size": 100
          },
          "elements": [
            {
              "id": "heading1",
              "elType": "widget",
              "widgetType": "heading",
              "settings": {
                "title": "Welcome to Our Product",
                "header_size": "h1",
                "typography_typography": "custom",
                "typography_font_size": {
                  "unit": "px",
                  "size": 32
                }
              }
            }
          ]
        }
      ]
    }
  ]
}
```

## 🔑 Getting a Figma API Key

1. Go to [Figma Developer Settings](https://www.figma.com/developers/api#access-tokens)
2. Click "Create new personal access token"
3. Give it a descriptive name
4. Copy the token and use it with this MCP

## 🤝 Integration with Figma-Context-MCP

This MCP works alongside [Figma-Context-MCP](https://github.com/GLips/Figma-Context-MCP) for complete Figma workflows:

- **Figma-Context-MCP**: Fetches and provides Figma design context
- **Figma-to-Elementor-MCP**: Converts that context to Elementor v4 widgets

## 🚀 Development

```bash
# Clone and install
git clone https://github.com/your-username/figma-to-elementor-mcp.git
cd figma-to-elementor-mcp
npm install

# Build and run
npm run build
npm run dev
```

## 📄 License

MIT License - see LICENSE file for details.

## 🙏 Acknowledgments

- Inspired by [Figma-Context-MCP](https://github.com/GLips/Figma-Context-MCP)
- Built with the [Model Context Protocol SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- Supports [Elementor v4](https://elementor.com/) atomic widgets

---

**Ready to convert your Figma designs to Elementor?** 🎨➡️🔧

Get started: `npx figma-to-elementor-mcp --stdio` 
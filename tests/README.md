# Tests Directory

This directory contains test files for the Figma-to-Elementor MCP project.

## Files

### `successful_conversion.mjs`
The main working test file that demonstrates the complete Figma-to-Elementor conversion workflow.

**Usage:**
```bash
node tests/successful_conversion.mjs
```

**What it does:**
1. Connects to the deployed Figma-Context-MCP server
2. Fetches Figma design data using proper MCP protocol
3. Converts the design data to Elementor v4 widgets
4. Saves output files to the `test-data/` directory

**Output:**
- `test-data/figma_raw_data.yaml` - Raw Figma design data
- `test-data/elementor_success_output.json` - Converted Elementor widgets

This test serves as both a validation tool and a reference implementation for the conversion process. 
# Test Data Directory

This directory contains output files from successful Figma-to-Elementor conversions.

## Files

### `figma_raw_data.yaml`
Raw Figma design data fetched from the Figma-Context-MCP server.

**Content:**
- Design metadata (name, last modified, thumbnail)
- Node definitions with layout properties
- Style definitions (colors, typography, spacing)
- Component structure and hierarchy

**Size:** ~38KB (1,036 lines)

### `elementor_success_output.json`
Converted Elementor v4 atomic widgets ready for import.

**Content:**
- Elementor v4 compatible JSON structure
- Section, column, and widget definitions
- Widget settings and styling properties
- Complete page layout structure

**Size:** ~31KB (1,019 lines)
**Widgets:** 61 Elementor widgets created

### `elementor_v4_output.json`
Alternative Elementor output from previous conversion tests.

**Size:** ~23KB (742 lines)
**Widgets:** 32 atomic widgets

## Usage

These files serve as:
1. **Reference examples** for successful conversions
2. **Test data** for development and debugging
3. **Templates** for understanding output formats
4. **Validation samples** for ensuring conversion quality

## Regeneration

To regenerate these files, run:
```bash
node tests/successful_conversion.mjs
```

The test will overwrite `figma_raw_data.yaml` and `elementor_success_output.json` with fresh data from the latest conversion. 
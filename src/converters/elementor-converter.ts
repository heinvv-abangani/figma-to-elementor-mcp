import { FigmaContext, FigmaBlock } from '../types/figma.js';
import { ElementorDocument, ElementorSection, ElementorColumn, ElementorWidget } from '../types/elementor.js';

export function convertFigmaToElementor(figmaContext: FigmaContext): ElementorDocument {
  const blocks = figmaContext.blocks || [];
  
  const document: ElementorDocument = {
    version: '0.4',
    title: figmaContext.name || 'Figma Design',
    type: 'page',
    content: [],
    settings: {},
  };

  if (blocks.length === 0) {
    return document;
  }

  // Create a single section with one column containing all widgets
  const section: ElementorSection = {
    id: generateId(),
    elType: 'section',
    settings: {
      layout: 'boxed',
      gap: 'default',
    },
    elements: [],
  };

  const column: ElementorColumn = {
    id: generateId(),
    elType: 'column',
    settings: {
      _column_size: 100,
    },
    elements: [],
  };

  // Convert each block to Elementor widgets
  blocks.forEach(block => {
    const widgets = convertBlockToElementorWidgets(block);
    column.elements.push(...widgets);
  });

  section.elements.push(column);
  document.content.push(section);

  return document;
}

function convertBlockToElementorWidgets(block: FigmaBlock): ElementorWidget[] {
  const widgets: ElementorWidget[] = [];
  const type = block.type?.toUpperCase();
  const name = block.name?.toLowerCase() || '';

  // Text elements
  if (type === 'TEXT' && block.content) {
    if (isHeading(block)) {
      widgets.push(createHeadingWidget(block));
    } else {
      widgets.push(createParagraphWidget(block));
    }
  }
  // Button detection
  else if (isButton(block)) {
    widgets.push(createButtonWidget(block));
  }
  // Container elements
  else if (type === 'FRAME' || type === 'GROUP') {
    widgets.push(createDivBlockWidget(block));
  }
  // Generic div for other elements
  else {
    widgets.push(createDivBlockWidget(block));
  }

  // Process children
  if (block.children && block.children.length > 0) {
    block.children.forEach(child => {
      widgets.push(...convertBlockToElementorWidgets(child));
    });
  }

  return widgets;
}

function createHeadingWidget(block: FigmaBlock): ElementorWidget {
  const fontSize = block.styles?.fontSize || 24;
  const headerSize = getHeaderSize(fontSize);
  
  return {
    id: generateId(),
    elType: 'widget',
    widgetType: 'heading',
    settings: {
      title: block.content || '',
      header_size: headerSize,
      title_color: convertFigmaColorToHex(block.styles?.color),
      typography_typography: 'custom',
      typography_font_size: {
        unit: 'px',
        size: fontSize,
      },
      typography_font_weight: block.styles?.fontWeight || 400,
      typography_font_family: block.styles?.fontFamily || 'Default',
      align: convertTextAlign(block.styles?.textAlignHorizontal),
    },
  };
}

function createParagraphWidget(block: FigmaBlock): ElementorWidget {
  return {
    id: generateId(),
    elType: 'widget',
    widgetType: 'paragraph',
    settings: {
      text: block.content || '',
      text_color: convertFigmaColorToHex(block.styles?.color),
      typography_typography: 'custom',
      typography_font_size: {
        unit: 'px',
        size: block.styles?.fontSize || 16,
      },
      typography_font_weight: block.styles?.fontWeight || 400,
      typography_font_family: block.styles?.fontFamily || 'Default',
      align: convertTextAlign(block.styles?.textAlignHorizontal),
    },
  };
}

function createButtonWidget(block: FigmaBlock): ElementorWidget {
  return {
    id: generateId(),
    elType: 'widget',
    widgetType: 'button',
    settings: {
      text: block.content || block.name || 'Button',
      size: 'md',
      button_type: 'default',
      text_color: convertFigmaColorToHex(block.styles?.color),
      background_color: convertFigmaColorToHex(block.styles?.backgroundColor),
      border_radius: {
        unit: 'px',
        top: block.styles?.borderRadius || 0,
        right: block.styles?.borderRadius || 0,
        bottom: block.styles?.borderRadius || 0,
        left: block.styles?.borderRadius || 0,
        isLinked: true,
      },
      typography_typography: 'custom',
      typography_font_size: {
        unit: 'px',
        size: block.styles?.fontSize || 16,
      },
      typography_font_weight: block.styles?.fontWeight || 500,
    },
  };
}

function createDivBlockWidget(block: FigmaBlock): ElementorWidget {
  const settings: any = {};

  // Add dimensions if available
  if (block.width) {
    settings.width = {
      unit: 'px',
      size: block.width,
    };
  }

  if (block.height) {
    settings.height = {
      unit: 'px',
      size: block.height,
    };
  }

  // Add background color
  if (block.styles?.backgroundColor) {
    settings.background_background = 'classic';
    settings.background_color = convertFigmaColorToHex(block.styles.backgroundColor);
  }

  // Add border radius
  if (block.styles?.borderRadius) {
    settings.border_radius = {
      unit: 'px',
      top: block.styles.borderRadius,
      right: block.styles.borderRadius,
      bottom: block.styles.borderRadius,
      left: block.styles.borderRadius,
      isLinked: true,
    };
  }

  // Add padding
  if (block.styles?.padding) {
    const p = block.styles.padding;
    settings.padding = {
      unit: 'px',
      top: p.top || 0,
      right: p.right || 0,
      bottom: p.bottom || 0,
      left: p.left || 0,
      isLinked: false,
    };
  }

  return {
    id: generateId(),
    elType: 'widget',
    widgetType: 'div-block',
    settings,
  };
}

function isHeading(block: FigmaBlock): boolean {
  const fontSize = block.styles?.fontSize || 16;
  const fontWeight = block.styles?.fontWeight || 400;
  const name = block.name?.toLowerCase() || '';
  
  return fontSize > 20 || fontWeight >= 600 || name.includes('heading') || name.includes('title');
}

function isButton(block: FigmaBlock): boolean {
  const name = block.name?.toLowerCase() || '';
  const type = block.type?.toUpperCase();
  
  return name.includes('button') || name.includes('btn') || type === 'INSTANCE';
}

function getHeaderSize(fontSize: number): 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' {
  if (fontSize >= 32) return 'h1';
  if (fontSize >= 28) return 'h2';
  if (fontSize >= 24) return 'h3';
  if (fontSize >= 20) return 'h4';
  if (fontSize >= 18) return 'h5';
  return 'h6';
}

function convertTextAlign(align?: string): 'left' | 'center' | 'right' | 'justify' {
  if (!align) return 'left';
  
  const alignLower = align.toLowerCase();
  if (alignLower === 'center') return 'center';
  if (alignLower === 'right') return 'right';
  if (alignLower === 'justified') return 'justify';
  return 'left';
}

function convertFigmaColorToHex(color: any): string {
  if (!color) return '';
  
  if (typeof color === 'object' && color.r !== undefined) {
    const r = Math.round(color.r * 255);
    const g = Math.round(color.g * 255);
    const b = Math.round(color.b * 255);
    
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }
  
  return color?.toString() || '';
}

function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
} 
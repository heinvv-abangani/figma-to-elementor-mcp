import { FigmaNode } from '../models/figma-node';
import { ElementorWidget, ElementorDocument } from '../models/elementor-widget';

export class ElementorConverter {
  private generateClassId(widgetId: string): string {
    return `e-${widgetId}-${Math.random().toString(16).slice(2, 8)}`;
  }

  private createStyleVariant(styles: Record<string, any>) {
    return {
      meta: {
        breakpoint: "desktop",
        state: null
      },
      props: Object.entries(styles).reduce((acc, [key, value]) => {
        acc[key] = this.mapStyleProperty(key, value);
        return acc;
      }, {} as Record<string, any>)
    };
  }

  private mapStyleProperty(key: string, value: any) {
    const typeMap: Record<string, string> = {
      color: "color",
      fontSize: "size",
      fontWeight: "string",
      lineHeight: "number",
      textAlign: "string",
      backgroundColor: "color",
      gap: "size",
      padding: "size",
      borderRadius: "size",
      borderColor: "color",
      borderWidth: "size"
    };

    return {
      $$type: typeMap[key] || "string",
      value: key === "padding" || key === "borderRadius" 
        ? { size: value, unit: "px" }
        : value
    };
  }

  private mapFigmaTypeToElementor(type: string): string {
    const typeMap: Record<string, string> = {
      'FRAME': 'flexbox',
      'STACK': 'flexbox',
      'TEXT': 'e-paragraph',
      'IMAGE': 'e-image',
      'BUTTON': 'e-button',
      'SVG': 'e-svg',
      'HEADING': 'e-heading'
    };

    return typeMap[type] || 'flexbox';
  }

  public convertNodes(nodes: FigmaNode[]): ElementorDocument {
    const content = nodes.map(node => this.convertNode(node));
    return {
      content,
      page_settings: [],
      version: "0.4",
      title: "Converted Design",
      type: "flexbox"
    };
  }

  private convertNode(node: FigmaNode): ElementorWidget {
    const classId = this.generateClassId(node.id);
    const widgetType = this.mapFigmaTypeToElementor(node.type);
    
    const element: ElementorWidget = {
      id: node.id,
      settings: {
        classes: {
          $$type: "classes",
          value: [classId]
        },
        ...(node.content ? { content: node.content } : {})
      },
      elements: node.children?.map(child => this.convertNode(child)) || [],
      isInner: false,
      widgetType,
      elType: "widget",
      styles: {
        [classId]: {
          id: classId,
          label: "local",
          type: "class",
          variants: [this.createStyleVariant(node.styles || {})]
        }
      },
      version: "0.0"
    };

    return element;
  }
}
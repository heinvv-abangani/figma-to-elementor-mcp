import { FigmaNode } from '../models/figma-node';
import { 
  ElementorWidget, 
  ElementorDocument, 
  ElementorWidgetType,
  ElementorWidgetSettings,
  EParagraphSettings,
  EHeadingSettings,
  EButtonSettings
} from '../models/elementor-widget';

export class ElementorConverter {
  private generateClassId(widgetId: string): string {
    const sanitizedId = widgetId.replace(/:/g, '-');
    return `e-${sanitizedId}-${Math.random().toString(16).slice(2, 8)}`;
  }

  private createStyleVariant(styles: Record<string, any>) {
    const props = Object.entries(styles).reduce((acc, [key, value]) => {
      if (key === 'padding') {
        // Handle padding with size and unit
        if (!value || typeof value !== 'object') {
          acc.padding = {
            $$type: "size",
            value: { size: 0, unit: 'px', isLinked: true }
          };
        } else if (value.isLinked) {
          acc.padding = {
            $$type: "size",
            value: {
              size: value.size || 0,
              unit: value.unit || 'px',
              isLinked: true
            }
          };
        } else {
          // Handle unlinked padding with sizes object
          acc.padding = {
            $$type: "size",
            value: {
              size: value.size || 0,
              unit: value.unit || 'px',
              sizes: {
                top: value.sizes?.top || 0,
                bottom: value.sizes?.bottom || 0,
                left: value.sizes?.left || 0,
                right: value.sizes?.right || 0
              },
              isLinked: false
            }
          };
        }
      } else if (key === 'gap') {
        // Handle gap with size and unit
        const gapValue = value && typeof value === 'object' && value.size !== undefined
          ? value
          : { size: 0, unit: 'px' };

        acc.gap = {
          $$type: "size",
          value: gapValue
        };
      } else if (key === 'direction') {
        // Handle flex direction
        acc.flexDirection = {
          $$type: "string",
          value: value || 'row'
        };
      } else {
        acc[key] = this.mapStyleProperty(key, value);
      }
      return acc;
    }, {} as Record<string, any>);

    // Ensure color properties have proper value objects
    ['backgroundColor', 'borderColor'].forEach(key => {
      if (!props[key]) {
        props[key] = {
          $$type: "color",
          value: "#FFFFFF"
        };
      }
    });

    return {
      meta: {
        breakpoint: "desktop",
        state: null
      },
      props
    };
  }

  private mapStyleProperty(key: string, value: any) {
    const typeMap: Record<string, string> = {
      color: 'color',
      fontSize: 'size',
      fontWeight: 'string',
      lineHeight: 'number',
      textAlign: 'string',
      backgroundColor: 'color',
      gap: 'size',
      padding: 'size',
      margin: 'size',
      borderRadius: 'size',
      borderColor: 'color',
      borderWidth: 'size'
    };

    // Handle margin with directional values
    if (key === 'margin' && typeof value === 'object' && (value.top || value.right || value.bottom || value.left)) {
      return {
        $$type: 'size',
        value: {
          top: value.top || { size: 0, unit: 'px' },
          right: value.right || { size: 0, unit: 'px' },
          bottom: value.bottom || { size: 0, unit: 'px' },
          left: value.left || { size: 0, unit: 'px' }
        }
      };
    }

    // Handle padding with directional values
    if (key === 'padding' && typeof value === 'object' && (value.top || value.right || value.bottom || value.left)) {
      return {
        $$type: 'size',
        value: {
          top: value.top || { size: 0, unit: 'px' },
          right: value.right || { size: 0, unit: 'px' },
          bottom: value.bottom || { size: 0, unit: 'px' },
          left: value.left || { size: 0, unit: 'px' }
        }
      };
    }

    // Handle size values
    if (typeMap[key] === 'size') {
      if (typeof value === 'object' && value.size !== undefined) {
        return {
          $$type: 'size',
          value: {
            size: value.size,
            unit: value.unit || 'px'
          }
        };
      }
      if (!value) {
        return {
          $$type: 'size',
          value: {
            size: 0,
            unit: 'px'
          }
        };
      }
      return {
        $$type: 'size',
        value: {
          size: typeof value === 'number' ? value : 0,
          unit: 'px'
        }
      };
    }

    // Handle color values
    if (typeMap[key] === 'color') {
      return {
        $$type: 'color',
        value: value || '#FFFFFF'
      };
    }

    // Handle string values
    if (!value) {
      if (typeMap[key] === 'size') {
        return {
          $$type: 'size',
          value: {
            size: 0,
            unit: 'px'
          }
        };
      }
      return {
        $$type: typeMap[key] || 'string',
        value: ''
      };
    }

    return {
      $$type: typeMap[key] || 'string',
      value: value
    };
  }

  private mapFigmaTypeToElementor(type: string): ElementorWidgetType {
    const typeMap: Record<string, ElementorWidgetType> = {
      'FRAME': 'e-flexbox',
      'GROUP': 'e-flexbox',
      'RECTANGLE': 'e-flexbox',
      'TEXT': 'e-paragraph',
      'IMAGE': 'e-image',
      'IMAGE-SVG': 'e-svg',
      'BUTTON': 'e-button',
      'HEADING': 'e-heading'
    };

    return typeMap[type] || 'e-flexbox';
  }

  public convertNodes(nodes: FigmaNode[]): ElementorDocument {
    const content = nodes.map(node => this.convertNode(node));
    return {
      content,
      page_settings: [],
      version: '0.4',
      title: 'Converted Design',
      type: 'page',
      settings: {}
    };
  }

  private convertNode(node: FigmaNode): ElementorWidget {
    const sanitizedId = node.id.replace(/:/g, '-');
    const classId = this.generateClassId(sanitizedId);
    const widgetType = this.mapFigmaTypeToElementor(node.type);
    
    const baseSettings: ElementorWidgetSettings = {
      classes: {
        $$type: "classes",
        value: [classId]
      }
    };

    let settings: ElementorWidgetSettings = baseSettings;

    if (node.content) {
      switch (widgetType) {
        case 'e-paragraph':
          settings = {
            ...baseSettings,
            paragraph: {
              $$type: "string",
              value: node.content
            }
          } as EParagraphSettings;
          break;
        case 'e-heading':
          settings = {
            ...baseSettings,
            title: {
              $$type: "string",
              value: node.content
            },
            level: {
              $$type: "string",
              value: "h2"
            }
          } as EHeadingSettings;
          break;
        case 'e-button':
          settings = {
            ...baseSettings,
            text: {
              $$type: "string",
              value: node.content
            },
            link: {
              $$type: "link",
              value: {
                url: "",
                target: "_self"
              }
            }
          } as EButtonSettings;
          break;
      }
    }
    
    const element: ElementorWidget = {
      id: sanitizedId,
      settings,
      elements: node.children?.map(child => this.convertNode(child)) || [],
      isInner: false,
      widgetType: widgetType,
      elType: widgetType === 'e-flexbox' ? "e-flexbox" : "widget",
      styles: {
        [classId]: {
          id: classId,
          label: "local",
          type: "class",
          variants: [this.createStyleVariant(node.styles || {})]
        }
      },
      editor_settings: [],
      version: "0.0"
    };

    return element;
  }
}
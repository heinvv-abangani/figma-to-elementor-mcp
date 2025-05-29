import { FigmaNode } from '../models/figma-node';
import { ElementorWidget, ElementorDocument } from '../models/elementor-widget';

export class ElementorConverter {
  private generateClassId(widgetId: string): string {
    return `e-${widgetId}-${Math.random().toString(16).slice(2, 8)}`;
  }

  public convertNodes(nodes: FigmaNode[], metadata: { name?: string }): ElementorDocument {
    const flexboxId = `flexbox_${Date.now()}`;
    const flexboxClass = this.generateClassId(flexboxId);

    return {
      content: [{
        id: flexboxId,
        settings: {
          classes: {
            $$type: "classes",
            value: [flexboxClass]
          }
        },
        elements: [
          this.createHeadingWidget(metadata.name || 'Figma Design'),
          ...nodes.map((node, index) => this.createParagraphWidget(node, index))
        ],
        isInner: false,
        elType: "e-flexbox",
        styles: {
          [flexboxClass]: {
            id: flexboxClass,
            label: "local",
            type: "class",
            variants: [{
              meta: { breakpoint: "desktop", state: null },
              props: {
                "flex-direction": { $$type: "string", value: "column" },
                "gap": { $$type: "size", value: { size: 20, unit: "px" } },
                "background-color": { $$type: "color", value: "#FFFFFF" }
              }
            }]
          }
        },
        version: "0.0"
      }],
      page_settings: [],
      version: "0.4",
      title: metadata.name || "Figma Design",
      type: "e-flexbox"
    };
  }

  private createHeadingWidget(title: string): ElementorWidget {
    const widgetId = `heading_${Date.now()}`;
    const widgetClass = this.generateClassId(widgetId);

    return {
      id: widgetId,
      settings: {
        classes: {
          $$type: "classes",
          value: [widgetClass]
        }
      },
      widgetType: "e-heading",
      elType: "widget",
      styles: {
        [widgetClass]: {
          id: widgetClass,
          label: "local",
          type: "class",
          variants: [{
            meta: { breakpoint: "desktop", state: null },
            props: {
              "font-family": { $$type: "string", value: "Tahoma" },
              "font-weight": { $$type: "string", value: "600" },
              "font-size": { $$type: "size", value: { size: 32, unit: "px" } }
            }
          }]
        }
      },
      version: "0.0",
      elements: [],
      isInner: false
    };
  }

  private createParagraphWidget(node: FigmaNode, index: number): ElementorWidget {
    const widgetId = `paragraph_${Date.now()}_${index}`;
    const widgetClass = this.generateClassId(widgetId);

    return {
      id: widgetId,
      settings: {
        classes: {
          $$type: "classes",
          value: [widgetClass]
        }
      },
      widgetType: "e-paragraph",
      elType: "widget",
      styles: {
        [widgetClass]: {
          id: widgetClass,
          label: "local",
          type: "class",
          variants: [{
            meta: { breakpoint: "desktop", state: null },
            props: {
              "color": { $$type: "color", value: "#0C0D0E" },
              "font-size": { $$type: "size", value: { size: 16, unit: "px" } }
            }
          }]
        }
      },
      version: "0.0",
      elements: [],
      isInner: false
    };
  }
} 
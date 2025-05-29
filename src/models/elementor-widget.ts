export interface ElementorWidget {
  id: string;
  settings: {
    classes: {
      $$type: string;
      value: string[];
    };
    content?: string;
  };
  elements: ElementorWidget[];
  isInner: boolean;
  widgetType: string;
  elType: string;
  styles: Record<string, {
    id: string;
    label: string;
    type: string;
    variants: Array<{
      meta: {
        breakpoint: string;
        state: string | null;
      };
      props: Record<string, {
        $$type: string;
        value: any;
      }>;
    }>;
  }>;
  version: string;
}
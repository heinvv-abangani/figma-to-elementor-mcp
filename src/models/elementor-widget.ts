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
  styles: {
    [key: string]: {
      id: string;
      label: string;
      type: string;
      variants: Array<{
        meta: {
          breakpoint: string;
          state: null;
        };
        props: Record<string, any>;
      }>;
    };
  };
  version: string;
}

export interface ElementorDocument {
  content: ElementorWidget[];
  page_settings: any[];
  version: string;
  title: string;
  type: string;
}
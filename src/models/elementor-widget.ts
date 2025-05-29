export type StyleValueType = 'color' | 'size' | 'string' | 'number' | 'background' | 'border' | 'shadow' | 'box-shadow';

export interface StyleValue {
  $$type: StyleValueType;
  value: any;
}

export interface StyleVariant {
  meta: {
    breakpoint: 'desktop' | 'tablet' | 'mobile';
    state: null | 'hover' | 'active' | 'focus';
  };
  props: Record<string, StyleValue>;
}

export interface ElementorWidget {
  id: string;
  settings: {
    classes: {
      $$type: string;
      value: string[];
    };
    content?: string;
  };
  elements?: ElementorWidget[];
  isInner: boolean;
  widgetType?: string;
  elType: string;
  styles: Record<string, {
    id: string;
    label: string;
    type: 'class' | 'id';
    variants: StyleVariant[];
  }>;
  version: string;
}

export interface ElementorDocument {
  content: ElementorWidget[];
  page_settings: any[];
  version: string;
  title: string;
  type: string;
} 
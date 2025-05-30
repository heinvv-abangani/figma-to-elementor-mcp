export interface ElementorDocument {
  version: string;
  title: string;
  type: string;
  content: ElementorWidget[];
  settings: Record<string, any>;
  page_settings: any[];
}

export interface ElementorWidget {
  id: string;
  elType: 'widget' | 'e-flexbox';
  widgetType: ElementorWidgetType;
  settings: ElementorWidgetSettings;
  elements: ElementorWidget[];
  isInner: boolean;
  styles: Record<string, ElementorStyle>;
  version: string;
  editor_settings?: any[];
}

export interface ElementorStyle {
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
}

export type ElementorWidgetType =
  | 'e-flexbox'
  | 'e-heading'
  | 'e-paragraph'
  | 'e-image'
  | 'e-button'
  | 'e-svg';

export interface ElementorWidgetSettings {
  classes: {
    $$type: string;
    value: string[];
  };
}

export interface EParagraphSettings extends ElementorWidgetSettings {
  paragraph: {
    $$type: string;
    value: string;
  };
}

export interface EHeadingSettings extends ElementorWidgetSettings {
  title: {
    $$type: string;
    value: string;
  };
  level: {
    $$type: string;
    value: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  };
}

export interface EButtonSettings extends ElementorWidgetSettings {
  text: {
    $$type: string;
    value: string;
  };
  link: {
    $$type: string;
    value: {
      url: string;
      target: string;
    };
  };
}

// Common style settings for all v4 widgets
export interface CommonV4Styles {
  typography?: {
    family?: string;
    size?: {
      size: number;
      unit: string;
    };
    weight?: number;
    lineHeight?: {
      size: number;
      unit: string;
    };
  };
  size?: {
    width?: {
      size: number;
      unit: string;
    };
    height?: {
      size: number;
      unit: string;
    };
  };
  spacing?: {
    padding?: {
      size: number;
      unit: string;
    };
    margin?: {
      size: number;
      unit: string;
    };
    gap?: {
      size: number;
      unit: string;
    };
  };
}

// V4 Widget Types
export interface FlexboxSettings extends ElementorWidgetSettings, CommonV4Styles {
  direction?: 'row' | 'column';
  justifyContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
  alignItems?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
}

export interface EImageSettings extends ElementorWidgetSettings, CommonV4Styles {
  url?: string;
  alt?: string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none';
}

export interface ESvgSettings extends ElementorWidgetSettings, CommonV4Styles {
  url?: string;
  color?: string;
}
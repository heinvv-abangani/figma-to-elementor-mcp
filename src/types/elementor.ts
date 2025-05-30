export interface ElementorDocument {
  version: string;
  title: string;
  type: string;
  content: ElementorSection[];
  settings: Record<string, any>;
}

export interface ElementorSection {
  id: string;
  elType: 'section';
  settings: ElementorSectionSettings;
  elements: ElementorColumn[];
}

export interface ElementorColumn {
  id: string;
  elType: 'column';
  settings: ElementorColumnSettings;
  elements: ElementorWidget[];
}

export interface ElementorWidget {
  id: string;
  elType: 'widget';
  widgetType: ElementorWidgetType;
  settings: Record<string, any>;
}

export type ElementorWidgetType =
  | 'flexbox'
  | 'e-heading'
  | 'e-paragraph'
  | 'e-image'
  | 'e-button'
  | 'e-svg';

export interface ElementorSectionSettings {
  layout?: 'boxed' | 'full_width';
  content_width?: 'boxed' | 'full_width';
  gap?: 'default' | 'no' | 'narrow' | 'extended' | 'wide' | 'wider';
  height?: 'default' | 'full' | 'min-height';
  custom_height?: {
    unit: string;
    size: number;
  };
  background_background?: 'classic' | 'gradient';
  background_color?: string;
  background_image?: {
    url: string;
    id: number;
  };
  padding?: {
    unit: string;
    top: number;
    right: number;
    bottom: number;
    left: number;
    isLinked: boolean;
  };
  margin?: {
    unit: string;
    top: number;
    right: number;
    bottom: number;
    left: number;
    isLinked: boolean;
  };
}

export interface ElementorColumnSettings {
  _column_size?: number;
  _inline_size?: number;
  background_background?: 'classic' | 'gradient';
  background_color?: string;
  padding?: {
    unit: string;
    top: number;
    right: number;
    bottom: number;
    left: number;
    isLinked: boolean;
  };
  margin?: {
    unit: string;
    top: number;
    right: number;
    bottom: number;
    left: number;
    isLinked: boolean;
  };
}

export interface ElementorHeadingSettings {
  title?: string;
  size?: 'default' | 'small' | 'medium' | 'large' | 'xl' | 'xxl';
  header_size?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  title_color?: string;
  typography_typography?: 'default' | 'custom';
  typography_font_family?: string;
  typography_font_size?: {
    unit: string;
    size: number;
  };
  typography_font_weight?: string | number;
  typography_line_height?: {
    unit: string;
    size: number;
  };
  align?: 'left' | 'center' | 'right' | 'justify';
  text_shadow_text_shadow_type?: 'yes' | '';
  blend_mode?: 'normal' | 'multiply' | 'screen' | 'overlay';
}

export interface ElementorParagraphSettings {
  text?: string;
  text_color?: string;
  typography_typography?: 'default' | 'custom';
  typography_font_family?: string;
  typography_font_size?: {
    unit: string;
    size: number;
  };
  typography_font_weight?: string | number;
  typography_line_height?: {
    unit: string;
    size: number;
  };
  align?: 'left' | 'center' | 'right' | 'justify';
}

export interface ElementorButtonSettings {
  text?: string;
  link?: {
    url: string;
    is_external: boolean;
    nofollow: boolean;
  };
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  button_type?: 'default' | 'info' | 'success' | 'warning' | 'danger';
  text_color?: string;
  background_color?: string;
  border_border?: 'none' | 'solid' | 'double' | 'dotted' | 'dashed' | 'groove';
  border_color?: string;
  border_width?: {
    unit: string;
    top: number;
    right: number;
    bottom: number;
    left: number;
    isLinked: boolean;
  };
  border_radius?: {
    unit: string;
    top: number;
    right: number;
    bottom: number;
    left: number;
    isLinked: boolean;
  };
  button_text_padding?: {
    unit: string;
    top: number;
    right: number;
    bottom: number;
    left: number;
    isLinked: boolean;
  };
  typography_typography?: 'default' | 'custom';
  typography_font_family?: string;
  typography_font_size?: {
    unit: string;
    size: number;
  };
  typography_font_weight?: string | number;
  hover_color?: string;
  hover_background_color?: string;
  hover_border_color?: string;
}

export interface ElementorImageSettings {
  image?: {
    url: string;
    id: number;
    alt?: string;
  };
  image_size?: 'thumbnail' | 'medium' | 'large' | 'full' | 'custom';
  width?: {
    unit: string;
    size: number;
  };
  max_width?: {
    unit: string;
    size: number;
  };
  height?: {
    unit: string;
    size: number;
  };
  object_fit?: 'fill' | 'cover' | 'contain' | 'scale-down' | 'none';
  object_position?: string;
  align?: 'left' | 'center' | 'right';
  caption_source?: 'none' | 'attachment' | 'custom';
  caption?: string;
  link_to?: 'none' | 'file' | 'custom';
  link?: {
    url: string;
    is_external: boolean;
    nofollow: boolean;
  };
  open_lightbox?: 'default' | 'yes' | 'no';
} 
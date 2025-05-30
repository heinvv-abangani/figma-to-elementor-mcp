export interface FigmaNode {
  id: string;
  name: string;
  type: string;
  styles?: {
    // Typography
    color?: string;
    fontSize?: {
      size: number;
      unit: string;
    };
    fontWeight?: string | number;
    fontFamily?: string;
    lineHeight?: number;
    letterSpacing?: number;
    textAlign?: 'left' | 'center' | 'right' | 'justify';
    textDecoration?: string;
    
    // Layout
    display?: string;
    flexDirection?: string;
    flexWrap?: string;
    justifyContent?: string;
    alignItems?: string;
    gap?: {
      size: number;
      unit: string;
    };
    
    // Background
    backgroundColor?: string;
    backgroundImage?: string;
    backgroundSize?: string;
    backgroundPosition?: string;
    backgroundRepeat?: string;
    
    // Borders
    borderColor?: string;
    borderWidth?: {
      size: number;
      unit: string;
    };
    borderRadius?: {
      size: number;
      unit: string;
    };
    borderStyle?: string;
    
    // Spacing
    padding?: {
      size: number;
      unit: string;
    };
    margin?: {
      size: number;
      unit: string;
    } | {
      top?: {
        size: number;
        unit: string;
      };
      right?: {
        size: number;
        unit: string;
      };
      bottom?: {
        size: number;
        unit: string;
      };
      left?: {
        size: number;
        unit: string;
      };
    };
    
    // Effects
    opacity?: number;
    boxShadow?: string;
  };
  content?: string;
  width?: number;
  height?: number;
  children?: FigmaNode[];
} 
export interface FigmaNode {
  id: string;
  name: string;
  type: string;
  styles?: {
    // Typography
    color?: string;
    fontSize?: number;
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
    gap?: number;
    
    // Background
    backgroundColor?: string;
    backgroundImage?: string;
    backgroundSize?: string;
    backgroundPosition?: string;
    backgroundRepeat?: string;
    
    // Borders
    borderColor?: string;
    borderWidth?: number;
    borderRadius?: number;
    borderStyle?: string;
    
    // Spacing
    padding?: {
      top?: number;
      right?: number;
      bottom?: number;
      left?: number;
    };
    margin?: {
      top?: number;
      right?: number;
      bottom?: number;
      left?: number;
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
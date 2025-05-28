import axios from 'axios';

export interface FigmaNode {
  id: string;
  name: string;
  type: string;
  children?: FigmaNode[];
  characters?: string;
  fills?: any[];
  strokes?: any[];
  effects?: any[];
  absoluteBoundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  constraints?: any;
  layoutMode?: string;
  primaryAxisSizingMode?: string;
  counterAxisSizingMode?: string;
  paddingLeft?: number;
  paddingRight?: number;
  paddingTop?: number;
  paddingBottom?: number;
  itemSpacing?: number;
  style?: {
    fontFamily?: string;
    fontWeight?: number;
    fontSize?: number;
    lineHeightPx?: number;
    letterSpacing?: number;
    textAlignHorizontal?: string;
    textAlignVertical?: string;
  };
}

export interface FigmaFile {
  name: string;
  lastModified: string;
  thumbnailUrl: string;
  version: string;
  document: FigmaNode;
}

export class FigmaApiClient {
  private apiKey: string;
  private baseUrl = 'https://api.figma.com/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private getHeaders() {
    return {
      'X-Figma-Token': this.apiKey,
      'Content-Type': 'application/json',
    };
  }

  async getFile(fileKey: string): Promise<FigmaFile> {
    try {
      const response = await axios.get(`${this.baseUrl}/files/${fileKey}`, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching Figma file:', error);
      throw new Error(`Failed to fetch Figma file: ${error}`);
    }
  }

  async getNode(fileKey: string, nodeId: string): Promise<FigmaNode> {
    try {
      const response = await axios.get(`${this.baseUrl}/files/${fileKey}/nodes`, {
        headers: this.getHeaders(),
        params: {
          ids: nodeId,
        },
      });
      
      const nodeData = response.data.nodes[nodeId];
      if (!nodeData) {
        throw new Error(`Node ${nodeId} not found`);
      }
      
      return nodeData.document;
    } catch (error) {
      console.error('Error fetching Figma node:', error);
      throw new Error(`Failed to fetch Figma node: ${error}`);
    }
  }

  parseUrl(figmaUrl: string): { fileKey: string; nodeId?: string } {
    // Parse Figma URLs like:
    // https://www.figma.com/file/abc123/Design-Name
    // https://www.figma.com/design/abc123/Design-Name?node-id=123-456
    
    const urlPattern = /figma\.com\/(file|design)\/([a-zA-Z0-9]+)/;
    const nodePattern = /node-id=([^&]+)/;
    
    const fileMatch = figmaUrl.match(urlPattern);
    const nodeMatch = figmaUrl.match(nodePattern);
    
    if (!fileMatch) {
      throw new Error('Invalid Figma URL format');
    }
    
    const fileKey = fileMatch[2];
    const nodeId = nodeMatch ? nodeMatch[1].replace('-', ':') : undefined;
    
    return { fileKey, nodeId };
  }

  async fetchDesignData(figmaUrl: string): Promise<{ file: FigmaFile; node?: FigmaNode; fileKey: string; nodeId?: string }> {
    const { fileKey, nodeId } = this.parseUrl(figmaUrl);
    
    const file = await this.getFile(fileKey);
    let node: FigmaNode | undefined;
    
    if (nodeId) {
      node = await this.getNode(fileKey, nodeId);
    }
    
    return { file, node, fileKey, nodeId };
  }
} 
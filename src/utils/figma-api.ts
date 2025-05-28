import axios, { AxiosResponse } from 'axios';
import { FigmaFile, FigmaNode, FigmaContext, FigmaBlock } from '../types/figma.js';
import { ApiError, FigmaApiResponse } from '../types/common.js';

export class FigmaApiClient {
  private apiKey: string;
  private baseUrl = 'https://api.figma.com/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async makeRequest<T>(endpoint: string): Promise<T> {
    try {
      const response: AxiosResponse<T> = await axios.get(`${this.baseUrl}${endpoint}`, {
        headers: {
          'X-Figma-Token': this.apiKey,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      });

      return response.data;
    } catch (error: any) {
      const apiError: ApiError = new Error(
        error.response?.data?.message || error.message || 'Figma API request failed'
      );
      apiError.status = error.response?.status;
      apiError.code = error.response?.data?.code;
      throw apiError;
    }
  }

  async getFile(fileKey: string): Promise<FigmaFile> {
    return this.makeRequest<FigmaFile>(`/files/${fileKey}`);
  }

  async getNode(fileKey: string, nodeId: string): Promise<{ nodes: Record<string, FigmaNode> }> {
    return this.makeRequest<{ nodes: Record<string, FigmaNode> }>(`/files/${fileKey}/nodes?ids=${nodeId}`);
  }

  async getFileNodes(fileKey: string, nodeIds: string[]): Promise<{ nodes: Record<string, FigmaNode> }> {
    const ids = nodeIds.join(',');
    return this.makeRequest<{ nodes: Record<string, FigmaNode> }>(`/files/${fileKey}/nodes?ids=${ids}`);
  }

  extractFileKeyFromUrl(figmaUrl: string): string | null {
    const patterns = [
      /figma\.com\/file\/([a-zA-Z0-9]+)/,
      /figma\.com\/design\/([a-zA-Z0-9]+)/,
      /figma\.com\/proto\/([a-zA-Z0-9]+)/,
    ];

    for (const pattern of patterns) {
      const match = figmaUrl.match(pattern);
      if (match) {
        return match[1];
      }
    }

    return null;
  }

  extractNodeIdFromUrl(figmaUrl: string): string | null {
    const match = figmaUrl.match(/node-id=([^&]+)/);
    if (match) {
      return decodeURIComponent(match[1]);
    }
    return null;
  }

  async fetchFigmaDesign(figmaUrl: string): Promise<FigmaContext> {
    const fileKey = this.extractFileKeyFromUrl(figmaUrl);
    if (!fileKey) {
      throw new Error('Invalid Figma URL: Could not extract file key');
    }

    const nodeId = this.extractNodeIdFromUrl(figmaUrl);
    
    try {
      if (nodeId) {
        // Fetch specific node
        const nodeResponse = await this.getNode(fileKey, nodeId);
        const node = nodeResponse.nodes[nodeId];
        
        if (!node) {
          throw new Error(`Node ${nodeId} not found in file ${fileKey}`);
        }

        const blocks = this.convertNodeToBlocks(node);
        
        return {
          fileKey,
          name: node.name || 'Figma Design',
          blocks,
          metadata: {
            lastModified: new Date().toISOString(),
          },
        };
      } else {
        // Fetch entire file
        const file = await this.getFile(fileKey);
        const blocks = this.convertNodeToBlocks(file.document);
        
        return {
          fileKey,
          name: file.name,
          blocks,
          metadata: {
            lastModified: file.lastModified,
            version: file.version,
            thumbnailUrl: file.thumbnailUrl,
          },
        };
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`Failed to fetch Figma design: ${error}`);
    }
  }

  private convertNodeToBlocks(node: FigmaNode): FigmaBlock[] {
    const blocks: FigmaBlock[] = [];

    const convertNode = (figmaNode: FigmaNode): FigmaBlock => {
      const block: FigmaBlock = {
        id: figmaNode.id,
        type: figmaNode.type,
        name: figmaNode.name,
      };

      // Add position and size
      if (figmaNode.absoluteBoundingBox) {
        block.x = figmaNode.absoluteBoundingBox.x;
        block.y = figmaNode.absoluteBoundingBox.y;
        block.width = figmaNode.absoluteBoundingBox.width;
        block.height = figmaNode.absoluteBoundingBox.height;
      }

      // Add text content
      if (figmaNode.characters) {
        block.content = figmaNode.characters;
      }

      // Add styles
      block.styles = {};
      
      if (figmaNode.style) {
        block.styles = {
          ...figmaNode.style,
        };
      }

      if (figmaNode.fills && figmaNode.fills.length > 0) {
        const fill = figmaNode.fills[0];
        if (fill.color) {
          block.styles.color = fill.color;
        }
      }

      if (figmaNode.cornerRadius) {
        block.styles.borderRadius = figmaNode.cornerRadius;
      }

      // Add layout properties
      if (figmaNode.layoutMode) {
        block.styles.layoutMode = figmaNode.layoutMode;
      }

      if (figmaNode.paddingLeft !== undefined) {
        block.styles.padding = {
          left: figmaNode.paddingLeft,
          right: figmaNode.paddingRight || 0,
          top: figmaNode.paddingTop || 0,
          bottom: figmaNode.paddingBottom || 0,
        };
      }

      if (figmaNode.itemSpacing) {
        block.styles.gap = figmaNode.itemSpacing;
      }

      // Convert children
      if (figmaNode.children && figmaNode.children.length > 0) {
        block.children = figmaNode.children.map(convertNode);
      }

      return block;
    };

    if (node.children) {
      blocks.push(...node.children.map(convertNode));
    } else {
      blocks.push(convertNode(node));
    }

    return blocks;
  }
} 
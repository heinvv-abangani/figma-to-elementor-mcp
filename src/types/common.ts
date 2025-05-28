export interface ServerConfig {
  figmaApiKey: string;
  port: number;
  mode: 'stdio' | 'http';
}

export interface ConversionOptions {
  saveFiles?: boolean;
  outputDir?: string;
  minify?: boolean;
}

export interface ConversionResult {
  elementor: any;
  metadata: {
    figmaUrl?: string;
    blocksProcessed: number;
    conversionSuccessful: boolean;
    timestamp: string;
  };
}

export interface ElementorResult {
  document: any;
  widgets: any[];
}

export interface ApiError extends Error {
  status?: number;
  code?: string;
}

export interface FigmaApiResponse<T = any> {
  data?: T;
  error?: string;
  status: number;
}

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface Logger {
  debug(message: string, ...args: any[]): void;
  info(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  error(message: string, ...args: any[]): void;
} 
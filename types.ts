
export type Category = 'hardware' | 'software' | 'ai' | 'networking';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  image?: string;
  groundingLinks?: GroundingChunk[];
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}

export interface DiagnosticState {
  isAnalyzing: boolean;
  progress: number;
  status: string;
}

// Shared type definitions for the application
export interface Quote {
  id?: number;
  created_at?: string;
  text: string;
  author: string;
  category: string;
  image_url?: string | null;
}

export interface GeneratedQuote {
  text: string;
  category: string;
}

export interface QuoteGenerationRequest {
  prompt: string;
  authorName: string;
}

export interface QuoteGenerationResponse {
  quotes: Quote[];
}
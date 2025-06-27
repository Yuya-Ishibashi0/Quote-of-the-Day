import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL');
}

if (!supabaseAnonKey) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types for better TypeScript support
export interface Quote {
  id?: number;
  created_at?: string;
  text: string;
  author: string;
  category: string;
  image_url?: string | null;
}

// Helper functions for quote operations
export const quoteService = {
  // Get all quotes
  async getAllQuotes(): Promise<Quote[]> {
    const { data, error } = await supabase
      .from('quotes')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching quotes:', error);
      throw error;
    }
    
    return data || [];
  },

  // Get quotes by category
  async getQuotesByCategory(category: string): Promise<Quote[]> {
    const { data, error } = await supabase
      .from('quotes')
      .select('*')
      .eq('category', category)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching quotes by category:', error);
      throw error;
    }
    
    return data || [];
  },

  // Add a new quote
  async addQuote(quote: Omit<Quote, 'id' | 'created_at'>): Promise<Quote> {
    const { data, error } = await supabase
      .from('quotes')
      .insert([quote])
      .select()
      .single();
    
    if (error) {
      console.error('Error adding quote:', error);
      throw error;
    }
    
    return data;
  },

  // Search quotes
  async searchQuotes(searchTerm: string): Promise<Quote[]> {
    const { data, error } = await supabase
      .from('quotes')
      .select('*')
      .or(`text.ilike.%${searchTerm}%,author.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error searching quotes:', error);
      throw error;
    }
    
    return data || [];
  },

  // Get random quote
  async getRandomQuote(): Promise<Quote | null> {
    const { data, error } = await supabase
      .from('quotes')
      .select('*');
    
    if (error) {
      console.error('Error fetching random quote:', error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      return null;
    }
    
    const randomIndex = Math.floor(Math.random() * data.length);
    return data[randomIndex];
  },

  // Delete a quote
  async deleteQuote(id: number): Promise<void> {
    const { error } = await supabase
      .from('quotes')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting quote:', error);
      throw error;
    }
  }
};
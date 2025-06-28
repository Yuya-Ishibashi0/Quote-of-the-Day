'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Search, Filter, Heart, Share2, Calendar, User } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import Image from 'next/image';

interface Quote {
  id: number;
  text: string;
  author: string;
  category: string;
  created_at: string;
  image_url?: string | null;
  like_count?: number;
}

export default function QuotesArchive() {
  const { toast } = useToast();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [filteredQuotes, setFilteredQuotes] = useState<Quote[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [likedQuotes, setLikedQuotes] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLiking, setIsLiking] = useState(false);

  // Fetch quotes from Supabase
  useEffect(() => {
    const fetchQuotes = async () => {
      try {
        const { data, error } = await supabase
          .from('quotes')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching quotes:', error);
          return;
        }

        setQuotes(data || []);
        
        // Extract unique categories
        const uniqueCategories = Array.from(new Set(data?.map(quote => quote.category) || []));
        setCategories(uniqueCategories);
      } catch (error) {
        console.error('Error fetching quotes:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuotes();
  }, []);

  // Filter quotes based on search and category
  useEffect(() => {
    let filtered = quotes.filter(quote => {
      const matchesSearch = quote.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           quote.author.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || quote.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    setFilteredQuotes(filtered);
  }, [quotes, searchTerm, selectedCategory]);

  const likeQuote = async (quote: Quote) => {
    if (likedQuotes.has(quote.id) || isLiking) {
      return;
    }

    setIsLiking(true);
    
    // Optimistically update the UI
    const newLikeCount = (quote.like_count || 0) + 1;
    
    // Update quotes state
    setQuotes(prev => 
      prev.map(q => 
        q.id === quote.id 
          ? { ...q, like_count: newLikeCount }
          : q
      )
    );
    
    // Mark as liked in this session
    setLikedQuotes(prev => new Set([...prev, quote.id]));

    try {
      const response = await fetch('/api/like', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: quote.id }),
      });

      if (!response.ok) {
        throw new Error('Failed to like quote');
      }

      const data = await response.json();
      
      // Update with the actual like count from the server
      setQuotes(prev => 
        prev.map(q => 
          q.id === quote.id 
            ? { ...q, like_count: data.likeCount }
            : q
        )
      );

    } catch (error) {
      console.error('Failed to like quote:', error);
      
      // Revert optimistic update on error
      const originalLikeCount = (quote.like_count || 0);
      
      setQuotes(prev => 
        prev.map(q => 
          q.id === quote.id 
            ? { ...q, like_count: originalLikeCount }
            : q
        )
      );
      
      // Remove from liked set
      setLikedQuotes(prev => {
        const newSet = new Set(prev);
        newSet.delete(quote.id);
        return newSet;
      });

      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to like the quote. Please try again.',
      });
    } finally {
      setIsLiking(false);
    }
  };

  const shareQuote = (quote: Quote) => {
    // Construct the URL for our dynamic quote page
    const baseUrl = window.location.origin;
    const quoteUrl = new URL('/q', baseUrl);
    quoteUrl.searchParams.set('text', quote.text);
    quoteUrl.searchParams.set('author', quote.author);
    quoteUrl.searchParams.set('category', quote.category);

    // Construct Twitter Web Intent URL
    const tweetText = 'Check out this inspiring quote:';
    const twitterUrl = new URL('https://twitter.com/intent/tweet');
    twitterUrl.searchParams.set('text', tweetText);
    twitterUrl.searchParams.set('url', quoteUrl.toString());

    // Open Twitter intent in new tab
    window.open(twitterUrl.toString(), '_blank');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-slate-600">Loading your quote archive...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
            Quote
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              {' '}Archive
            </span>
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Your personal collection of inspiring quotes, saved with beautiful preview images.
          </p>
        </div>

        <div className="mb-8 bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-slate-200">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                type="text"
                placeholder="Search quotes or authors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 text-lg border-slate-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-slate-600" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-slate-300 rounded-lg bg-white text-slate-700 focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="All">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-slate-600">
            Showing {filteredQuotes.length} of {quotes.length} quotes
          </p>
        </div>

        {filteredQuotes.length === 0 && !isLoading ? (
          <div className="text-center py-12">
            <div className="text-slate-500 text-xl mb-4">
              {quotes.length === 0 ? 'No quotes saved yet' : 'No quotes found'}
            </div>
            <p className="text-slate-400 mb-6">
              {quotes.length === 0 
                ? 'Start creating and saving your personal quotes to build your archive.'
                : 'Try adjusting your search terms or category filter.'
              }
            </p>
            {quotes.length === 0 && (
              <Button 
                onClick={() => window.location.href = '/'}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
              >
                Create Your First Quote
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredQuotes.map((quote) => (
              <Card 
                key={quote.id} 
                className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] overflow-hidden"
              >
                <div className="h-full flex flex-col">
                  {/* Quote Image */}
                  {quote.image_url && (
                    <div className="relative h-48 w-full">
                        <Image
                      src={`/api/og?text=${encodeURIComponent(q.text)}&author=${encodeURIComponent(q.author)}`}
                      width={1200}
                      height={630}
                      alt="Quote preview"
                      unoptimized  // ← Vercel 以外の環境や崩れが出る場合はバイパス
                      priority     // LCP 対策（必要なら）
                      sizes="(max-width: 768px) 100vw, 1200px"
                    />
                    </div>
                  )}
                  
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="mb-4">
                      <Badge 
                        variant="secondary" 
                        className="bg-blue-100 text-blue-800 hover:bg-blue-200"
                      >
                        {quote.category}
                      </Badge>
                    </div>
                    
                    <blockquote className="flex-1 text-slate-800 text-lg leading-relaxed mb-4 font-serif">
                      "{quote.text}"
                    </blockquote>
                    
                    <div className="space-y-4">
                      <div className="flex items-center text-slate-600 font-medium">
                        <User className="h-4 w-4 mr-2" />
                        {quote.author}
                      </div>
                      
                      <div className="flex items-center text-sm text-slate-500">
                        <Calendar className="h-4 w-4 mr-2" />
                        {formatDate(quote.created_at)}
                      </div>
                      
                      <div className="flex justify-between items-center pt-4 border-t border-slate-200">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => likeQuote(quote)}
                          disabled={likedQuotes.has(quote.id) || isLiking}
                          className={`transition-colors duration-200 ${
                            likedQuotes.has(quote.id)
                              ? 'text-red-600 hover:text-red-700'
                              : 'text-slate-500 hover:text-slate-700'
                          }`}
                        >
                          <Heart 
                            className={`h-4 w-4 mr-1 ${
                              likedQuotes.has(quote.id) ? 'fill-current' : ''
                            }`} 
                          />
                          <span>{quote.like_count || 0}</span>
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => shareQuote(quote)}
                          className="text-slate-500 hover:text-slate-700 transition-colors duration-200"
                        >
                          <Share2 className="h-4 w-4 mr-1" />
                          Share
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
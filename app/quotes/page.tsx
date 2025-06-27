'use client';Add commentMore actions

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Heart, Share2 } from 'lucide-react';

interface Quote {
  id: number;
  text: string;
  author: string;
  category: string;
  date: string;
}

const allQuotes: Quote[] = [
  {
    id: 1,
    text: "The only way to do great work is to love what you do.",
    author: "Steve Jobs",
    category: "Motivation",
    date: "2025-01-15"
  },
  {
    id: 2,
    text: "Life is what happens to you while you're busy making other plans.",
    author: "John Lennon",
    category: "Life",
    date: "2025-01-14"
  },
  {
    id: 3,
    text: "The future belongs to those who believe in the beauty of their dreams.",
    author: "Eleanor Roosevelt",
    category: "Dreams",
    date: "2025-01-13"
  },
  {
    id: 4,
    text: "It is during our darkest moments that we must focus to see the light.",
    author: "Aristotle",
    category: "Hope",
    date: "2025-01-12"
  },
  {
    id: 5,
    text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    author: "Winston Churchill",
    category: "Success",
    date: "2025-01-11"
  },
  {
    id: 6,
    text: "The only impossible journey is the one you never begin.",
    author: "Tony Robbins",
    category: "Journey",
    date: "2025-01-10"
  },
  {
    id: 7,
    text: "Innovation distinguishes between a leader and a follower.",
    author: "Steve Jobs",
    category: "Innovation",
    date: "2025-01-09"
  },
  {
    id: 8,
    text: "The way to get started is to quit talking and begin doing.",
    author: "Walt Disney",
    category: "Action",
    date: "2025-01-08"
  },
  {
    id: 9,
    text: "Don't let yesterday take up too much of today.",
    author: "Will Rogers",
    category: "Present",
    date: "2025-01-07"
  },
  {
    id: 10,
    text: "You learn more from failure than from success. Don't let it stop you. Failure builds character.",
    author: "Unknown",
    category: "Failure",
    date: "2025-01-06"
  },
  {
    id: 11,
    text: "Whether you think you can or you think you can't, you're right.",
    author: "Henry Ford",
    category: "Mindset",
    date: "2025-01-05"
  },
  {
    id: 12,
    text: "The only person you are destined to become is the person you decide to be.",
    author: "Ralph Waldo Emerson",
    category: "Self-Development",
    date: "2025-01-04"
  }
];

const categories = Array.from(new Set(allQuotes.map(quote => quote.category)));

export default function QuotesArchive() {
  const [quotes, setQuotes] = useState<Quote[]>(allQuotes);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [likedQuotes, setLikedQuotes] = useState<Set<number>>(new Set());

  const filteredQuotes = quotes.filter(quote => {
    const matchesSearch = quote.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quote.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || quote.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleLike = (quoteId: number) => {
    const newLikedQuotes = new Set(likedQuotes);
    if (newLikedQuotes.has(quoteId)) {
      newLikedQuotes.delete(quoteId);
    } else {
      newLikedQuotes.add(quoteId);
    }
    setLikedQuotes(newLikedQuotes);
  };

  const shareQuote = async (quote: Quote) => {
    const text = `"${quote.text}" - ${quote.author}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Quote of the Day',
          text: text,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(text);
      alert('Quote copied to clipboard!');
    }
  };

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
            Explore our complete collection of inspiring quotes from great minds throughout history.
          </p>
        </div>

        {/* Search and Filter Section */}
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

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-slate-600">
            Showing {filteredQuotes.length} of {allQuotes.length} quotes
          </p>
        </div>

        {/* Quotes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuotes.map((quote) => (
            <Card 
              key={quote.id} 
              className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] p-6"
            >
              <div className="h-full flex flex-col">
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
                  <div className="text-slate-600 font-medium">
                    — {quote.author}
                  </div>
                  
                  <div className="text-sm text-slate-500">
                    {new Date(quote.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                  
                  <div className="flex justify-between items-center pt-4 border-t border-slate-200">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleLike(quote.id)}
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
                      {likedQuotes.has(quote.id) ? 'Liked' : 'Like'}
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
            </Card>
          ))}
        </div>

        {filteredQuotes.length === 0 && (
          <div className="text-center py-12">
            <div className="text-slate-500 text-xl mb-4">No quotes found</div>
            <p className="text-slate-400">
              Try adjusting your search terms or category filter.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
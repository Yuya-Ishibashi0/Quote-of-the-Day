'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RefreshCw, Share2, Heart, Sparkles } from 'lucide-react';

interface Quote {
  id?: number;
  text: string;
  author: string;
  category: string;
}

const defaultQuotes: Quote[] = [
  {
    id: 1,
    text: "The only way to do great work is to love what you do.",
    author: "Steve Jobs",
    category: "Motivation"
  },
  {
    id: 2,
    text: "Life is what happens to you while you're busy making other plans.",
    author: "John Lennon",
    category: "Life"
  },
  {
    id: 3,
    text: "The future belongs to those who believe in the beauty of their dreams.",
    author: "Eleanor Roosevelt",
    category: "Dreams"
  },
  {
    id: 4,
    text: "It is during our darkest moments that we must focus to see the light.",
    author: "Aristotle",
    category: "Hope"
  },
  {
    id: 5,
    text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    author: "Winston Churchill",
    category: "Success"
  },
  {
    id: 6,
    text: "The only impossible journey is the one you never begin.",
    author: "Tony Robbins",
    category: "Journey"
  }
];

export default function Home() {
  const [currentQuote, setCurrentQuote] = useState<Quote>(defaultQuotes[0]);
  const [userInput, setUserInput] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAIGenerated, setIsAIGenerated] = useState(false);

  useEffect(() => {
    // Set a random quote as the quote of the day
    const randomQuote = defaultQuotes[Math.floor(Math.random() * defaultQuotes.length)];
    setCurrentQuote(randomQuote);
  }, []);

  const generateAIQuote = async () => {
    if (!userInput.trim()) {
      alert('Please share your thoughts first!');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: userInput }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate quote');
      }

      const data = await response.json();
      
      if (data.quotes && data.quotes.length > 0) {
        setCurrentQuote(data.quotes[0]);
        setIsAIGenerated(true);
        setIsLiked(false);
      } else {
        throw new Error('No quotes received');
      }
    } catch (error) {
      console.error('Error generating quote:', error);
      alert('Sorry, there was an error generating your personalized quote. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getRandomQuote = () => {
    setIsLoading(true);
    setTimeout(() => {
      const randomQuote = defaultQuotes[Math.floor(Math.random() * defaultQuotes.length)];
      setCurrentQuote(randomQuote);
      setIsLiked(false);
      setIsAIGenerated(false);
      setIsLoading(false);
    }, 500);
  };

  const shareQuote = async () => {
    const text = `"${currentQuote.text}" - ${currentQuote.author}`;
    
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
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(text);
      alert('Quote copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl sm:text-6xl font-bold text-slate-900 mb-4">
            Today's
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              Inspiration
            </span>
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Share your thoughts and get personalized quotes, or discover daily wisdom from our curated collection.
          </p>
        </div>

        {/* User Input Section */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg p-6 mb-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <Sparkles className="h-5 w-5 text-purple-600" />
              <h2 className="text-lg font-semibold text-slate-900">Get Your Personalized Quote</h2>
            </div>
            <Textarea
              placeholder="What's on your mind today? Share your thoughts, feelings, or events..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              className="min-h-[120px] text-lg border-slate-300 focus:border-blue-500 focus:ring-blue-500 resize-none"
            />
          </div>
        </Card>
        
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-2xl shadow-blue-100/50 p-8 sm:p-12 mb-8 transform hover:scale-[1.02] transition-all duration-300">
          <div className="text-center">
            <div className="mb-6 flex items-center justify-center space-x-2">
              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                {currentQuote.category}
              </span>
              {isAIGenerated && (
                <span className="inline-block px-3 py-1 bg-purple-100 text-purple-800 text-sm font-medium rounded-full flex items-center space-x-1">
                  <Sparkles className="h-3 w-3" />
                  <span>AI Generated</span>
                </span>
              )}
            </div>
            
            <blockquote className="text-2xl sm:text-3xl lg:text-4xl font-serif text-slate-800 leading-relaxed mb-8 relative">
              <span className="text-6xl text-blue-200 absolute -top-4 -left-4 font-serif">"</span>
              {currentQuote.text}
              <span className="text-6xl text-blue-200 absolute -bottom-8 -right-4 font-serif">"</span>
            </blockquote>
            
            <div className="text-xl text-slate-600 font-medium">
              — {currentQuote.author}
            </div>
          </div>
        </Card>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            onClick={generateAIQuote}
            disabled={isLoading || !userInput.trim()}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Sparkles className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Generating...' : 'Generate My Quote'}</span>
          </Button>

          <Button
            onClick={getRandomQuote}
            disabled={isLoading}
            variant="outline"
            className="border-slate-300 text-slate-700 hover:bg-slate-50 px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2"
          >
            <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Random Quote</span>
          </Button>
          
          <Button
            onClick={shareQuote}
            variant="outline"
            className="border-slate-300 text-slate-700 hover:bg-slate-50 px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2"
          >
            <Share2 className="h-5 w-5" />
            <span>Share</span>
          </Button>
          
          <Button
            onClick={() => setIsLiked(!isLiked)}
            variant="outline"
            className={`border-slate-300 px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
              isLiked 
                ? 'text-red-600 border-red-300 bg-red-50 hover:bg-red-100' 
                : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
            <span>{isLiked ? 'Liked' : 'Like'}</span>
          </Button>
        </div>
        
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Daily Dose of Wisdom</h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Share your thoughts to get personalized quotes powered by AI, or explore our curated collection of timeless wisdom. 
            Visit our archive to explore our complete collection of inspiring quotes.
          </p>
        </div>
      </div>
    </div>
  );
}
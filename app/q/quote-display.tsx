'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Share2, Heart, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface QuoteDisplayProps {
  searchParams: {
    text?: string;
    author?: string;
    category?: string;
  };
}

export default function QuoteDisplay({ searchParams }: QuoteDisplayProps) {
  const text = searchParams.text || 'No quote provided';
  const author = searchParams.author || 'Unknown';
  const category = searchParams.category || 'Inspiration';

  const shareOnTwitter = () => {
    const currentUrl = window.location.href;
    const tweetText = `I created a new quote from my daily thoughts! Check it out:`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(currentUrl)}`;
    window.open(twitterUrl, '_blank');
  };

  const copyToClipboard = async () => {
    const quoteText = `"${text}" - ${author}`;
    try {
      await navigator.clipboard.writeText(quoteText);
      alert('Quote copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="outline" className="flex items-center space-x-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Home</span>
            </Button>
          </Link>
        </div>

        {/* Quote Display */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-2xl shadow-blue-100/50 p-8 sm:p-12 mb-8">
          <div className="text-center">
            <div className="mb-6">
              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                {category}
              </span>
            </div>
            
            <blockquote className="text-2xl sm:text-3xl lg:text-4xl font-serif text-slate-800 leading-relaxed mb-8 relative">
              <span className="text-6xl text-blue-200 absolute -top-4 -left-4 font-serif">"</span>
              {text}
              <span className="text-6xl text-blue-200 absolute -bottom-8 -right-4 font-serif">"</span>
            </blockquote>
            
            <div className="text-xl text-slate-600 font-medium">
              — {author}
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            onClick={shareOnTwitter}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2"
          >
            <Share2 className="h-5 w-5" />
            <span>Share on X (Twitter)</span>
          </Button>
          
          <Button
            onClick={copyToClipboard}
            variant="outline"
            className="border-slate-300 text-slate-700 hover:bg-slate-50 px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2"
          >
            <Heart className="h-5 w-5" />
            <span>Copy Quote</span>
          </Button>
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Create Your Own Quote</h2>
          <p className="text-slate-600 max-w-2xl mx-auto mb-6">
            Share your thoughts and get personalized quotes with your name. Your wisdom, your words, your inspiration.
          </p>
          <Link href="/">
            <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 rounded-lg font-medium">
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
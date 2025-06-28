'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Share2, Heart, Sparkles, Check, Archive, Calendar, User } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import Image from 'next/image';
import Autoplay from 'embla-carousel-autoplay';

interface Quote {
  id?: number;
  text: string;
  author: string;
  category: string;
  created_at?: string;
  image_url?: string | null;
  like_count?: number;
}

export default function Home() {
  const { toast } = useToast();
  const [currentQuote, setCurrentQuote] = useState<Quote | null>(null);
  const [userInput, setUserInput] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [generatedQuotes, setGeneratedQuotes] = useState<Quote[]>([]);
  const [selectedQuoteIndex, setSelectedQuoteIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isAIGenerated, setIsAIGenerated] = useState(false);
  const [archivedQuotes, setArchivedQuotes] = useState<Quote[]>([]);
  const [likedQuotes, setLikedQuotes] = useState<Set<number>>(new Set());
  const [isLiking, setIsLiking] = useState(false);

  // Fetch archived quotes on component mount
  useEffect(() => {
    const fetchArchivedQuotes = async () => {
      try {
        const { data, error } = await supabase
          .from('quotes')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10);

        if (error) {
          console.error('Error fetching archived quotes:', error);
          return;
        }

        setArchivedQuotes(data || []);
      } catch (error) {
        console.error('Error fetching archived quotes:', error);
      }
    };

    fetchArchivedQuotes();
  }, []);

  const generateAIQuote = async () => {
    if (!userInput.trim() || !authorName.trim()) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please fill out your name and thoughts!',
      });
      return;
    }
    setIsLoading(true);
    setCurrentQuote(null);
    setGeneratedQuotes([]);
    setSelectedQuoteIndex(null);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userInput, authorName: authorName.trim() }),
      });
      if (!response.ok) { throw new Error('Failed to generate quote'); }
      const data = await response.json();
      if (data.quotes && data.quotes.length > 0) {
        setGeneratedQuotes(data.quotes);
        setIsAIGenerated(true);
        toast({
          title: 'Success',
          description: 'Your personalized quotes have been generated!',
        });
      } else {
        throw new Error('No quotes received');
      }
    } catch (error) {
      console.error('Error generating quote:', error);
      toast({
        variant: 'destructive',
        title: 'Generation Error',
        description: 'Sorry, there was an error generating your personalized quote.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const selectQuote = (index: number) => {
    setSelectedQuoteIndex(index);
    setCurrentQuote(generatedQuotes[index]);
  };

  const saveQuoteToArchive = async () => {
    if (!currentQuote) {
      toast({
        variant: 'destructive',
        title: 'No Quote Selected',
        description: 'Please select a quote to save.',
      });
      return;
    }

    setIsSaving(true);
    try {
      // Construct the absolute URL for the OG image
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
      const imageUrl = new URL('/api/og', baseUrl);
      imageUrl.searchParams.set('text', currentQuote.text);
      imageUrl.searchParams.set('author', currentQuote.author);
      imageUrl.searchParams.set('category', currentQuote.category);

      // Save to Supabase via API
      const response = await fetch('/api/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: currentQuote.text,
          author: currentQuote.author,
          category: currentQuote.category,
          imageUrl: imageUrl.toString()
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save quote');
      }

      const data = await response.json();
      toast({
        title: 'Success',
        description: 'Your quote has been saved to the archive.',
      });

      // Update the current quote with the saved quote data (including ID)
      if (data.quote) {
        setCurrentQuote(data.quote);
        const updatedGeneratedQuotes = [...generatedQuotes];
        if (selectedQuoteIndex !== null) {
          updatedGeneratedQuotes[selectedQuoteIndex] = data.quote;
          setGeneratedQuotes(updatedGeneratedQuotes);
        }
      }

      // Refresh archived quotes to include the newly saved quote
      const { data: updatedQuotes, error } = await supabase
        .from('quotes')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (!error && updatedQuotes) {
        setArchivedQuotes(updatedQuotes);
      }
    } catch (error) {
      console.error('Failed to save quote:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Sorry, there was an error saving your quote. Please try again.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const likeQuote = async (quote: Quote) => {
    if (!quote.id || likedQuotes.has(quote.id) || isLiking) {
      return;
    }

    setIsLiking(true);

    // Optimistically update the UI
    const newLikeCount = (quote.like_count || 0) + 1;
    if (currentQuote && currentQuote.id === quote.id) {
      setCurrentQuote({ ...currentQuote, like_count: newLikeCount });
    }
    setArchivedQuotes(prev =>
      prev.map(q =>
        q.id === quote.id ? { ...q, like_count: newLikeCount } : q
      )
    );
    setLikedQuotes(prev => new Set([...prev, quote.id!]));

    try {
      const response = await fetch('/api/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: quote.id }),
      });
      if (!response.ok) throw new Error('Failed to like quote');
      const data = await response.json();
      if (currentQuote && currentQuote.id === quote.id) {
        setCurrentQuote({ ...currentQuote, like_count: data.likeCount });
      }
      setArchivedQuotes(prev =>
        prev.map(q =>
          q.id === quote.id ? { ...q, like_count: data.likeCount } : q
        )
      );
    } catch (error) {
      console.error('Failed to like quote:', error);
      // Revert optimistic update
      const originalLikeCount = quote.like_count || 0;
      if (currentQuote && currentQuote.id === quote.id) {
        setCurrentQuote({ ...currentQuote, like_count: originalLikeCount });
      }
      setArchivedQuotes(prev =>
        prev.map(q =>
          q.id === quote.id ? { ...q, like_count: originalLikeCount } : q
        )
      );
      setLikedQuotes(prev => {
        const newSet = new Set(prev);
        newSet.delete(quote.id!);
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

  const shareQuote = () => {
    if (!currentQuote) return;
    const baseUrl = window.location.origin;
    const quoteUrl = new URL('/q', baseUrl);
    quoteUrl.searchParams.set('text', currentQuote.text);
    quoteUrl.searchParams.set('author', currentQuote.author);
    quoteUrl.searchParams.set('category', currentQuote.category);
    const tweetText = 'I created a new quote from my daily thoughts! Check it out:';
    const twitterUrl = new URL('https://twitter.com/intent/tweet');
    twitterUrl.searchParams.set('text', tweetText);
    twitterUrl.searchParams.set('url', quoteUrl.toString());
    window.open(twitterUrl.toString(), '_blank');
  };

  const shareArchivedQuote = (quote: Quote) => {
    const baseUrl = window.location.origin;
    const quoteUrl = new URL('/q', baseUrl);
    quoteUrl.searchParams.set('text', quote.text);
    quoteUrl.searchParams.set('author', quote.author);
    quoteUrl.searchParams.set('category', quote.category);
    const tweetText = 'Check out this inspiring quote from my archive:';
    const twitterUrl = new URL('https://twitter.com/intent/tweet');
    twitterUrl.searchParams.set('text', tweetText);
    twitterUrl.searchParams.set('url', quoteUrl.toString());
    window.open(twitterUrl.toString(), '_blank');
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

  const hasSelectedQuote = selectedQuoteIndex !== null;
  const showGeneratedQuotes = generatedQuotes.length > 0;

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl sm:text-6xl font-bold text-slate-900 mb-4">
            Quote of the Day
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Share your thoughts and get personalized quotes with your name. Your wisdom, your words, your inspiration.
          </p>
        </div>

        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg p-6 mb-8">
          <div className="space-y-6">
            <div className="flex items-center space-x-2 mb-4">
              <Sparkles className="h-5 w-5 text-purple-600" />
              <h2 className="text-lg font-semibold text-slate-900">Create Your Personal Quote</h2>
            </div>
            <div className="space-y-2">
              <Label htmlFor="authorName" className="text-sm font-medium text-slate-700">Your Name / Handle</Label>
              <Input
                id="authorName"
                placeholder="e.g., The Wanderer"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="text-lg border-slate-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="userThoughts" className="text-sm font-medium text-slate-700">What's on your mind?</Label>
              <Textarea
                id="userThoughts"
                placeholder="Share your thoughts, feelings, or events from today..."
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                className="min-h-[120px] text-lg border-slate-300 focus:border-blue-500 focus:ring-blue-500 resize-none"
              />
            </div>
          </div>
        </Card>

        {/* Action Buttons - Moved here immediately after the input card */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
          <Button
            onClick={generateAIQuote}
            disabled={isLoading || !userInput.trim() || !authorName.trim()}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Sparkles className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Generating...' : 'Generate My Quote'}</span>
          </Button>
          <Button
            onClick={saveQuoteToArchive}
            disabled={!hasSelectedQuote || isSaving}
            variant="outline"
            className="border-slate-300 px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 hover:bg-slate-50"
          >
            <Archive className={`h-5 w-5 ${isSaving ? 'animate-spin' : ''}`} />
            <span>{isSaving ? 'Saving...' : 'Save to Archive'}</span>
          </Button>
          <Button
            onClick={shareQuote}
            disabled={!hasSelectedQuote}
            variant="outline"
            className="border-slate-300 px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 hover:bg-slate-50"
          >
            <Share2 className="h-5 w-5" />
            <span>Share on X</span>
          </Button>
          <Button
            onClick={() => currentQuote && likeQuote(currentQuote)}
            disabled={
              !hasSelectedQuote ||
              !currentQuote?.id ||
              (currentQuote?.id && likedQuotes.has(currentQuote.id)) ||
              isLiking
            }
            variant="outline"
            className={`border-slate-300 px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
              !hasSelectedQuote || !currentQuote?.id || (currentQuote?.id && likedQuotes.has(currentQuote.id))
                ? 'opacity-50 cursor-not-allowed'
                : currentQuote?.id && likedQuotes.has(currentQuote.id)
                ? 'text-red-600 border-red-300 bg-red-50 hover:bg-red-100'
                : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Heart className={`h-5 w-5 ${currentQuote?.id && likedQuotes.has(currentQuote.id) ? 'fill-current' : ''}`} />
            <span>
              {currentQuote?.id && likedQuotes.has(currentQuote.id)
                ? `Liked (${currentQuote.like_count || 0})`
                : `Like${currentQuote?.like_count ? ` (${currentQuote.like_count})` : ''}`}
            </span>
          </Button>
        </div>

        {showGeneratedQuotes && (
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-slate-900 mb-4 text-center">Choose your favorite quote:</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {generatedQuotes.map((quote, index) => (
                <Card
                  key={index}
                  onClick={() => selectQuote(index)}
                  className={`cursor-pointer transition-all duration-300 p-4 hover:shadow-lg ${
                    selectedQuoteIndex === index
                      ? 'ring-2 ring-blue-500 bg-blue-50/50 shadow-lg'
                      : 'bg-white/80 backdrop-blur-sm hover:bg-blue-50/30'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="inline-block px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                        {quote.category}
                      </span>
                      {selectedQuoteIndex === index && <Check className="h-5 w-5 text-blue-600" />}
                    </div>
                    <blockquote className="text-sm text-slate-800 leading-relaxed font-serif">
                      "{quote.text}"
                    </blockquote>
                    <div className="text-xs text-slate-600 font-medium"> — {quote.author} </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {currentQuote && (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-2xl shadow-blue-100/50 p-8 sm:p-12 mb-8 transform hover:scale-[1.02] transition-all duration-300">
            <div className="text-center">
              <div className="mb-6 flex items-center justify-center space-x-2">
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                  {currentQuote.category}
                </span>
                {isAIGenerated && (
                  <span className="inline-block px-3 py-1 bg-purple-100 text-purple-800 text-sm font-medium rounded-full flex items-center space-x-1">
                    <Sparkles className="h-3 w-3" />
                    <span>Personal Quote</span>
                  </span>
                )}
              </div>
              <blockquote className="text-2xl sm:text-3xl lg:text-4xl font-serif text-slate-800 leading-relaxed mb-8 relative">
                <span className="text-6xl text-blue-200 absolute -top-4 -left-4 font-serif">"</span>
                {currentQuote.text}
                <span className="text-6xl text-blue-200 absolute -bottom-8 -right-4 font-serif">"</span>
              </blockquote>
              <div className="text-xl text-slate-600 font-medium"> — {currentQuote.author}</div>
            </div>
          </Card>
        )}

        {/* Quote Slideshow Section */}
        {archivedQuotes.length > 0 && (
          <div className="mb-8">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-slate-900 mb-2">From Your Archive</h2>
              <p className="text-slate-600">Your recently saved quotes</p>
            </div>

            <Carousel
              className="w-full max-w-5xl mx-auto"
              plugins={[
                Autoplay({
                  delay: 5000,
                }),
              ]}
            >
              <CarouselContent className="-ml-2 md:-ml-4">
                {archivedQuotes.map((quote) => {
                  const ts = Date.now();
                  const params = new URLSearchParams({
                    text:     quote.text,
                    author:   quote.author,
                    category: quote.category,
                    v:        ts.toString(),
                  });
                  const ogUrl = `/api/og?${params.toString()}`;

                  return (
                    <CarouselItem key={quote.id} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] overflow-hidden h-full">
                        <div className="flex flex-col h-full">
                          {/* Dynamic OG Image */}
                          <div className="relative h-32 w-full">
                            <Image
                              src={ogUrl}
                              alt={`Quote by ${quote.author}`}
                              fill
                              unoptimized
                              className="object-cover"
                            />
                          </div>
                          <div className="p-4 flex-1 flex flex-col">
                            <div className="mb-3">
                              <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                                {quote.category}
                              </span>
                            </div>
                            <blockquote className="flex-1 text-slate-800 text-sm leading-relaxed mb-3 font-serif line-clamp-3">
                              "{quote.text.length > 100 ? quote.text.substring(0, 100) + '...' : quote.text}"
                            </blockquote>
                            <div className="space-y-2">
                              <div className="flex items-center text-slate-600 text-xs">
                                <User className="h-3 w-3 mr-1" />
                                {quote.author}
                              </div>
                              {quote.created_at && (
                                <div className="flex items-center text-xs text-slate-500">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  {formatDate(quote.created_at)}
                                </div>
                              )}
                              <div className="flex justify-between items-center pt-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => likeQuote(quote)}
                                  disabled={!quote.id || likedQuotes.has(quote.id) || isLiking}
                                  className={`transition-colors duration-200 h-8 px-2 ${
                                    quote.id && likedQuotes.has(quote.id)
                                      ? 'text-red-600 hover:text-red-700'
                                      : 'text-slate-500 hover:text-slate-700'
                                  }`}
                                >
                                  <Heart
                                    className={`h-3 w-3 mr-1 ${
                                      quote.id && likedQuotes.has(quote.id) ? 'fill-current' : ''
                                    }`}
                                  />
                                  <span className="text-xs">{quote.like_count || 0}</span>
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => shareArchivedQuote(quote)}
                                  className="text-slate-500 hover:text-slate-700 transition-colors duration-200 h-8 px-2"
                                >
                                  <Share2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </CarouselItem>
                  );
                })}
              </CarouselContent>
              <CarouselPrevious className="hidden md:flex" />
              <CarouselNext className="hidden md:flex" />
            </Carousel>
          </div>
        )}

        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Personal Wisdom</h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Enter your name and share your thoughts to create personalized quotes that reflect your unique perspective. Your wisdom, your words, your inspiration.
          </p>
        </div>
      </div>

      {/* Bolt.new Sponsorship Badge */}
      <a
        href="https://bolt.new/"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 transition-all duration-300 hover:scale-110 hover:shadow-lg"
      >
        <Image
          src="/white_circle_360x360.png"
          alt="Built with Bolt.new"
          width={80}
          height={80}
          className="rounded-full shadow-md hover:shadow-xl transition-shadow duration-300"
        />
      </a>
    </div>
  );
}
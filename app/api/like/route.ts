import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    const { id } = await request.json();

    if (!id || typeof id !== 'number') {
      return NextResponse.json(
        { error: 'Quote ID is required and must be a number' },
        { status: 400 }
      );
    }

    // Call the PostgreSQL function to atomically increment the like count
    const { data, error } = await supabase
      .rpc('increment_like', { quote_id: id });

    if (error) {
      console.error('Supabase RPC error:', error);
      return NextResponse.json(
        { error: 'Failed to increment like count' },
        { status: 500 }
      );
    }

    // Get the updated quote with the new like count
    const { data: updatedQuote, error: fetchError } = await supabase
      .from('quotes')
      .select('like_count')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('Error fetching updated quote:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch updated like count' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      likeCount: updatedQuote.like_count 
    });

  } catch (error) {
    console.error('Like API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
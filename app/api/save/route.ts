import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    const { text, author, category, imageUrl } = await request.json();

    if (!text || !author || !category) {
      return NextResponse.json(
        { error: 'Text, author, and category are required' },
        { status: 400 }
      );
    }

    // Insert the quote into Supabase
    const { data, error } = await supabase
      .from('quotes')
      .insert([
        {
          text,
          author,
          category,
          image_url: imageUrl || null
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to save quote to database' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      quote: data,
      message: 'Quote saved successfully!' 
    });

  } catch (error) {
    console.error('Save quote error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
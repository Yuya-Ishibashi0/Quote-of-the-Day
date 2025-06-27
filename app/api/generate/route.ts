import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt is required and must be a string' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite-preview-06-17' });

    const aiPrompt = `Based on the following user input, generate 3 unique, insightful, and short quotes that relate to their thoughts, feelings, or situation. Each quote should be inspirational, meaningful, and relevant to what they've shared. The quotes should be original and thoughtful, not generic platitudes.

User input: "${prompt}"

Please respond with a JSON array containing exactly 3 objects, each with the following structure:
{
  "text": "The quote text",
  "author": "A fitting author name (can be real or inspirational pseudonym)",
  "category": "A relevant category for the quote"
}

Make sure the response is valid JSON and nothing else.`;

    const result = await model.generateContent(aiPrompt);
    const response = await result.response;
    let text = response.text();

    if (text.startsWith('```json')) {
    text = text.slice(7, -3);
    }

    try {
    // Parse the JSON response from the AI
    const quotes = JSON.parse(text);
      
      // Validate the response structure
      if (!Array.isArray(quotes) || quotes.length !== 3) {
        throw new Error('Invalid response format');
      }

      // Validate each quote object
      for (const quote of quotes) {
        if (!quote.text || !quote.author || !quote.category) {
          throw new Error('Invalid quote structure');
        }
      }

      return NextResponse.json({ quotes });
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      return NextResponse.json(
        { error: 'Failed to generate valid quotes' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('--- DETAILED API ERROR ---');
    console.error(error);
    console.error('--- END OF ERROR ---');
    return NextResponse.json(
      { error: 'Failed to generate quotes' },
      { status: 500 }
    );
  }
}
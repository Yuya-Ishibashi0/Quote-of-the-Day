import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const text = searchParams.get('text') || 'No quote provided';
    const author = searchParams.get('author') || 'Unknown';
    const category = searchParams.get('category') || 'Inspiration';

    // More aggressive text truncation - reduced from 120 to 100 characters
    const truncatedText = text.length > 100 ? text.substring(0, 97) + '...' : text;

    // More conservative font sizing to prevent overlap
    const getFontSize = (textLength: number) => {
      if (textLength > 80) return '20px';       // Very long text - much smaller
      if (textLength > 50) return '26px';       // Long text - smaller
      return '32px';                            // Short to medium text
    };

    // Adjusted line height for better text spacing
    const getLineHeight = (textLength: number) => {
      if (textLength > 50) return '1.2';        // Tighter for longer text
      return '1.3';                             // Normal for shorter text
    };

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            fontFamily: 'sans-serif',
            padding: '40px',
          }}
        >
          {/* Main Content Container */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              maxWidth: '1000px',
              height: '100%',
              textAlign: 'center',
              padding: '60px 40px', // Increased horizontal padding from 20px to 40px
            }}
          >
            {/* Category Badge */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(255, 255, 255, 0.25)',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '25px',
                fontSize: '18px',
                fontWeight: '600',
                marginBottom: '50px', // Increased from 40px to 50px
                border: '1px solid rgba(255, 255, 255, 0.3)',
              }}
            >
              {category}
            </div>

            {/* Quote Text with improved spacing and conservative sizing */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: getFontSize(truncatedText.length),
                fontWeight: '700',
                color: 'white',
                lineHeight: getLineHeight(truncatedText.length),
                marginBottom: '50px', // Increased from 40px to 50px
                textShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
                textAlign: 'center',
                width: '100%',
                padding: '0 80px', // Increased padding from 60px to 80px
                maxWidth: '900px',
              }}
            >
              "{truncatedText}"
            </div>

            {/* Author */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px',
                fontWeight: '500',
                color: 'rgba(255, 255, 255, 0.9)',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                marginTop: '30px', // Increased from 20px to 30px
              }}
            >
              — {author}
            </div>
          </div>

          {/* Bottom Branding - keeping absolute positioning for corner placement */}
          <div
            style={{
              position: 'absolute',
              bottom: '30px',
              right: '40px',
              display: 'flex',
              alignItems: 'center',
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: '16px',
              fontWeight: '500',
            }}
          >
            Quote of the Day
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error('Error generating OG image:', error);
    return new Response('Failed to generate image', { status: 500 });
  }
}
import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const text = searchParams.get('text') || 'No quote provided';
    const author = searchParams.get('author') || 'Unknown';
    const category = searchParams.get('category') || 'Inspiration';

    // Improved text truncation - reduced from 150 to 120 characters
    const truncatedText = text.length > 120 ? text.substring(0, 117) + '...' : text;

    // Enhanced font size logic with more granular control
    const getFontSize = (textLength: number) => {
      if (textLength > 120) return '24px';      // Very long text
      if (textLength > 100) return '28px';      // Long text
      if (textLength > 80) return '32px';       // Medium-long text
      if (textLength > 60) return '36px';       // Medium text
      if (textLength > 40) return '40px';       // Short-medium text
      return '44px';                            // Short text
    };

    // Enhanced line height for better text spacing
    const getLineHeight = (textLength: number) => {
      if (textLength > 100) return '1.2';
      if (textLength > 60) return '1.3';
      return '1.4';
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
              padding: '60px 20px',
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
                marginBottom: '40px',
                border: '1px solid rgba(255, 255, 255, 0.3)',
              }}
            >
              {category}
            </div>

            {/* Quote Text with improved spacing and sizing */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: getFontSize(truncatedText.length),
                fontWeight: '700',
                color: 'white',
                lineHeight: getLineHeight(truncatedText.length),
                marginBottom: '40px',
                textShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
                textAlign: 'center',
                width: '100%',
                padding: '0 60px', // Increased padding from 20px to 60px
                maxWidth: '900px',  // Added max width constraint
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
                marginTop: '20px', // Added margin for better spacing
              }}
            >
              — {author}
            </div>
          </div>

          {/* Bottom Branding */}
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
import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const text = searchParams.get('text') || 'No quote provided';
    const author = searchParams.get('author') || 'Unknown';
    const category = searchParams.get('category') || 'Inspiration';

    // Moderate text truncation - allowing more text to display
    const truncatedText = text.length > 150 ? text.substring(0, 147) + '...' : text;

    // More generous font sizing for readability
    const getFontSize = (textLength: number) => {
      if (textLength > 100) return 42;       // Long text - still readable
      if (textLength > 60) return 48;        // Medium text - good size
      return 54;                             // Short text - large and impactful
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
          {/* Main Content Container with clear width boundaries */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              width: '90%',
              maxWidth: '1000px',
              height: '100%',
              textAlign: 'center',
              padding: '50px 80px',
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
                marginBottom: '50px',
                border: '1px solid rgba(255, 255, 255, 0.3)',
              }}
            >
              {category}
            </div>

            {/* Quote Text with proper wrapping constraints */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: getFontSize(truncatedText.length),
                fontWeight: '700',
                color: 'white',
                lineHeight: '1.4',
                marginBottom: '50px',
                textShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
                textAlign: 'center',
                width: '100%',
                maxWidth: '800px',
                padding: '0 40px',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
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
                marginTop: '30px',
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
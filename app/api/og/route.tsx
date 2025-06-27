import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const text = searchParams.get('text') || 'No quote provided';
    const author = searchParams.get('author') || 'Unknown';
    const category = searchParams.get('category') || 'Inspiration';

    // Truncate text for better display
    const truncatedText = text.length > 120 ? text.substring(0, 117) + '...' : text;

    // Dynamic font sizing based on text length
    const getFontSize = (textLength: number) => {
      if (textLength > 80) return 48;
      if (textLength > 50) return 56;
      return 64;
    };

    const imageResponseOptions: any = {
      width: 1200,
      height: 630,
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
            fontFamily: 'system-ui, sans-serif',
            padding: '50px 200px',
            position: 'relative',
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
              height: '100%',
              textAlign: 'center',
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
                padding: '16px 32px',
                borderRadius: '30px',
                fontSize: '24px',
                fontWeight: '600',
                marginBottom: '60px',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                backdropFilter: 'blur(10px)',
              }}
            >
              {category}
            </div>

            {/* Main Quote Text */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: getFontSize(truncatedText.length),
                fontWeight: '700',
                color: 'white',
                lineHeight: '1.3',
                textAlign: 'center',
                width: '100%',
                maxWidth: '800px',
                padding: '0 120px',
                marginBottom: '80px',
                textShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              "{truncatedText}"
            </div>
          </div>

          {/* Author - Bottom Right */}
          <div
            style={{
              position: 'absolute',
              bottom: '60px',
              right: '80px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              color: 'rgba(255, 255, 255, 0.95)',
              textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
            }}
          >
            <div
              style={{
                fontSize: '32px',
                fontWeight: '600',
                marginBottom: '8px',
              }}
            >
              — {author}
            </div>
            <div
              style={{
                fontSize: '18px',
                fontWeight: '400',
                opacity: 0.8,
              }}
            >
              Quote of the Day
            </div>
          </div>
        </div>
      ),
      imageResponseOptions
    );
  } catch (error) {
    console.error('Error generating OG image:', error);
    return new Response('Failed to generate image', { status: 500 });
  }
}
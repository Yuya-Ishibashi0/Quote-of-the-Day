import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const text = searchParams.get('text') || 'No quote provided';
    const author = searchParams.get('author') || 'Unknown';
    const category = searchParams.get('category') || 'Inspiration';

    // Truncate text if too long for the image
    const truncatedText = text.length > 180 ? text.substring(0, 177) + '...' : text;

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
            fontFamily: 'system-ui, -apple-system, sans-serif',
            position: 'relative',
          }}
        >
          {/* Background Pattern */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              background: 'radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)',
            }}
          />
          
          {/* Content Container */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '60px',
              maxWidth: '1000px',
              textAlign: 'center',
              position: 'relative',
              zIndex: 1,
              height: '100%',
            }}
          >
            {/* Category Badge */}
            <div
              style={{
                display: 'flex',
                background: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                padding: '8px 20px',
                borderRadius: '20px',
                fontSize: '16px',
                fontWeight: '600',
                marginBottom: '30px',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
              }}
            >
              {category}
            </div>

            {/* Quote Text */}
            <div
              style={{
                display: 'flex',
                fontSize: truncatedText.length > 120 ? '36px' : truncatedText.length > 80 ? '42px' : '48px',
                fontWeight: '700',
                color: 'white',
                lineHeight: '1.3',
                marginBottom: '30px',
                textShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
                fontFamily: 'Georgia, serif',
                textAlign: 'center',
                maxWidth: '900px',
                wordWrap: 'break-word',
                hyphens: 'auto',
              }}
            >
              "{truncatedText}"
            </div>

            {/* Author */}
            <div
              style={{
                display: 'flex',
                fontSize: '24px',
                fontWeight: '500',
                color: 'rgba(255, 255, 255, 0.9)',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                marginTop: '10px',
              }}
            >
              — {author}
            </div>
          </div>

          {/* Bottom Branding */}
          <div
            style={{
              position: 'absolute',
              bottom: '25px',
              right: '35px',
              display: 'flex',
              alignItems: 'center',
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: '14px',
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
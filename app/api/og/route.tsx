import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const text     = searchParams.get('text')     ?? 'No quote provided';
  const author   = searchParams.get('author')   ?? 'Unknown';
  const category = searchParams.get('category') ?? 'Inspiration';

  // --- 1) テキストを安全にトリム -------------------------------
  const truncated = text.length > 150 ? text.slice(0, 147) + '…' : text;

  // --- 2) 文字数で段階的にフォントを縮小 -------------------------
  const fontSize = truncated.length > 100 ? 48 : truncated.length > 60 ? 54 : 60;

  // --- 3) ImageResponse -----------------------------------------
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',
        fontFamily: 'Noto Sans,system-ui,sans-serif',
        padding: '48px 160px',            // 横側に余白を確保
      }}
    >
      {/* Category Badge */}
      <div
        style={{
          display: 'flex',
          padding: '12px 28px',
          borderRadius: 30,
          background: 'rgba(255,255,255,.25)',
          border: '2px solid rgba(255,255,255,.3)',
          color: '#fff',
          fontSize: 24,
          marginBottom: 48,
        }}
      >
        {category}
      </div>

      {/* Quote */}
      <div
        style={{
          display: 'flex',                // ← 必須
          fontSize,          
          fontWeight: 700,
          color: '#fff',
          lineHeight: 1.35,
          textAlign: 'center',
          maxWidth: 800,                  // ← 幅を制限
          padding: '0 120px',
          whiteSpace: 'pre-wrap',
          overflowWrap: 'break-word',
          wordBreak: 'break-word',
          textShadow: '0 4px 12px rgba(0,0,0,.4)',
          marginBottom: 0,//marginBottom: 72,
        }}
      >
        “{truncated}”
      </div>

      {/* Author */}
      <div
        style={{
          display: 'flex',
          fontSize: 32,
          fontWeight: 600,
          color: '#ffffffe6',
        }}
      >
        — {author}
      </div>
    </div>,
    { width: 1200, height: 630 }
  );
}

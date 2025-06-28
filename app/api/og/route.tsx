// app/api/og/route.tsx

import { ImageResponse } from '@vercel/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const text     = searchParams.get('text')     ?? 'No quote provided'
  const author   = searchParams.get('author')   ?? 'Unknown'
  const category = searchParams.get('category') ?? 'Inspiration'

  // 1) テキストを安全にトリム
  const truncated = text.length > 150
    ? text.slice(0, 147) + '…'
    : text

  // 2) 文字数で段階的にフォント＆余白を調整
  let fontSize: number
  let quoteMargin: number
  const len = truncated.length

  if (len > 120) {
    fontSize    = 36
    quoteMargin = 48
  } else if (len > 90) {
    fontSize    = 44
    quoteMargin = 64
  } else if (len > 60) {
    fontSize    = 52
    quoteMargin = 80
  } else {
    fontSize    = 64
    quoteMargin = 100
  }

  // 3) ImageResponse で OG 画像を返す
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          fontFamily: 'Noto Sans, system-ui, sans-serif',
          padding: '48px 160px',
        }}
      >
        {/* Category Badge */}
        <div
          style={{
            display: 'flex',
            padding: '12px 28px',
            borderRadius: 30,
            background: 'rgba(255,255,255,0.25)',
            border: '2px solid rgba(255,255,255,0.3)',
            color: '#fff',
            fontSize: 24,
            marginBottom: 48,
          }}
        >
          {category}
        </div>

        {/* Quote Text */}
        <div
          style={{
            display: 'flex',
            fontSize,
            fontWeight: 700,
            color: '#fff',
            lineHeight: 1.4,
            textAlign: 'center',
            maxWidth: 800,
            padding: '0 120px',
            whiteSpace: 'pre-wrap',
            overflowWrap: 'break-word',
            wordBreak: 'break-word',
            textShadow: '0 4px 12px rgba(0,0,0,0.4)',
            marginBottom: quoteMargin,
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
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}

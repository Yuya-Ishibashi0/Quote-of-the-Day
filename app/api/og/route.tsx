// app/api/og/route.ts

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const runtime = 'edge'

import { ImageResponse } from '@vercel/og'
import { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const text     = searchParams.get('text')     ?? 'No quote provided'
  const category = searchParams.get('category') ?? 'Inspiration'

  // 1) テキストを安全にトリム
  const truncated = text.length > 150
    ? text.slice(0, 147) + '…'
    : text

  // 2) 文字数で段階的にフォントサイズを調整
  let fontSize: number
  const len = truncated.length
  if (len > 120) {
    fontSize = 36
  } else if (len > 90) {
    fontSize = 44
  } else if (len > 60) {
    fontSize = 52
  } else {
    fontSize = 64
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
          justifyContent: 'flex-start',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          fontFamily: 'Noto Sans, system-ui, sans-serif',
          padding: '48px 160px 120px',
          position: 'relative',
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
          }}
        >
          "{truncated}"
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
        // その Response のヘッダーにキャッシュ制御を設定
  imageRes.headers.set(
    'Cache-Control',
    'no-store, no-cache, max-age=0, must-revalidate'
  )
  return imageRes
}
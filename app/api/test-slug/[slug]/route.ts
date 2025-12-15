import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const originalSlug = params.slug
  let decodedSlug = params.slug

  try {
    decodedSlug = decodeURIComponent(params.slug)
    if (decodedSlug.includes('%')) {
      decodedSlug = decodeURIComponent(decodedSlug)
    }
  } catch (e) {
    // ignore
  }

  return NextResponse.json({
    originalSlug,
    decodedSlug,
    includesPercent: decodedSlug.includes('%'),
    length: decodedSlug.length,
    chars: decodedSlug.split('').map((c: string) => `${c} (${c.charCodeAt(0)})`),
  })
}

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const authors = await prisma.author.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    })

    return NextResponse.json({ authors })
  } catch (error) {
    console.error('Error fetching authors:', error)
    return NextResponse.json(
      { message: 'Error fetching authors', authors: [] },
      { status: 500 }
    )
  }
}

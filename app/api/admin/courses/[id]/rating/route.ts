import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { rating } = await request.json()

    if (typeof rating !== 'number' || rating < 0 || rating > 5) {
      return NextResponse.json(
        { message: 'Rating must be between 0 and 5' },
        { status: 400 }
      )
    }

    const course = await prisma.course.update({
      where: { id: params.id },
      data: {
        averageRating: rating,
      },
    })

    return NextResponse.json({ course })
  } catch (error) {
    console.error('Error updating rating:', error)
    return NextResponse.json(
      { message: 'Error updating rating' },
      { status: 500 }
    )
  }
}






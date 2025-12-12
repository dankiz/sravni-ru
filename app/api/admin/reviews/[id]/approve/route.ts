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
    // Update review status
    const review = await prisma.review.update({
      where: { id: params.id },
      data: {
        status: 'APPROVED',
        publishedAt: new Date(),
      },
      include: {
        course: true,
      },
    })

    // Recalculate course rating
    const allReviews = await prisma.review.findMany({
      where: {
        courseId: review.courseId,
        status: 'APPROVED',
      },
    })

    const averageRating = allReviews.length > 0
      ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
      : 0

    await prisma.course.update({
      where: { id: review.courseId },
      data: {
        averageRating,
        reviewCount: allReviews.length,
      },
    })

    return NextResponse.json({ review })
  } catch (error) {
    console.error('Error approving review:', error)
    return NextResponse.json(
      { message: 'Error approving review' },
      { status: 500 }
    )
  }
}






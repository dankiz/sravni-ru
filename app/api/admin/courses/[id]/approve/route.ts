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
    const course = await prisma.course.findUnique({
      where: { id: params.id },
      include: { reviews: true },
    })

    if (!course) {
      return NextResponse.json({ message: 'Course not found' }, { status: 404 })
    }

    // Calculate average rating from approved reviews
    const approvedReviews = course.reviews.filter(r => r.status === 'APPROVED')
    const averageRating = approvedReviews.length > 0
      ? approvedReviews.reduce((sum, r) => sum + r.rating, 0) / approvedReviews.length
      : 0

    // Update course status and rating
    const updatedCourse = await prisma.course.update({
      where: { id: params.id },
      data: {
        status: 'APPROVED',
        publishedAt: new Date(),
        averageRating,
        reviewCount: approvedReviews.length,
      },
    })

    return NextResponse.json({ course: updatedCourse })
  } catch (error) {
    console.error('Error approving course:', error)
    return NextResponse.json(
      { message: 'Error approving course' },
      { status: 500 }
    )
  }
}






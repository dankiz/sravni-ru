import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const { courseId, authorName, authorEmail, rating, text } = body

    // Validate required fields
    if (!courseId || !authorName || !rating || !text) {
      return NextResponse.json(
        { message: 'Заполните все обязательные поля' },
        { status: 400 }
      )
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { message: 'Оценка должна быть от 1 до 5' },
        { status: 400 }
      )
    }

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    })

    if (!course) {
      return NextResponse.json(
        { message: 'Курс не найден' },
        { status: 404 }
      )
    }

    // Create review with PENDING status
    const review = await prisma.review.create({
      data: {
        courseId,
        authorName,
        authorEmail: authorEmail || null,
        rating,
        text,
        status: 'PENDING',
      },
    })

    return NextResponse.json({ 
      message: 'Отзыв успешно отправлен на модерацию',
      reviewId: review.id 
    })
  } catch (error) {
    console.error('Error submitting review:', error)
    return NextResponse.json(
      { message: 'Ошибка при отправке отзыва' },
      { status: 500 }
    )
  }
}






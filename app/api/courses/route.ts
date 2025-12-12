import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '30')
    const skip = (page - 1) * limit

    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''
    const minPrice = searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined
    const maxPrice = searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined
    const minRating = searchParams.get('minRating') ? parseFloat(searchParams.get('minRating')!) : undefined
    const sort = searchParams.get('sort') || 'random'

    const where: any = {
      status: 'APPROVED',
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { author: { name: { contains: search, mode: 'insensitive' } } },
      ]
    }

    if (category) {
      where.category = { slug: category }
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {}
      if (minPrice !== undefined) where.price.gte = minPrice
      if (maxPrice !== undefined) where.price.lte = maxPrice
    }

    if (minRating !== undefined) {
      where.averageRating = { gte: minRating }
    }

    const orderBy: any = {}
    let shouldShuffle = false
    
    switch (sort) {
      case 'rating':
        orderBy.averageRating = 'desc'
        break
      case 'reviews':
        orderBy.reviewCount = 'desc'
        break
      case 'price-asc':
        orderBy.price = 'asc'
        break
      case 'price-desc':
        orderBy.price = 'desc'
        break
      case 'newest':
        orderBy.publishedAt = 'desc'
        break
      case 'random':
        shouldShuffle = true
        break
      default:
        shouldShuffle = true
    }

    // Получаем общее количество курсов
    const total = await prisma.course.count({ where })

    // Формируем параметры запроса
    const queryOptions: any = {
      where,
      include: {
        author: true,
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    }

    // Для случайной сортировки получаем все курсы и перемешиваем
    let courses: any[] = []
    
    if (shouldShuffle) {
      // Получаем все курсы для перемешивания
      const allCourses = await prisma.course.findMany({
        where,
        include: {
          author: true,
          category: true,
          tags: {
            include: {
              tag: true,
            },
          },
        },
      })

      // Перемешиваем массив (Fisher-Yates shuffle)
      function shuffleArray<T>(array: T[]): T[] {
        const shuffled = [...array]
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
        }
        return shuffled
      }

      const shuffled = shuffleArray(allCourses)
      courses = shuffled.slice(skip, skip + limit)
    } else {
      // Для обычной сортировки используем пагинацию
      queryOptions.orderBy = orderBy
      queryOptions.skip = skip
      queryOptions.take = limit
      courses = await prisma.course.findMany(queryOptions)
    }

    return NextResponse.json({
      courses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + courses.length < total,
      },
    })
  } catch (error) {
    console.error('Error fetching courses:', error)
    return NextResponse.json(
      { courses: [], pagination: { page: 1, limit: 30, total: 0, totalPages: 0, hasMore: false } },
      { status: 500 }
    )
  }
}




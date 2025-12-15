import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface QuizAnswer {
  questionId: number
  answer: string | string[]
}

interface RecommendationsRequest {
  answers: QuizAnswer[]
}

export async function POST(request: NextRequest) {
  try {
    const body: RecommendationsRequest = await request.json()
    const { answers } = body

    if (!answers || answers.length !== 5) {
      return NextResponse.json(
        { error: 'Необходимо ответить на все вопросы' },
        { status: 400 }
      )
    }

    // Парсим ответы
    const goal = answers.find((a) => a.questionId === 1)?.answer as string
    const level = answers.find((a) => a.questionId === 2)?.answer as string
    const budget = answers.find((a) => a.questionId === 3)?.answer as string
    const paymentFormat = answers.find((a) => a.questionId === 4)?.answer as string
    const priority = answers.find((a) => a.questionId === 5)?.answer as string

    // Получаем ID авторов для языков
    const skyengAuthor = await prisma.author.findUnique({ where: { slug: 'skyeng' } })
    const skysmartAuthor = await prisma.author.findUnique({ where: { slug: 'skysmart' } })
    const skyproAuthor = await prisma.author.findUnique({ where: { slug: 'skypro' } })
    
    const skyengId = skyengAuthor?.id
    const skysmartId = skysmartAuthor?.id
    const skyproId = skyproAuthor?.id

    // Формируем условия для поиска курсов на основе комбинации ответов
    const where: any = {
      status: 'APPROVED',
    }

    // 1. Фильтр по цели обучения
    if (goal === 'languages') {
      // Языки: только Skyeng и Skysmart, исключаем ВПР и школьные предметы
      const authorIds: string[] = []
      if (skyengId) authorIds.push(skyengId)
      if (skysmartId) authorIds.push(skysmartId)
      
      if (authorIds.length > 0) {
        where.authorId = { in: authorIds }
        where.OR = [
          { category: { name: { contains: 'Языки', mode: 'insensitive' } } },
          { category: { name: { contains: 'Английский', mode: 'insensitive' } } },
          { category: { name: { contains: 'Испанский', mode: 'insensitive' } } },
          { category: { name: { contains: 'Французский', mode: 'insensitive' } } },
          { category: { name: { contains: 'Немецкий', mode: 'insensitive' } } },
          { category: { name: { contains: 'Китайский', mode: 'insensitive' } } },
          { category: { name: { contains: 'Японский', mode: 'insensitive' } } },
          { category: { name: { contains: 'Корейский', mode: 'insensitive' } } },
          { category: { name: { contains: 'Итальянский', mode: 'insensitive' } } },
          { tags: { some: { tag: { name: { contains: 'язык', mode: 'insensitive' } } } } }
        ]
        where.NOT = {
          OR: [
            { title: { contains: 'ВПР', mode: 'insensitive' } },
            { title: { contains: 'ОГЭ', mode: 'insensitive' } },
            { title: { contains: 'ЕГЭ', mode: 'insensitive' } },
            { title: { contains: 'русский язык', mode: 'insensitive' } },
            { title: { contains: 'математика', mode: 'insensitive' } },
            { category: { name: { contains: 'ВПР', mode: 'insensitive' } } },
            { category: { name: { contains: 'ОГЭ', mode: 'insensitive' } } },
            { category: { name: { contains: 'ЕГЭ', mode: 'insensitive' } } }
          ]
        }
      }
    } else if (goal === 'profession') {
      // Профессия: программирование, дизайн, маркетинг, аналитика, менеджмент
      where.OR = [
        { category: { name: { contains: 'Программирование', mode: 'insensitive' } } },
        { category: { name: { contains: 'Дизайн', mode: 'insensitive' } } },
        { category: { name: { contains: 'Маркетинг', mode: 'insensitive' } } },
        { category: { name: { contains: 'SMM', mode: 'insensitive' } } },
        { category: { name: { contains: 'Аналитика', mode: 'insensitive' } } },
        { category: { name: { contains: 'Менеджмент', mode: 'insensitive' } } },
        { category: { name: { contains: 'Бизнес', mode: 'insensitive' } } },
        { tags: { some: { tag: { name: { contains: 'профессия', mode: 'insensitive' } } } } }
      ]
    } else if (goal === 'skills') {
      // Навыки: любые курсы с хорошим рейтингом
      where.averageRating = { gte: 4.0 }
    } else if (goal === 'hobby') {
      // Хобби: творчество, музыка, фотография
      where.OR = [
        { category: { name: { contains: 'Творчество', mode: 'insensitive' } } },
        { category: { name: { contains: 'Музыка', mode: 'insensitive' } } },
        { category: { name: { contains: 'Фотография', mode: 'insensitive' } } }
      ]
    }

    // 2. Фильтр по формату оплаты
    if (paymentFormat === 'per_month') {
      where.priceType = 'PER_MONTH'
    } else if (paymentFormat === 'per_lesson') {
      where.priceType = 'PER_LESSON'
    } else if (paymentFormat === 'one_time') {
      where.priceType = 'ONE_TIME'
    }
    // Если 'any', не добавляем фильтр

    // 3. Фильтр по бюджету
    if (budget === 'low') {
      // До 5000₽
      if (paymentFormat === 'per_month') {
        where.pricePerMonth = { lte: 5000 }
      } else if (paymentFormat === 'per_lesson') {
        where.pricePerLesson = { lte: 5000 }
      } else if (paymentFormat === 'one_time') {
        where.priceOneTime = { lte: 5000 }
      } else {
        where.OR = [
          { AND: [{ priceType: 'PER_MONTH' }, { pricePerMonth: { lte: 5000 } }] },
          { AND: [{ priceType: 'PER_LESSON' }, { pricePerLesson: { lte: 5000 } }] },
          { AND: [{ priceType: 'ONE_TIME' }, { priceOneTime: { lte: 5000 } }] },
          { AND: [{ priceType: null }, { price: { lte: 5000 } }] }
        ]
      }
    } else if (budget === 'medium') {
      // 5000-15000₽
      if (paymentFormat === 'per_month') {
        where.pricePerMonth = { gte: 5000, lte: 15000 }
      } else if (paymentFormat === 'per_lesson') {
        where.pricePerLesson = { gte: 5000, lte: 15000 }
      } else if (paymentFormat === 'one_time') {
        where.priceOneTime = { gte: 5000, lte: 15000 }
      } else {
        where.OR = [
          { AND: [{ priceType: 'PER_MONTH' }, { pricePerMonth: { gte: 5000 } }, { pricePerMonth: { lte: 15000 } }] },
          { AND: [{ priceType: 'PER_LESSON' }, { pricePerLesson: { gte: 5000 } }, { pricePerLesson: { lte: 15000 } }] },
          { AND: [{ priceType: 'ONE_TIME' }, { priceOneTime: { gte: 5000 } }, { priceOneTime: { lte: 15000 } }] },
          { AND: [{ priceType: null }, { price: { gte: 5000 } }, { price: { lte: 15000 } }] }
        ]
      }
    } else if (budget === 'high') {
      // 15000-30000₽
      if (paymentFormat === 'per_month') {
        where.pricePerMonth = { gte: 15000, lte: 30000 }
      } else if (paymentFormat === 'per_lesson') {
        where.pricePerLesson = { gte: 15000, lte: 30000 }
      } else if (paymentFormat === 'one_time') {
        where.priceOneTime = { gte: 15000, lte: 30000 }
      } else {
        where.OR = [
          { AND: [{ priceType: 'PER_MONTH' }, { pricePerMonth: { gte: 15000 } }, { pricePerMonth: { lte: 30000 } }] },
          { AND: [{ priceType: 'PER_LESSON' }, { pricePerLesson: { gte: 15000 } }, { pricePerLesson: { lte: 30000 } }] },
          { AND: [{ priceType: 'ONE_TIME' }, { priceOneTime: { gte: 15000 } }, { priceOneTime: { lte: 30000 } }] },
          { AND: [{ priceType: null }, { price: { gte: 15000 } }, { price: { lte: 30000 } }] }
        ]
      }
    } else if (budget === 'premium') {
      // Свыше 30000₽
      if (paymentFormat === 'per_month') {
        where.pricePerMonth = { gte: 30000 }
      } else if (paymentFormat === 'per_lesson') {
        where.pricePerLesson = { gte: 30000 }
      } else if (paymentFormat === 'one_time') {
        where.priceOneTime = { gte: 30000 }
      } else {
        where.OR = [
          { AND: [{ priceType: 'PER_MONTH' }, { pricePerMonth: { gte: 30000 } }] },
          { AND: [{ priceType: 'PER_LESSON' }, { pricePerLesson: { gte: 30000 } }] },
          { AND: [{ priceType: 'ONE_TIME' }, { priceOneTime: { gte: 30000 } }] },
          { AND: [{ priceType: null }, { price: { gte: 30000 } }] }
        ]
      }
    }

    // 4. Определяем сортировку в зависимости от приоритета
    let orderBy: any = {}
    if (priority === 'quality') {
      orderBy = [
        { averageRating: 'desc' },
        { reviewCount: 'desc' },
      ]
    } else if (priority === 'price') {
      orderBy = [
        { price: 'asc' },
        { pricePerMonth: 'asc' },
        { pricePerLesson: 'asc' },
        { priceOneTime: 'asc' },
      ]
    } else if (priority === 'speed') {
      orderBy = { publishedAt: 'desc' }
    } else {
      // balance - оптимальное соотношение
      orderBy = [
        { averageRating: 'desc' },
        { reviewCount: 'desc' },
      ]
    }

    // Получаем курсы
    let courses = await prisma.course.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        tags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
      orderBy,
      take: 12, // Берем больше, чтобы было из чего выбрать
    })

    // Если курсов меньше 6, постепенно ослабляем фильтры
    if (courses.length < 6) {
      // Шаг 1: Убираем фильтр по формату оплаты, сохраняем категорию и бюджет
      const relaxedWhere: any = { ...where }
      delete relaxedWhere.priceType
      
      // Пересоздаем фильтр по бюджету без формата оплаты
      if (budget === 'low') {
        relaxedWhere.OR = [
          { pricePerMonth: { lte: 5000 } },
          { pricePerLesson: { lte: 5000 } },
          { priceOneTime: { lte: 5000 } },
          { price: { lte: 5000 } }
        ]
      } else if (budget === 'medium') {
        relaxedWhere.OR = [
          { AND: [{ pricePerMonth: { gte: 5000 } }, { pricePerMonth: { lte: 15000 } }] },
          { AND: [{ pricePerLesson: { gte: 5000 } }, { pricePerLesson: { lte: 15000 } }] },
          { AND: [{ priceOneTime: { gte: 5000 } }, { priceOneTime: { lte: 15000 } }] },
          { AND: [{ price: { gte: 5000 } }, { price: { lte: 15000 } }] }
        ]
      } else if (budget === 'high') {
        relaxedWhere.OR = [
          { AND: [{ pricePerMonth: { gte: 15000 } }, { pricePerMonth: { lte: 30000 } }] },
          { AND: [{ pricePerLesson: { gte: 15000 } }, { pricePerLesson: { lte: 30000 } }] },
          { AND: [{ priceOneTime: { gte: 15000 } }, { priceOneTime: { lte: 30000 } }] },
          { AND: [{ price: { gte: 15000 } }, { price: { lte: 30000 } }] }
        ]
      } else if (budget === 'premium') {
        relaxedWhere.OR = [
          { pricePerMonth: { gte: 30000 } },
          { pricePerLesson: { gte: 30000 } },
          { priceOneTime: { gte: 30000 } },
          { price: { gte: 30000 } }
        ]
      }
      
      // Удаляем старые фильтры по цене
      delete relaxedWhere.pricePerMonth
      delete relaxedWhere.pricePerLesson
      delete relaxedWhere.priceOneTime
      delete relaxedWhere.price

      const relaxedCourses = await prisma.course.findMany({
        where: {
          ...relaxedWhere,
          id: { notIn: courses.map((c: any) => c.id) },
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          tags: {
            include: {
              tag: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
            },
          },
        },
        orderBy,
        take: 6 - courses.length,
      })

      courses.push(...relaxedCourses)
    }

    // Если все еще меньше 6, убираем фильтр по бюджету, сохраняем только категорию
    if (courses.length < 6) {
      const categoryOnlyWhere: any = {
        status: 'APPROVED',
      }

      // Сохраняем фильтр по категории
      if (goal === 'languages') {
        const authorIds: string[] = []
        if (skyengId) authorIds.push(skyengId)
        if (skysmartId) authorIds.push(skysmartId)
        if (authorIds.length > 0) {
          categoryOnlyWhere.authorId = { in: authorIds }
        }
        categoryOnlyWhere.OR = [
          { category: { name: { contains: 'Языки', mode: 'insensitive' } } },
          { category: { name: { contains: 'Английский', mode: 'insensitive' } } },
          { category: { name: { contains: 'Испанский', mode: 'insensitive' } } },
          { category: { name: { contains: 'Французский', mode: 'insensitive' } } },
          { category: { name: { contains: 'Немецкий', mode: 'insensitive' } } },
          { category: { name: { contains: 'Китайский', mode: 'insensitive' } } },
          { category: { name: { contains: 'Японский', mode: 'insensitive' } } },
          { category: { name: { contains: 'Корейский', mode: 'insensitive' } } },
          { category: { name: { contains: 'Итальянский', mode: 'insensitive' } } },
          { tags: { some: { tag: { name: { contains: 'язык', mode: 'insensitive' } } } } }
        ]
        categoryOnlyWhere.NOT = {
          OR: [
            { title: { contains: 'ВПР', mode: 'insensitive' } },
            { title: { contains: 'ОГЭ', mode: 'insensitive' } },
            { title: { contains: 'ЕГЭ', mode: 'insensitive' } },
            { title: { contains: 'русский язык', mode: 'insensitive' } },
            { title: { contains: 'математика', mode: 'insensitive' } },
            { category: { name: { contains: 'ВПР', mode: 'insensitive' } } },
            { category: { name: { contains: 'ОГЭ', mode: 'insensitive' } } },
            { category: { name: { contains: 'ЕГЭ', mode: 'insensitive' } } }
          ]
        }
      } else if (goal === 'profession') {
        categoryOnlyWhere.OR = [
          { category: { name: { contains: 'Программирование', mode: 'insensitive' } } },
          { category: { name: { contains: 'Дизайн', mode: 'insensitive' } } },
          { category: { name: { contains: 'Маркетинг', mode: 'insensitive' } } },
          { category: { name: { contains: 'SMM', mode: 'insensitive' } } },
          { category: { name: { contains: 'Аналитика', mode: 'insensitive' } } },
          { category: { name: { contains: 'Менеджмент', mode: 'insensitive' } } },
          { category: { name: { contains: 'Бизнес', mode: 'insensitive' } } },
          { tags: { some: { tag: { name: { contains: 'профессия', mode: 'insensitive' } } } } }
        ]
      } else if (goal === 'skills') {
        categoryOnlyWhere.averageRating = { gte: 4.0 }
      } else if (goal === 'hobby') {
        categoryOnlyWhere.OR = [
          { category: { name: { contains: 'Творчество', mode: 'insensitive' } } },
          { category: { name: { contains: 'Музыка', mode: 'insensitive' } } },
          { category: { name: { contains: 'Фотография', mode: 'insensitive' } } }
        ]
      }

      const categoryOnlyCourses = await prisma.course.findMany({
        where: {
          ...categoryOnlyWhere,
          id: { notIn: courses.map((c: any) => c.id) },
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          tags: {
            include: {
              tag: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
            },
          },
        },
        orderBy,
        take: 6 - courses.length,
      })

      courses.push(...categoryOnlyCourses)
    }

    // Возвращаем максимум 6 курсов
    return NextResponse.json({ courses: courses.slice(0, 6) })
  } catch (error) {
    console.error('Error fetching recommendations:', error)
    return NextResponse.json(
      { error: 'Ошибка при получении рекомендаций' },
      { status: 500 }
    )
  }
}

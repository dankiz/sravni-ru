import { prisma } from '@/lib/prisma'
import CoursesList from '@/components/CoursesList'

export const metadata = {
  title: 'Каталог онлайн-курсов - Агрегатор Курсов',
  description: 'Полный каталог онлайн-курсов с фильтрацией, сортировкой и поиском',
}

async function getCourses(searchParams: { [key: string]: string | string[] | undefined }) {
  const search = typeof searchParams.search === 'string' ? searchParams.search : ''
  const category = typeof searchParams.category === 'string' ? searchParams.category : ''
  const minPrice = typeof searchParams.minPrice === 'string' ? parseFloat(searchParams.minPrice) : undefined
  const maxPrice = typeof searchParams.maxPrice === 'string' ? parseFloat(searchParams.maxPrice) : undefined
  const minRating = typeof searchParams.minRating === 'string' ? parseFloat(searchParams.minRating) : undefined
  const sort = typeof searchParams.sort === 'string' ? searchParams.sort : 'random'

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
      // Для случайной сортировки не используем orderBy
      shouldShuffle = true
      break
    default:
      // По умолчанию - случайный порядок
      shouldShuffle = true
  }

  // Получаем общее количество курсов
  const total = await prisma.course.count({ where })

  // Формируем параметры запроса для первых 30 курсов
  const queryOptions: any = {
    where,
    take: 30, // Загружаем только первые 30 курсов
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

  // Добавляем orderBy только если не нужна случайная сортировка
  if (!shouldShuffle && Object.keys(orderBy).length > 0) {
    queryOptions.orderBy = orderBy
  }

  const [coursesRaw, categories] = await Promise.all([
    prisma.course.findMany(queryOptions).catch(() => []),
    prisma.category.findMany({
      orderBy: [{ order: 'asc' }, { name: 'asc' }],
    }).catch(() => []),
  ])

  // Функция для перемешивания массива (Fisher-Yates shuffle)
  function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  // Если нужна случайная сортировка, перемешиваем массив
  let courses = coursesRaw
  if (shouldShuffle && coursesRaw.length > 0) {
    // Для случайной сортировки получаем все курсы, перемешиваем и берем первые 30
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
    courses = shuffleArray(allCourses).slice(0, 30)
  }

  return { courses, categories, total }
}

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const { courses, categories, total } = await getCourses(searchParams)
  
  // Преобразуем searchParams для передачи в клиентский компонент
  const clientSearchParams = {
    search: typeof searchParams.search === 'string' ? searchParams.search : undefined,
    category: typeof searchParams.category === 'string' ? searchParams.category : undefined,
    minPrice: typeof searchParams.minPrice === 'string' ? searchParams.minPrice : undefined,
    maxPrice: typeof searchParams.maxPrice === 'string' ? searchParams.maxPrice : undefined,
    minRating: typeof searchParams.minRating === 'string' ? searchParams.minRating : undefined,
    sort: typeof searchParams.sort === 'string' ? searchParams.sort : undefined,
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Каталог курсов
          </h1>
          <p className="text-gray-400">
            Найдено курсов: {courses.length}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700 sticky top-4">
              <h2 className="text-xl font-bold mb-4 text-white">Фильтры</h2>
              
              <form method="get" action="/courses" className="space-y-6">
                {/* Search */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Поиск
                  </label>
                  <input
                    type="text"
                    name="search"
                    defaultValue={typeof searchParams.search === 'string' ? searchParams.search : ''}
                    placeholder="Название, автор..."
                    className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder-gray-400"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Категория
                  </label>
                  <select
                    name="category"
                    defaultValue={typeof searchParams.category === 'string' ? searchParams.category : ''}
                    className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Все категории</option>
                    {categories.map((cat: any) => (
                      <option key={cat.id} value={cat.slug}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Цена
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      name="minPrice"
                      placeholder="От"
                      defaultValue={typeof searchParams.minPrice === 'string' ? searchParams.minPrice : ''}
                      className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder-gray-400"
                    />
                    <input
                      type="number"
                      name="maxPrice"
                      placeholder="До"
                      defaultValue={typeof searchParams.maxPrice === 'string' ? searchParams.maxPrice : ''}
                      className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder-gray-400"
                    />
                  </div>
                </div>

                {/* Rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Минимальный рейтинг
                  </label>
                  <select
                    name="minRating"
                    defaultValue={typeof searchParams.minRating === 'string' ? searchParams.minRating : ''}
                    className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Любой</option>
                    <option value="4">4+ звезды</option>
                    <option value="3">3+ звезды</option>
                    <option value="2">2+ звезды</option>
                  </select>
                </div>

                {/* Sort */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Сортировка
                  </label>
                  <select
                    name="sort"
                    defaultValue={typeof searchParams.sort === 'string' ? searchParams.sort : 'random'}
                    className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="random">Случайный порядок</option>
                    <option value="rating">По рейтингу</option>
                    <option value="reviews">По количеству отзывов</option>
                    <option value="newest">Сначала новые</option>
                    <option value="price-asc">Цена: по возрастанию</option>
                    <option value="price-desc">Цена: по убыванию</option>
                  </select>
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-primary-600 to-primary-700 text-white px-4 py-2 rounded-lg hover:from-primary-500 hover:to-primary-600 transition"
                  >
                    Применить
                  </button>
                  <a
                    href="/courses"
                    className="flex-1 bg-gray-700 text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-600 transition text-center"
                  >
                    Сбросить
                  </a>
                </div>
              </form>
            </div>
          </aside>

          {/* Courses Grid */}
          <div className="lg:col-span-3">
            <CoursesList 
              initialCourses={courses} 
              initialTotal={total}
              searchParams={clientSearchParams}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

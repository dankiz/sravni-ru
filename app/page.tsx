import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import CourseCard from '@/components/CourseCard'
import PricingFactorsTable from '@/components/PricingFactorsTable'
import WhyChooseUs from '@/components/WhyChooseUs'
import ComparisonTable from '@/components/ComparisonTable'
import { Plus, TrendingUp, Clock, Sparkles, ArrowRight, Brain } from 'lucide-react'

export const metadata = {
  title: 'Агрегатор онлайн-курсов - Каталог лучших образовательных программ',
  description: 'Найдите лучшие онлайн-курсы по различным направлениям. Отзывы, рейтинги, сравнение цен.',
}

async function getFeaturedCourses() {
  try {
    const courses = await prisma.course.findMany({
      where: {
        status: 'APPROVED',
      },
      include: {
        author: true,
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
      orderBy: [
        { averageRating: 'desc' },
        { reviewCount: 'desc' },
        { createdAt: 'desc' },
      ],
      take: 6,
    })
    return courses || []
  } catch (error) {
    console.error('Error fetching courses:', error)
    return []
  }
}

async function getCategories() {
  try {
    // Получаем все категории
    const allCategories = await prisma.category.findMany()

    // Для каждой категории считаем количество одобренных курсов
    const categoriesWithCounts = []
    for (const category of allCategories) {
      const approvedCount = await prisma.course.count({
        where: {
          categoryId: category.id,
          status: 'APPROVED',
        },
      })
      categoriesWithCounts.push({
        ...category,
        approvedCount,
      })
    }

    // Фильтруем только категории с курсами
    const filtered = categoriesWithCounts.filter(category => category.approvedCount > 0)

    // Сортируем: ЕГЭ и ОГЭ первые (1 и 2), остальные по количеству курсов (по убыванию)
    filtered.sort((a, b) => {
      // Проверяем, является ли категория ЕГЭ или ОГЭ
      const isA_EGE = a.name.toLowerCase().includes('егэ') || a.slug.toLowerCase().includes('ege')
      const isA_OGE = a.name.toLowerCase().includes('огэ') || a.slug.toLowerCase().includes('oge')
      const isB_EGE = b.name.toLowerCase().includes('егэ') || b.slug.toLowerCase().includes('ege')
      const isB_OGE = b.name.toLowerCase().includes('огэ') || b.slug.toLowerCase().includes('oge')
      
      // ЕГЭ всегда первый
      if (isA_EGE && !isB_EGE) return -1
      if (!isA_EGE && isB_EGE) return 1
      
      // ОГЭ всегда второй (если не ЕГЭ)
      if (isA_OGE && !isB_OGE && !isB_EGE) return -1
      if (!isA_OGE && isB_OGE && !isA_EGE) return 1
      
      // Если обе категории ЕГЭ или ОГЭ, сохраняем порядок
      if ((isA_EGE || isA_OGE) && (isB_EGE || isB_OGE)) {
        if (isA_EGE && isB_OGE) return -1
        if (isA_OGE && isB_EGE) return 1
        return 0
      }
      
      // Для остальных категорий сортируем по количеству курсов (по убыванию)
      return b.approvedCount - a.approvedCount
    })

    return filtered
  } catch (error) {
    console.error('Error fetching categories:', error)
    return []
  }
}

export default async function Home() {
  const [courses, categories] = await Promise.all([
    getFeaturedCourses(),
    getCategories(),
  ])

  return (
    <div className="bg-gray-900 min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-20 overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary-500/10 text-primary-400 px-4 py-2 rounded-full mb-6 border border-primary-500/20">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">Каталог проверенных курсов</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-gray-100 to-gray-400 bg-clip-text text-transparent">
              Найдите лучшие онлайн-курсы
            </h1>
            <p className="text-xl mb-8 text-gray-400 max-w-2xl mx-auto">
              Каталог проверенных образовательных программ с отзывами, рейтингами и сравнением цен
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/courses"
                className="bg-white text-gray-900 px-8 py-3.5 rounded-lg font-semibold hover:bg-gray-100 transition shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                Смотреть каталог
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/quiz"
                className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-8 py-3.5 rounded-lg font-semibold hover:from-purple-500 hover:to-purple-600 transition shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2"
              >
                <Brain className="w-5 h-5" />
                Подобрать курс
              </Link>
              <Link
                href="/add-course"
                className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-8 py-3.5 rounded-lg font-semibold hover:from-primary-500 hover:to-primary-600 transition shadow-lg shadow-primary-500/20 flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Добавить курс
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-12 bg-gray-800 border-y border-gray-700">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <form action="/courses" method="get" className="flex gap-2">
              <input
                type="text"
                name="search"
                placeholder="Поиск по курсам, авторам, категориям..."
                className="flex-1 px-6 py-3.5 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder-gray-400"
              />
              <button
                type="submit"
                className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-8 py-3.5 rounded-lg font-semibold hover:from-primary-500 hover:to-primary-600 transition shadow-lg"
              >
                Найти
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      {categories.length > 0 && (
        <section className="py-16 container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">
                Категории курсов
              </h2>
              <p className="text-gray-400">
                Выберите интересующую вас категорию
              </p>
            </div>
            <Link
              href="/categories"
              className="text-primary-400 hover:text-primary-300 font-semibold flex items-center gap-2 transition"
            >
              Все категории
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {categories.slice(0, 8).map((category) => (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                className="group bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-primary-500/50 transition-all card-hover relative overflow-hidden"
              >
                <div className="flex items-start justify-between mb-3 relative z-10">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-white group-hover:text-primary-400 transition">
                      {category.name}
                    </h3>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-primary-400 transition transform group-hover:translate-x-1" />
                </div>
                {category.description && (
                  <p className="text-gray-400 text-sm mb-3 line-clamp-2 relative z-10">
                    {category.description}
                  </p>
                )}
                <div className="flex items-center gap-2 text-sm text-gray-500 relative z-10">
                  <span className="font-semibold text-primary-400">{category.approvedCount}</span>
                  <span>курсов</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Courses */}
      <section className="py-16 container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">
              Популярные курсы
            </h2>
            <p className="text-gray-400">
              Лучшие курсы по отзывам и рейтингам
            </p>
          </div>
          <Link
            href="/courses"
            className="text-primary-400 hover:text-primary-300 font-semibold flex items-center gap-2 transition"
          >
            Смотреть все
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        {courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <div className="bg-gray-800 rounded-xl shadow-lg p-12 text-center border border-gray-700">
            <p className="text-gray-400 text-lg mb-4">
              Пока нет опубликованных курсов. Будьте первым, кто добавит курс!
            </p>
            <Link
              href="/add-course"
              className="inline-block bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-3 rounded-lg font-semibold hover:from-primary-500 hover:to-primary-600 transition shadow-lg"
            >
              Добавить курс
            </Link>
          </div>
        )}
      </section>

      {/* Pricing Factors Table */}
      <PricingFactorsTable />

      {/* Why Choose Us */}
      <WhyChooseUs />

      {/* Comparison Table */}
      <ComparisonTable />

      {/* Features */}
      <section className="py-16 bg-gray-800 border-y border-gray-700">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="bg-gradient-to-br from-primary-500/20 to-primary-600/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform border border-primary-500/30">
                <TrendingUp className="w-8 h-8 text-primary-400" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-white">Актуальные рейтинги</h3>
              <p className="text-gray-400">
                Все курсы оцениваются реальными пользователями
              </p>
            </div>
            <div className="text-center group">
              <div className="bg-gradient-to-br from-primary-500/20 to-primary-600/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform border border-primary-500/30">
                <Clock className="w-8 h-8 text-primary-400" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-white">Модерация контента</h3>
              <p className="text-gray-400">
                Все курсы проходят проверку перед публикацией
              </p>
            </div>
            <div className="text-center group">
              <div className="bg-gradient-to-br from-primary-500/20 to-primary-600/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform border border-primary-500/30">
                <Plus className="w-8 h-8 text-primary-400" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-white">Бесплатное добавление</h3>
              <p className="text-gray-400">
                Любой может предложить курс для добавления в каталог
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
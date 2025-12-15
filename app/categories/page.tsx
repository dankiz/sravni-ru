import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Все категории курсов - Агрегатор Курсов',
  description: 'Полный список всех категорий онлайн-курсов с количеством доступных программ',
}

async function getCategories() {
  try {
    // Получаем все категории с правильной сортировкой по order
    const allCategories = await prisma.category.findMany({
      orderBy: [
        { order: 'asc' },
        { name: 'asc' },
      ],
    })

    // Для каждой категории считаем количество одобренных курсов
    const categoriesWithCounts = []
    for (let i = 0; i < allCategories.length; i++) {
      const category = allCategories[i]
      const approvedCount = await prisma.course.count({
        where: {
          categoryId: category.id,
          status: 'APPROVED',
        },
      })
      categoriesWithCounts.push({
        ...category,
        approvedCount,
        _sortIndex: i
      })
    }

    // Фильтруем только категории с курсами
    const filtered = categoriesWithCounts.filter((category: any) => category.approvedCount > 0)

    // Сортируем по order, затем по исходному индексу
    filtered.sort((a: any, b: any) => {
      if (a.order !== b.order) {
        return a.order - b.order
      }
      return a._sortIndex - b._sortIndex
    })

    // Удаляем временное поле _sortIndex
    return filtered.map(({ _sortIndex, ...category }: any) => category)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return []
  }
}

export default async function CategoriesPage() {
  const categories = await getCategories()

  return (
    <div className="bg-gray-900 min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Breadcrumbs */}
        <nav className="mb-6 text-sm">
          <Link href="/" className="text-primary-400 hover:text-primary-300 transition">
            Главная
          </Link>
          <span className="mx-2 text-gray-600">/</span>
          <span className="text-gray-400">Категории</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Все категории курсов
          </h1>
          <p className="text-gray-400">
            Выберите интересующую вас категорию. Найдено категорий: {categories.length}
          </p>
        </div>

        {/* Categories Grid */}
        {categories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {categories.map((category: any) => (
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
        ) : (
          <div className="bg-gray-800 rounded-xl shadow-lg p-12 text-center border border-gray-700">
            <p className="text-gray-400 text-lg mb-4">
              Пока нет категорий с опубликованными курсами.
            </p>
            <Link
              href="/"
              className="text-primary-400 hover:text-primary-300 font-semibold"
            >
              Вернуться на главную
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}




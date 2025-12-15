import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import CourseCard from '@/components/CourseCard'
import { Metadata } from 'next'

async function getCategory(slug: string) {
  try {
    // Декодируем slug на случай, если он пришел в закодированном виде
    const decodedSlug = decodeURIComponent(slug)
    
    // Пробуем найти категорию по декодированному slug
    let category = await prisma.category.findUnique({
      where: { slug: decodedSlug },
      include: {
        courses: {
          where: { status: 'APPROVED' },
          include: {
            author: true,
            category: true,
            tags: {
              include: {
                tag: true,
              },
            },
          },
          orderBy: { averageRating: 'desc' },
        },
      },
    })
    
    // Если не найдено, пробуем найти по исходному slug (на случай если он уже был декодирован)
    if (!category && decodedSlug !== slug) {
      category = await prisma.category.findUnique({
        where: { slug },
        include: {
          courses: {
            where: { status: 'APPROVED' },
            include: {
              author: true,
              category: true,
              tags: {
                include: {
                  tag: true,
                },
              },
            },
            orderBy: { averageRating: 'desc' },
          },
        },
      })
    }
    
    return category
  } catch (error) {
    console.error('Error fetching category:', error)
    return null
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const category = await getCategory(params.slug)
  
  if (!category) {
    return {
      title: 'Категория не найдена',
    }
  }

  return {
    title: `${category.name} - Категория курсов | Агрегатор Курсов`,
    description: category.description || `Курсы по категории ${category.name}`,
  }
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const category = await getCategory(params.slug)

  if (!category) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        {/* Breadcrumbs */}
        <nav className="mb-6 text-sm">
          <a href="/" className="text-primary-400 hover:text-primary-300 transition">Главная</a>
          <span className="mx-2 text-gray-500">/</span>
          <a href="/courses" className="text-primary-400 hover:text-primary-300 transition">Курсы</a>
          <span className="mx-2 text-gray-500">/</span>
          <span className="text-gray-400">{category.name}</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            {category.name}
          </h1>
          {category.description && (
            <p className="text-gray-300 text-lg max-w-3xl">
              {category.description}
            </p>
          )}
          <p className="text-gray-400 mt-2">
            Найдено курсов: {category.courses.length}
          </p>
        </div>

        {/* Courses Grid */}
        {category.courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {category.courses.map((course: any) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <div className="bg-gray-800 rounded-lg shadow-lg p-12 text-center border border-gray-700">
            <p className="text-gray-400 text-lg">
              В этой категории пока нет курсов
            </p>
          </div>
        )}
      </div>
    </div>
  )
}






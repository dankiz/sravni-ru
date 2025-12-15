import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import SchoolCourseCard from '@/components/SchoolCourseCard'
import { Metadata } from 'next'

async function getTag(slug: string) {
  try {
    // Decode URL-encoded slug
    let decodedSlug = slug
    try {
      decodedSlug = decodeURIComponent(slug)
      // Handle double encoding
      if (decodedSlug.includes('%')) {
        decodedSlug = decodeURIComponent(decodedSlug)
      }
    } catch (e) {
      // If decoding fails, use original slug
      decodedSlug = slug
    }

    const tag = await prisma.tag.findUnique({
      where: { slug: decodedSlug },
      include: {
        courses: {
          where: {
            course: {
              status: 'APPROVED',
            },
          },
          include: {
            course: {
              include: {
                author: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                  },
                },
                tags: {
                  include: {
                    tag: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!tag) return null

    // Map courses from CourseTag relation
    const approvedCourses = tag.courses.map(ct => ct.course)

    return {
      ...tag,
      courses: approvedCourses,
    }
  } catch (error) {
    console.error('Error fetching tag:', error)
    return null
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const tag = await getTag(params.slug)

  if (!tag) {
    return {
      title: 'Тег не найден',
    }
  }

  return {
    title: `${tag.name} - Курсы по тегу | Агрегатор Курсов`,
    description: tag.description || `Все курсы по тегу "${tag.name}" на Агрегаторе Курсов`,
  }
}

export default async function TagPage({ params }: { params: { slug: string } }) {
  const tag = await getTag(params.slug)

  if (!tag) {
    notFound()
  }

  return (
    <div className="bg-gray-900 min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Breadcrumbs */}
        <nav className="mb-6 text-sm">
          <Link href="/" className="text-primary-400 hover:text-primary-300 transition">
            Главная
          </Link>
          <span className="mx-2 text-gray-600">/</span>
          <Link href="/courses" className="text-primary-400 hover:text-primary-300 transition">
            Курсы
          </Link>
          <span className="mx-2 text-gray-600">/</span>
          <span className="text-gray-400">{tag.name}</span>
        </nav>

        {/* Header */}
        <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden mb-8 border border-gray-700">
          <div className="p-8">
            <div className="flex items-center gap-4 mb-4">
              <h1 className="text-4xl font-bold text-white">{tag.name}</h1>
              {tag.color && (
                <div
                  className="px-4 py-2 rounded-lg text-white font-semibold"
                  style={{ backgroundColor: tag.color }}
                >
                  {tag.name}
                </div>
              )}
            </div>
            {tag.description && (
              <p className="text-gray-300 text-lg">{tag.description}</p>
            )}
            <p className="text-gray-400 mt-2">
              Найдено курсов: <span className="text-white font-semibold">{tag.courses.length}</span>
            </p>
          </div>
        </div>

        {/* Courses */}
        {tag.courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {tag.courses.map((course: any) => (
              <SchoolCourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <div className="bg-gray-800 p-12 rounded-xl shadow-lg text-center border border-gray-700">
            <p className="text-gray-400 text-lg">
              По этому тегу пока нет опубликованных курсов.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

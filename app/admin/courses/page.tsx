import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-helpers'
import Link from 'next/link'
import { Plus, Edit, Trash2 } from 'lucide-react'
import CourseActions from '@/components/admin/CourseActions'
import { formatPrice } from '@/lib/utils'

async function getCourses() {
  return await prisma.course.findMany({
    include: {
      author: true,
      category: true,
    },
    orderBy: { updatedAt: 'desc' },
  }).catch(() => [])
}

export default async function CoursesPage() {
  await requireAuth()
  const courses = await getCourses()

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">Все курсы</h1>
        <div className="flex gap-4">
          <Link
            href="/admin/courses/pending"
            className="text-primary-400 hover:text-primary-300 font-semibold transition"
          >
            На модерации ({courses.filter(c => c.status === 'PENDING').length})
          </Link>
          <Link
            href="/admin/courses/new"
            className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-4 py-2 rounded-lg hover:from-primary-500 hover:to-primary-600 transition flex items-center gap-2 shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Создать курс
          </Link>
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-700">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Курс
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Автор
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Статус
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Рейтинг
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {courses.map((course) => (
                <tr key={course.id} className="hover:bg-gray-700/50 transition">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {course.image && (
                        <img
                          src={course.image}
                          alt={course.title}
                          className="h-12 w-12 rounded object-cover mr-3"
                        />
                      )}
                      <div>
                        <div className="text-sm font-medium text-white">
                          {course.title}
                        </div>
                        <div className="text-sm text-gray-400">
                          {formatPrice(course.price)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {course.author.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      course.status === 'APPROVED' 
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                        : course.status === 'PENDING'
                        ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                      {course.status === 'APPROVED' ? 'Опубликован' : 
                       course.status === 'PENDING' ? 'На модерации' : 'Отклонен'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {(course.averageRating || 0).toFixed(1)} ({course.reviewCount})
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <CourseActions course={course} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}


import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-helpers'
import Link from 'next/link'
import { CheckCircle, XCircle, Edit } from 'lucide-react'
import PendingCourseActions from '@/components/admin/PendingCourseActions'

async function getPendingCourses() {
  return await prisma.course.findMany({
    where: { status: 'PENDING' },
    include: {
      author: true,
      category: true,
    },
    orderBy: { createdAt: 'desc' },
  }).catch(() => [])
}

export default async function PendingCoursesPage() {
  await requireAuth()
  const courses = await getPendingCourses()

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">Курсы на модерации</h1>
        <Link
          href="/admin/courses"
          className="text-primary-400 hover:text-primary-300 font-semibold transition"
        >
          Все курсы →
        </Link>
      </div>

      {courses.length > 0 ? (
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
                    Предложен
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
                            {course.submittedByName} ({course.submittedByEmail})
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {course.author.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {new Date(course.createdAt).toLocaleDateString('ru-RU')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <PendingCourseActions course={course} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-xl shadow-lg p-12 text-center border border-gray-700">
          <p className="text-gray-400 text-lg">Нет курсов на модерации</p>
        </div>
      )}
    </div>
  )
}

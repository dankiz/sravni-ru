import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-helpers'
import Link from 'next/link'
import { Plus, Edit, Trash2 } from 'lucide-react'
import AuthorActions from '@/components/admin/AuthorActions'

async function getAuthors() {
  return await prisma.author.findMany({
    include: {
      _count: {
        select: { courses: { where: { status: 'APPROVED' } } },
      },
    },
    orderBy: { name: 'asc' },
  }).catch(() => [])
}

export default async function AuthorsPage() {
  await requireAuth()
  const authors = await getAuthors()

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">Авторы</h1>
        <Link
          href="/admin/authors/new"
          className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-4 py-2 rounded-lg hover:from-primary-500 hover:to-primary-600 transition flex items-center gap-2 shadow-lg"
        >
          <Plus className="w-5 h-5" />
          Добавить организацию
        </Link>
      </div>

      <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-700">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Автор
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Курсов
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {authors.map((author: any) => (
                <tr key={author.id} className="hover:bg-gray-700/50 transition">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {author.logo && (
                        <img
                          src={author.logo}
                          alt={author.name}
                          className="h-12 w-12 rounded object-cover mr-3"
                        />
                      )}
                      <div>
                        <div className="text-sm font-medium text-white">
                          {author.name}
                        </div>
                        {author.email && (
                          <div className="text-sm text-gray-400">
                            {author.email}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {author._count.courses}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <AuthorActions author={author} />
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

import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-helpers'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import TagActions from '@/components/admin/TagActions'

async function getTags() {
  return await prisma.tag.findMany({
    include: {
      _count: {
        select: { courses: true },
      },
    },
    orderBy: { name: 'asc' },
  }).catch(() => [])
}

export default async function TagsPage() {
  await requireAuth()
  const tags = await getTags()

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Теги</h1>
          <p className="text-gray-400 mt-2">
            Теги используются для категоризации курсов и отображаются на главной странице
          </p>
        </div>
        <Link
          href="/admin/tags/new"
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Создать тег
        </Link>
      </div>

      <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-700">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Тег
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Описание
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Цвет
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
              {tags.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                    Теги еще не созданы. Создайте первый тег!
                  </td>
                </tr>
              ) : (
                tags.map((tag) => (
                  <tr key={tag.id} className="hover:bg-gray-700/50 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-100">
                        {tag.name}
                      </div>
                      <div className="text-sm text-gray-400">
                        /{tag.slug}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-300 max-w-md truncate">
                        {tag.description || '—'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {tag.color ? (
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded border border-gray-600"
                            style={{ backgroundColor: tag.color }}
                          />
                          <span className="text-sm text-gray-400">{tag.color}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {tag._count.courses}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <TagActions tag={tag} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

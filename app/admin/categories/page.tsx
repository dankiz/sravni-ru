import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-helpers'
import Link from 'next/link'
import { Plus, Edit, Trash2 } from 'lucide-react'
import CategoryActions from '@/components/admin/CategoryActions'
import CategoryOrderManager from '@/components/admin/CategoryOrderManager'

async function getCategories() {
  return await prisma.category.findMany({
    include: {
      _count: {
        select: { courses: { where: { status: 'APPROVED' } } },
      },
    },
    orderBy: [{ order: 'asc' }, { name: 'asc' }],
  }).catch(() => [])
}

export default async function CategoriesPage() {
  await requireAuth()
  const categories = await getCategories()

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">Категории</h1>
        <Link
          href="/admin/categories/new"
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Создать категорию
        </Link>
      </div>

      {/* Order Manager */}
      <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-8 border border-gray-700">
        <h2 className="text-xl font-bold text-white mb-4">Управление порядком</h2>
        <CategoryOrderManager
          initialCategories={categories.map(c => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
            order: c.order,
          }))}
        />
      </div>

      <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-700">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Категория
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Описание
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
              {categories.map((category) => (
                <tr key={category.id} className="hover:bg-gray-700/50 transition">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-100">
                      {category.name}
                    </div>
                    <div className="text-sm text-gray-400">
                      /{category.slug}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-300 max-w-md truncate">
                      {category.description || '—'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {category._count.courses}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <CategoryActions category={category} />
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

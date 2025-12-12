import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-helpers'
import { notFound } from 'next/navigation'
import CategoryEditForm from '@/components/admin/CategoryEditForm'

async function getCategory(id: string) {
  return await prisma.category.findUnique({
    where: { id },
  })
}

export default async function EditCategoryPage({
  params,
}: {
  params: { id: string }
}) {
  await requireAuth()
  
  const category = await getCategory(params.id)

  if (!category) {
    notFound()
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-8">
        Редактировать категорию: {category.name}
      </h1>
      <CategoryEditForm category={category} />
    </div>
  )
}

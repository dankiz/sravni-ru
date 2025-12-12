import { requireAuth } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'
import TagEditForm from '@/components/admin/TagEditForm'
import { notFound } from 'next/navigation'

async function getTag(id: string) {
  return await prisma.tag.findUnique({
    where: { id },
  })
}

export default async function EditTagPage({ params }: { params: { id: string } }) {
  await requireAuth()
  const tag = await getTag(params.id)

  if (!tag) {
    notFound()
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-8">Редактировать тег</h1>
      <TagEditForm tag={tag} />
    </div>
  )
}

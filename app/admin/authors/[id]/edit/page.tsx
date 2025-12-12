import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-helpers'
import { notFound } from 'next/navigation'
import AuthorEditForm from '@/components/admin/AuthorEditForm'

async function getAuthor(id: string) {
  return await prisma.author.findUnique({
    where: { id },
  })
}

export default async function EditAuthorPage({
  params,
}: {
  params: { id: string }
}) {
  await requireAuth()
  
  const author = await getAuthor(params.id)

  if (!author) {
    notFound()
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-8">
        Редактировать организацию: {author.name}
      </h1>
      <AuthorEditForm author={author} />
    </div>
  )
}

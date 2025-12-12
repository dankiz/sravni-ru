import { requireAuth } from '@/lib/auth-helpers'
import TagEditForm from '@/components/admin/TagEditForm'

export default async function NewTagPage() {
  await requireAuth()

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-8">Создать тег</h1>
      <TagEditForm />
    </div>
  )
}

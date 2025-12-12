import { requireAuth } from '@/lib/auth-helpers'
import AuthorEditForm from '@/components/admin/AuthorEditForm'

export default async function NewAuthorPage() {
  await requireAuth()

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-8">Добавить организацию</h1>
      <AuthorEditForm />
    </div>
  )
}

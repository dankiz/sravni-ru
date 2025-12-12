import { requireAuth } from '@/lib/auth-helpers'
import CategoryEditForm from '@/components/admin/CategoryEditForm'

export default async function NewCategoryPage() {
  await requireAuth()

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-8">Создать категорию</h1>
      <CategoryEditForm />
    </div>
  )
}

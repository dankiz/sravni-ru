import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-helpers'
import CourseEditForm from '@/components/admin/CourseEditForm'

async function getCategories() {
  return await prisma.category.findMany({
    orderBy: { name: 'asc' },
  }).catch(() => [])
}

async function getAuthors() {
  return await prisma.author.findMany({
    orderBy: { name: 'asc' },
  }).catch(() => [])
}

async function getTags() {
  return await prisma.tag.findMany({
    orderBy: { name: 'asc' },
  }).catch(() => [])
}

export default async function NewCoursePage() {
  await requireAuth()

  const [categories, authors, tags] = await Promise.all([
    getCategories(),
    getAuthors(),
    getTags(),
  ])

  const newCourse = {
    id: 'new',
    title: '',
    slug: '',
    description: null,
    link: '',
    image: null,
    price: null,
    contacts: null,
    pros: null,
    cons: null,
    authorId: authors.length > 0 ? authors[0].id : '',
    categoryId: null,
    status: 'PENDING' as const,
  }

  if (authors.length === 0) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-white mb-8">Создать курс</h1>
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6">
          <p className="text-yellow-400 mb-4">
            Для создания курса необходимо сначала создать хотя бы одного автора.
          </p>
          <a
            href="/admin/authors/new"
            className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-4 py-2 rounded-lg hover:from-primary-500 hover:to-primary-600 transition inline-block shadow-lg"
          >
            Создать автора
          </a>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-8">Создать курс</h1>
      <CourseEditForm course={newCourse} categories={categories} authors={authors} tags={tags} isNew />
    </div>
  )
}

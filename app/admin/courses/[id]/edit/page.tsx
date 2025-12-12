import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-helpers'
import { notFound } from 'next/navigation'
import CourseEditForm from '@/components/admin/CourseEditForm'

async function getCourse(id: string) {
  return await prisma.course.findUnique({
    where: { id },
    include: {
      author: true,
      category: true,
      tags: {
        include: {
          tag: true,
        },
      },
    },
  })
}

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

export default async function EditCoursePage({
  params,
}: {
  params: { id: string }
}) {
  await requireAuth()

  const [course, categories, authors, tags] = await Promise.all([
    getCourse(params.id),
    getCategories(),
    getAuthors(),
    getTags(),
  ])

  if (!course) {
    notFound()
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-8">
        Редактировать курс: {course.title}
      </h1>
      <CourseEditForm course={course} categories={categories} authors={authors} tags={tags} />
    </div>
  )
}

import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-helpers'
import RatingManager from '@/components/admin/RatingManager'

async function getCourses() {
  return await prisma.course.findMany({
    where: { status: 'APPROVED' },
    include: {
      author: true,
      reviews: {
        where: { status: 'APPROVED' },
      },
    },
    orderBy: { title: 'asc' },
  }).catch(() => [])
}

export default async function RatingsPage() {
  await requireAuth()
  const courses = await getCourses()

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-8">Управление оценками</h1>
      <p className="text-gray-400 mb-6">
        Здесь вы можете вручную скорректировать средний рейтинг курсов.
      </p>
      <RatingManager courses={courses} />
    </div>
  )
}

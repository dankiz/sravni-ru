import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-helpers'
import ReviewActions from '@/components/admin/ReviewActions'

async function getPendingReviews() {
  return await prisma.review.findMany({
    where: { status: 'PENDING' },
    include: {
      course: {
        include: {
          author: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  }).catch(() => [])
}

export default async function ReviewsPage() {
  await requireAuth()
  const reviews = await getPendingReviews()

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-8">Отзывы на модерации</h1>

      {reviews.length > 0 ? (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {review.authorName}
                  </h3>
                  <p className="text-sm text-gray-400">
                    Курс: <span className="font-medium text-gray-300">{review.course.title}</span>
                  </p>
                  <p className="text-sm text-gray-400">
                    Автор курса: {review.course.author.name}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(review.createdAt).toLocaleDateString('ru-RU')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-yellow-400">
                    {review.rating}⭐
                  </span>
                </div>
              </div>
              <p className="text-gray-300 mb-4 whitespace-pre-line">
                {review.text}
              </p>
              <ReviewActions review={review} />
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-800 rounded-xl shadow-lg p-12 text-center border border-gray-700">
          <p className="text-gray-400 text-lg">Нет отзывов на модерации</p>
        </div>
      )}
    </div>
  )
}

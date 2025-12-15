'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

interface Course {
  id: string
  title: string
  slug: string
  averageRating: number | null
  reviewCount: number
  author: { name: string }
  reviews: { rating: number }[]
}

export default function RatingManager({ courses }: { courses: Course[] }) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [rating, setRating] = useState<number>(0)
  const router = useRouter()

  const handleEdit = (course: Course) => {
    setEditingId(course.id)
    setRating(course.averageRating || 0)
  }

  const handleSave = async (courseId: string) => {
    if (rating < 0 || rating > 5) {
      toast.error('Рейтинг должен быть от 0 до 5')
      return
    }

    try {
      const response = await fetch(`/api/admin/courses/${courseId}/rating`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating }),
      })

      if (response.ok) {
        toast.success('Рейтинг обновлен')
        setEditingId(null)
        router.refresh()
      } else {
        const error = await response.json()
        toast.error(error.message || 'Ошибка при обновлении рейтинга')
      }
    } catch (error) {
      toast.error('Ошибка при обновлении рейтинга')
    }
  }

  const handleCancel = () => {
    setEditingId(null)
    setRating(0)
  }

  const calculateActualRating = (reviews: { rating: number }[]) => {
    if (reviews.length === 0) return 0
    return reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length
  }

  return (
    <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-700">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Курс
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Текущий рейтинг
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Отзывов
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Действия
              </th>
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-700">
            {courses.map((course) => {
              const actualRating = calculateActualRating(course.reviews)
              const isEditing = editingId === course.id

              return (
                <tr key={course.id} className="hover:bg-gray-700/50 transition">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-white">
                      {course.title}
                    </div>
                    <div className="text-sm text-gray-400">
                      {course.author.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {isEditing ? (
                      <input
                        type="number"
                        min="0"
                        max="5"
                        step="0.1"
                        value={rating}
                        onChange={(e) => setRating(parseFloat(e.target.value) || 0)}
                        className="w-20 px-2 py-1 bg-gray-700 text-white border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    ) : (
                      <div>
                        <div className="text-sm font-semibold text-white">
                          {(course.averageRating || 0).toFixed(1)}
                        </div>
                        {Math.abs((course.averageRating || 0) - actualRating) > 0.1 && (
                          <div className="text-xs text-gray-400">
                            Реальный: {actualRating.toFixed(1)}
                          </div>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {course.reviewCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {isEditing ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSave(course.id)}
                          className="text-green-400 hover:text-green-300 transition"
                        >
                          Сохранить
                        </button>
                        <button
                          onClick={handleCancel}
                          className="text-gray-400 hover:text-gray-300 transition"
                        >
                          Отмена
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleEdit(course)}
                        className="text-primary-400 hover:text-primary-300 transition"
                      >
                        Редактировать
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'

interface Review {
  id: string
  course: {
    id: string
    title: string
  }
}

export default function ReviewActions({ review }: { review: Review }) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleApprove = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/reviews/${review.id}/approve`, {
        method: 'POST',
      })

      if (response.ok) {
        toast.success('Отзыв опубликован')
        router.refresh()
      } else {
        const error = await response.json()
        toast.error(error.message || 'Ошибка при публикации')
      }
    } catch (error) {
      toast.error('Ошибка при публикации')
    } finally {
      setIsLoading(false)
    }
  }

  const handleReject = async () => {
    if (!confirm('Отклонить этот отзыв?')) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/reviews/${review.id}/reject`, {
        method: 'POST',
      })

      if (response.ok) {
        toast.success('Отзыв отклонен')
        router.refresh()
      } else {
        const error = await response.json()
        toast.error(error.message || 'Ошибка при отклонении')
      }
    } catch (error) {
      toast.error('Ошибка при отклонении')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleApprove}
        disabled={isLoading}
        className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2 rounded-lg hover:from-green-500 hover:to-green-600 transition disabled:opacity-50 shadow-lg"
      >
        <CheckCircle className="w-5 h-5" />
        Опубликовать
      </button>
      <button
        onClick={handleReject}
        disabled={isLoading}
        className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2 rounded-lg hover:from-red-500 hover:to-red-600 transition disabled:opacity-50 shadow-lg"
      >
        <XCircle className="w-5 h-5" />
        Отклонить
      </button>
    </div>
  )
}

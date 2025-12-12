'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, XCircle, Edit } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface Course {
  id: string
  title: string
  slug: string
  author: { id: string; name: string; slug: string }
}

export default function PendingCourseActions({ course }: { course: Course }) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleApprove = async () => {
    if (!confirm('Опубликовать этот курс?')) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/courses/${course.id}/approve`, {
        method: 'POST',
      })

      if (response.ok) {
        toast.success('Курс опубликован')
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
    if (!confirm('Отклонить этот курс?')) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/courses/${course.id}/reject`, {
        method: 'POST',
      })

      if (response.ok) {
        toast.success('Курс отклонен')
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
    <div className="flex items-center gap-2">
      <Link
        href={`/admin/courses/${course.id}/edit`}
        className="text-primary-400 hover:text-primary-300 p-1 transition"
        title="Редактировать"
      >
        <Edit className="w-5 h-5" />
      </Link>
      <button
        onClick={handleApprove}
        disabled={isLoading}
        className="text-green-400 hover:text-green-300 p-1 disabled:opacity-50 transition"
        title="Опубликовать"
      >
        <CheckCircle className="w-5 h-5" />
      </button>
      <button
        onClick={handleReject}
        disabled={isLoading}
        className="text-red-400 hover:text-red-300 p-1 disabled:opacity-50 transition"
        title="Отклонить"
      >
        <XCircle className="w-5 h-5" />
      </button>
    </div>
  )
}

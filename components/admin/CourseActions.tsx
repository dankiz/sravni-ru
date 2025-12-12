'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Edit, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface Course {
  id: string
  title: string
  slug: string
  status: string
}

export default function CourseActions({ course }: { course: Course }) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm(`Удалить курс "${course.title}"?`)) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/courses/${course.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Курс удален')
        router.refresh()
      } else {
        const error = await response.json()
        toast.error(error.message || 'Ошибка при удалении')
      }
    } catch (error) {
      toast.error('Ошибка при удалении')
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
        onClick={handleDelete}
        disabled={isLoading}
        className="text-red-400 hover:text-red-300 p-1 disabled:opacity-50 transition"
        title="Удалить"
      >
        <Trash2 className="w-5 h-5" />
      </button>
    </div>
  )
}

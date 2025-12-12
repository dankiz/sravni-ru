'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Edit, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface Author {
  id: string
  name: string
  slug: string
  _count?: { courses: number }
}

export default function AuthorActions({ author }: { author: Author }) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    const courseCount = author._count?.courses || 0
    if (courseCount > 0) {
      toast.error('Нельзя удалить автора с опубликованными курсами')
      return
    }

    if (!confirm(`Удалить автора "${author.name}"?`)) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/authors/${author.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Автор удален')
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
        href={`/admin/authors/${author.id}/edit`}
        className="text-primary-400 hover:text-primary-300 p-1 transition"
        title="Редактировать"
      >
        <Edit className="w-5 h-5" />
      </Link>
      <button
        onClick={handleDelete}
        disabled={isLoading || (author._count?.courses || 0) > 0}
        className="text-red-400 hover:text-red-300 p-1 disabled:opacity-50 transition"
        title="Удалить"
      >
        <Trash2 className="w-5 h-5" />
      </button>
    </div>
  )
}

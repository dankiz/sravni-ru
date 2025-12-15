'use client'

import { useState } from 'react'
import { GripVertical, Save } from 'lucide-react'
import toast from 'react-hot-toast'

interface Category {
  id: string
  name: string
  slug: string
  order: number
}

interface CategoryOrderManagerProps {
  initialCategories: Category[]
}

export default function CategoryOrderManager({ initialCategories }: CategoryOrderManagerProps) {
  const [categories, setCategories] = useState(initialCategories)
  const [isSaving, setIsSaving] = useState(false)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return

    const newCategories = [...categories]
    const [draggedItem] = newCategories.splice(draggedIndex, 1)
    newCategories.splice(index, 0, draggedItem)

    setCategories(newCategories)
    setDraggedIndex(index)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  const handleSaveOrder = async () => {
    setIsSaving(true)

    try {
      const categoryIds = categories.map((c: any) => c.id)

      const response = await fetch('/api/admin/categories/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryIds }),
      })

      if (response.ok) {
        toast.success('Порядок категорий сохранен')
      } else {
        toast.error('Не удалось сохранить порядок категорий')
      }
    } catch (error) {
      console.error('Error saving category order:', error)
      toast.error('Ошибка при сохранении')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-gray-400">
          Перетаскивайте категории, чтобы изменить их порядок на сайте
        </div>
        <button
          onClick={handleSaveOrder}
          disabled={isSaving}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" />
          {isSaving ? 'Сохранение...' : 'Сохранить порядок'}
        </button>
      </div>

      <div className="space-y-2">
        {categories.map((category: any, index: number) => (
          <div
            key={category.id}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            className={`bg-gray-800 border border-gray-700 rounded-lg p-4 cursor-move hover:border-primary-500/50 transition ${
              draggedIndex === index ? 'opacity-50' : ''
            }`}
          >
            <div className="flex items-center gap-3">
              <GripVertical className="w-5 h-5 text-gray-500" />
              <div className="flex-1">
                <div className="font-medium text-gray-100">{category.name}</div>
                <div className="text-sm text-gray-400">/{category.slug}</div>
              </div>
              <div className="text-sm text-gray-500">Порядок: {index + 1}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

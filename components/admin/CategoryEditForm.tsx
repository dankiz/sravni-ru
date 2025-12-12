'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
}

interface CategoryEditFormProps {
  category?: Category | null
}

export default function CategoryEditForm({ category }: CategoryEditFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const isEdit = !!category

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    defaultValues: {
      name: category?.name || '',
      description: category?.description || '',
    },
  })

  const nameValue = watch('name')

  useEffect(() => {
    if (category) {
      setValue('name', category.name)
      setValue('description', category.description || '')
    }
  }, [category, setValue])

  const onSubmit = async (data: any) => {
    setIsLoading(true)

    try {
      const url = isEdit 
        ? `/api/admin/categories/${category.id}`
        : '/api/admin/categories'
      const method = isEdit ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        toast.success(isEdit ? 'Категория обновлена' : 'Категория создана')
        router.push('/admin/categories')
      } else {
        const error = await response.json()
        toast.error(error.message || 'Ошибка')
      }
    } catch (error) {
      toast.error('Ошибка')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-8 border border-gray-700">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Название категории *
          </label>
          <input
            type="text"
            {...register('name', { required: 'Обязательное поле' })}
            className="w-full px-3 py-2 bg-gray-700 text-gray-100 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Например: Программирование"
          />
          {errors.name && (
            <p className="text-red-400 text-sm mt-1">{errors.name.message as string}</p>
          )}
          {nameValue && (
            <p className="text-xs text-gray-400 mt-1">
              Slug: {nameValue.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-а-яё]+/g, '')}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Описание
          </label>
          <textarea
            {...register('description')}
            rows={4}
            className="w-full px-3 py-2 bg-gray-700 text-gray-100 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Краткое описание категории..."
          />
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isLoading}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
          >
            {isLoading ? 'Сохранение...' : isEdit ? 'Сохранить' : 'Создать'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="bg-gray-700 text-gray-300 px-6 py-2 rounded-lg hover:bg-gray-600 transition"
          >
            Отмена
          </button>
        </div>
      </form>
    </div>
  )
}






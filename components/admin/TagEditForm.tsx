'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

interface Tag {
  id: string
  name: string
  slug: string
  description: string | null
  color: string | null
}

interface TagEditFormProps {
  tag?: Tag | null
}

export default function TagEditForm({ tag }: TagEditFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const isEdit = !!tag

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    defaultValues: {
      name: tag?.name || '',
      description: tag?.description || '',
      color: tag?.color || '#6366f1',
    },
  })

  const nameValue = watch('name')

  useEffect(() => {
    if (tag) {
      setValue('name', tag.name)
      setValue('description', tag.description || '')
      setValue('color', tag.color || '#6366f1')
    }
  }, [tag, setValue])

  const onSubmit = async (data: any) => {
    setIsLoading(true)

    try {
      const url = isEdit
        ? `/api/admin/tags/${tag.id}`
        : '/api/admin/tags'
      const method = isEdit ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        toast.success(isEdit ? 'Тег обновлен' : 'Тег создан')
        router.push('/admin/tags')
        router.refresh()
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
            Название тега *
          </label>
          <input
            type="text"
            {...register('name', { required: 'Обязательное поле' })}
            className="w-full px-3 py-2 bg-gray-700 text-gray-100 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Например: ЕГЭ, Маркетинг, Программирование"
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
            rows={3}
            className="w-full px-3 py-2 bg-gray-700 text-gray-100 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Краткое описание тега..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Цвет тега
          </label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              {...register('color')}
              className="w-16 h-10 bg-gray-700 border border-gray-600 rounded cursor-pointer"
            />
            <input
              type="text"
              {...register('color')}
              className="flex-1 px-3 py-2 bg-gray-700 text-gray-100 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="#6366f1"
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Цвет используется для отображения тега на сайте
          </p>
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
            className="bg-gray-700 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition"
          >
            Отмена
          </button>
        </div>
      </form>
    </div>
  )
}

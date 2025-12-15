'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

interface Course {
  id: string
  title: string
  slug: string
  description: string | null
  link: string
  image: string | null
  price: number | null
  pricePerLesson?: number | null
  pricePerMonth?: number | null
  priceOneTime?: number | null
  priceType?: string | null
  duration?: string | null
  contacts: string | null
  pros: string | null
  cons: string | null
  authorId: string
  categoryId: string | null
  status: string
  tags?: Array<{ tag: { id: string; name: string } }>
}

interface Category {
  id: string
  name: string
  slug: string
}

interface Author {
  id: string
  name: string
  slug: string
}

interface Tag {
  id: string
  name: string
  slug: string
  color: string | null
}

export default function CourseEditForm({
  course,
  categories,
  authors,
  tags,
  isNew = false,
}: {
  course: Course
  categories: Category[]
  authors: Author[]
  tags: Tag[]
  isNew?: boolean
}) {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>(
    course.tags?.map(t => t.tag.id) || []
  )
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    defaultValues: {
      title: course.title,
      description: course.description || '',
      link: course.link,
      imageFile: undefined,
      price: course.price?.toString() || '',
      pricePerLesson: course.pricePerLesson?.toString() || '',
      pricePerMonth: course.pricePerMonth?.toString() || '',
      priceOneTime: course.priceOneTime?.toString() || '',
      priceType: course.priceType || '',
      duration: course.duration || '',
      contacts: course.contacts || '',
      pros: course.pros || '',
      cons: course.cons || '',
      authorId: course.authorId,
      categoryId: course.categoryId || '',
      status: course.status,
    },
  })

  useEffect(() => {
    setValue('title', course.title)
    setValue('description', course.description || '')
    setValue('link', course.link)
    setValue('price', course.price?.toString() || '')
    setValue('pricePerLesson', course.pricePerLesson?.toString() || '')
    setValue('pricePerMonth', course.pricePerMonth?.toString() || '')
    setValue('priceOneTime', course.priceOneTime?.toString() || '')
    setValue('priceType', course.priceType || '')
    setValue('duration', course.duration || '')
    setValue('contacts', course.contacts || '')
    setValue('pros', course.pros || '')
    setValue('cons', course.cons || '')
    setValue('authorId', course.authorId)
    setValue('categoryId', course.categoryId || '')
    setValue('status', course.status)
    setSelectedTags(course.tags?.map(t => t.tag.id) || [])
  }, [course, setValue])

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev =>
      prev.includes(tagId)
        ? prev.filter((id: any) => id !== tagId)
        : [...prev, tagId]
    )
  }

  const onSubmit = async (data: any) => {
    if (authors.length === 0) {
      toast.error('Сначала создайте хотя бы одного автора')
      return
    }

    if (!data.authorId) {
      toast.error('Выберите автора')
      return
    }

    setIsLoading(true)

    try {
      const url = isNew
        ? '/api/admin/courses'
        : `/api/admin/courses/${course.id}`
      const method = isNew ? 'POST' : 'PUT'

      // Create FormData for file upload
      const formData = new FormData()
      formData.append('title', data.title)
      formData.append('description', data.description || '')
      formData.append('link', data.link)
      formData.append('price', data.price ? data.price.toString() : '')
      formData.append('pricePerLesson', data.pricePerLesson ? data.pricePerLesson.toString() : '')
      formData.append('pricePerMonth', data.pricePerMonth ? data.pricePerMonth.toString() : '')
      formData.append('priceOneTime', data.priceOneTime ? data.priceOneTime.toString() : '')
      formData.append('priceType', data.priceType || '')
      formData.append('duration', data.duration || '')
      formData.append('contacts', data.contacts || '')
      formData.append('pros', data.pros || '')
      formData.append('cons', data.cons || '')
      formData.append('authorId', data.authorId)
      formData.append('categoryId', data.categoryId || '')
      formData.append('status', data.status)
      formData.append('tagIds', JSON.stringify(selectedTags))
      
      // Add image file if selected
      const imageFile = data.imageFile?.[0]
      if (imageFile) {
        formData.append('image', imageFile)
      }

      const response = await fetch(url, {
        method,
        body: formData,
      })

      if (response.ok) {
        toast.success(isNew ? 'Курс создан' : 'Курс обновлен')
        router.push('/admin/courses')
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
    <div className="bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-700">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Название курса *
          </label>
          <input
            type="text"
            {...register('title', { required: 'Обязательное поле' })}
            className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder-gray-400"
            placeholder="Например: Менеджер маркетплейсов"
          />
          {errors.title && (
            <p className="text-red-400 text-sm mt-1">{errors.title.message as string}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Ссылка на курс *
          </label>
          <input
            type="url"
            {...register('link', { required: 'Обязательное поле' })}
            className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder-gray-400"
            placeholder="https://skysmart.ru/courses/..."
          />
          <p className="text-xs text-gray-400 mt-1">
            Полная ссылка на страницу курса на сайте школы
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Изображение курса
          </label>
          <input
            type="file"
            accept="image/*"
            {...register('imageFile')}
            className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder-gray-400"
          />
          {course.image && (
            <div className="mt-2">
              <p className="text-xs text-gray-400 mb-1">Текущее изображение:</p>
              <img
                src={course.image}
                alt="Preview"
                className="max-w-xs h-32 object-cover rounded-lg border border-gray-600"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
            </div>
          )}
          <p className="text-xs text-gray-400 mt-1">
            Загрузите изображение или оставьте пустым, чтобы сохранить текущее
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Школа/Автор *
            </label>
            <select
              {...register('authorId', { required: 'Обязательное поле' })}
              className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {authors.length > 0 ? (
                authors.map((author: any) => (
                  <option key={author.id} value={author.id}>
                    {author.name}
                  </option>
                ))
              ) : (
                <option value="">Нет авторов. Создайте автора сначала.</option>
              )}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Категория *
            </label>
            <select
              {...register('categoryId')}
              className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Без категории</option>
              {categories.map((cat: any) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-400 mt-1">
              Категория из столбца &quot;тег1&quot; в CSV
            </p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Теги курса
          </label>
          {tags.length === 0 ? (
            <p className="text-gray-400 text-sm">
              Нет тегов.{' '}
              <a href="/admin/tags/new" className="text-primary-400 hover:text-primary-300">
                Создайте первый тег
              </a>
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag: any) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                    selectedTags.includes(tag.id)
                      ? 'bg-primary-600 text-white border-2 border-primary-400'
                      : 'bg-gray-700 text-gray-300 border-2 border-gray-600 hover:border-gray-500'
                  }`}
                  style={
                    selectedTags.includes(tag.id) && tag.color
                      ? { backgroundColor: tag.color, borderColor: tag.color }
                      : {}
                  }
                >
                  {tag.name}
                </button>
              ))}
            </div>
          )}
          <p className="text-xs text-gray-400 mt-2">
            Теги используются для категоризации курсов (ЕГЭ, ОГЭ, Маркетинг и т.д.)
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Тип цены
          </label>
          <select
            {...register('priceType')}
            className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 mb-4"
          >
            <option value="">Не указан</option>
            <option value="PER_LESSON">За урок</option>
            <option value="PER_MONTH">За месяц</option>
            <option value="ONE_TIME">За курс (разово)</option>
          </select>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Цена за урок (₽)
            </label>
            <input
              type="number"
              step="0.01"
              {...register('pricePerLesson')}
              className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder-gray-400"
              placeholder="890"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Цена в месяц (₽)
            </label>
            <input
              type="number"
              step="0.01"
              {...register('pricePerMonth')}
              className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder-gray-400"
              placeholder="5999"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Цена за курс (₽)
            </label>
            <input
              type="number"
              step="0.01"
              {...register('priceOneTime')}
              className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder-gray-400"
              placeholder="89990"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Длительность
          </label>
          <input
            type="text"
            {...register('duration')}
            className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder-gray-400"
            placeholder="6 МЕС"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Старая цена (₽) - устарело
          </label>
          <input
            type="number"
            step="0.01"
            {...register('price')}
            className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder-gray-400"
          />
          <p className="text-xs text-gray-400 mt-1">
            Используйте поля &quot;Цена в месяц&quot; и &quot;Цена за раз&quot; вместо этого
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Описание
          </label>
          <textarea
            {...register('description')}
            rows={6}
            className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder-gray-400"
            placeholder="Полное описание курса..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Контакты
          </label>
          <textarea
            {...register('contacts')}
            rows={3}
            className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder-gray-400"
            placeholder="Контактная информация..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Плюсы
            </label>
            <textarea
              {...register('pros')}
              rows={3}
              className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Преимущества курса..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Минусы
            </label>
            <textarea
              {...register('cons')}
              rows={3}
              className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Недостатки курса..."
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Статус
          </label>
          <select
            {...register('status')}
            className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder-gray-400"
          >
            <option value="PENDING">На модерации</option>
            <option value="APPROVED">Опубликован</option>
            <option value="REJECTED">Отклонен</option>
          </select>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isLoading}
            className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-2 rounded-lg hover:from-primary-500 hover:to-primary-600 transition disabled:opacity-50 shadow-lg"
          >
            {isLoading ? 'Сохранение...' : isNew ? 'Создать' : 'Сохранить'}
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

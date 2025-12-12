'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

const courseSchema = z.object({
  submittedByName: z.string().min(2, 'Имя должно содержать минимум 2 символа'),
  submittedByEmail: z.string().email('Некорректный email'),
  title: z.string().min(5, 'Название должно содержать минимум 5 символов'),
  authorId: z.string().min(1, 'Необходимо выбрать школу'),
  link: z.string().url('Некорректная ссылка'),
  description: z.string().min(20, 'Описание должно содержать минимум 20 символов').optional().or(z.literal('')),
  contacts: z.string().optional().or(z.literal('')),
  pros: z.string().optional().or(z.literal('')),
  cons: z.string().optional().or(z.literal('')),
  price: z.string().optional().or(z.literal('')),
  image: z.any().optional(),
  categoryId: z.string().optional().or(z.literal('')),
})

type CourseFormData = z.infer<typeof courseSchema>

export default function AddCoursePage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [categories, setCategories] = useState<{id: string, name: string, slug: string}[]>([])
  const [authors, setAuthors] = useState<{id: string, name: string, slug: string}[]>([])
  const router = useRouter()

  useEffect(() => {
    // Load categories
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data.categories || []))
      .catch(() => {})

    // Load authors
    fetch('/api/authors')
      .then(res => res.json())
      .then(data => setAuthors(data.authors || []))
      .catch(() => {})
  }, [])

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
  })

  const onSubmit = async (data: CourseFormData) => {
    setIsSubmitting(true)

    try {
      const formData = new FormData()
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (key === 'image' && value instanceof FileList && value.length > 0) {
            formData.append(key, value[0])
          } else if (key !== 'image') {
            formData.append(key, value as string)
          }
        }
      })

      const response = await fetch('/api/courses/submit', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        toast.success('Спасибо! Ваш курс отправлен на модерацию и появится на сайте после проверки.')
        reset()
        router.push('/courses')
      } else {
        const error = await response.json()
        console.error('Error response:', error)
        toast.error(error.message || 'Ошибка при отправке курса')
      }
    } catch (error) {
      console.error('Error submitting course:', error)
      toast.error('Ошибка при отправке курса. Проверьте консоль браузера для деталей.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-gray-900 min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Кнопка добавления организации */}
        <div className="bg-gradient-to-r from-primary-600/20 to-primary-700/20 rounded-xl p-6 mb-8 border border-primary-500/30">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white mb-2">
                Вашей организации нет в списке?
              </h2>
              <p className="text-gray-300 text-sm">
                Сначала добавьте организацию, а затем создайте курс
              </p>
            </div>
            <a
              href="/admin/authors/new"
              className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-8 py-4 rounded-lg font-semibold hover:from-primary-500 hover:to-primary-600 transition shadow-lg shadow-primary-500/20 text-center whitespace-nowrap"
            >
              Добавить организацию
            </a>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-700">
          <h1 className="text-4xl font-bold text-white mb-2">
            Добавить курс
          </h1>
          <p className="text-gray-400 mb-8">
            Заполните форму ниже, и ваш курс будет отправлен на модерацию. После проверки администратором курс появится в каталоге.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Contact Info */}
            <div className="border-b border-gray-700 pb-6">
              <h2 className="text-xl font-semibold text-white mb-4">
                Ваши контакты (для обратной связи, не публикуются)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Ваше имя *
                  </label>
                  <input
                    type="text"
                    {...register('submittedByName')}
                    className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder-gray-400"
                    placeholder="Иван Иванов"
                  />
                  {errors.submittedByName && (
                    <p className="text-red-400 text-sm mt-1">{errors.submittedByName.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Ваш Email *
                  </label>
                  <input
                    type="email"
                    {...register('submittedByEmail')}
                    className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder-gray-400"
                    placeholder="ivan@example.com"
                  />
                  {errors.submittedByEmail && (
                    <p className="text-red-400 text-sm mt-1">{errors.submittedByEmail.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Course Info */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">
                Информация о курсе
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Название курса *
                </label>
                <input
                  type="text"
                  {...register('title')}
                  className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder-gray-400"
                  placeholder="Название курса"
                />
                {errors.title && (
                  <p className="text-red-400 text-sm mt-1">{errors.title.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Школа/Организация *
                </label>
                <select
                  {...register('authorId')}
                  className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Выберите школу</option>
                  {authors.map((author) => (
                    <option key={author.id} value={author.id}>
                      {author.name}
                    </option>
                  ))}
                </select>
                {errors.authorId && (
                  <p className="text-red-400 text-sm mt-1">{errors.authorId.message}</p>
                )}
                <p className="text-xs text-gray-400 mt-1">
                  Если вашей школы нет в списке, обратитесь к администратору для её добавления
                </p>
              </div>

              <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                  Ссылка на курс *
                </label>
                <input
                  type="url"
                  {...register('link')}
                    className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder-gray-400"
                  placeholder="https://example.com/course"
                />
                {errors.link && (
                  <p className="text-red-400 text-sm mt-1">{errors.link.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Категория
                  </label>
                  <select
                    {...register('categoryId')}
                    className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Без категории</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Цена (₽)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...register('price')}
                    className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder-gray-400"
                    placeholder="0 или оставьте пустым для бесплатного"
                  />
                </div>
              </div>

              <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                  Изображение курса
                </label>
                <input
                  type="file"
                  accept="image/*"
                  {...register('image')}
                    className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder-gray-400"
                />
                <p className="text-sm text-gray-400 mt-1">
                  Рекомендуемый размер: 1200x630px
                </p>
              </div>

              <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                  Описание *
                </label>
                <textarea
                  {...register('description')}
                  rows={6}
                    className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder-gray-400"
                  placeholder="Подробное описание курса..."
                />
                {errors.description && (
                  <p className="text-red-400 text-sm mt-1">{errors.description.message}</p>
                )}
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

              <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                  Плюсы
                </label>
                <textarea
                  {...register('pros')}
                  rows={3}
                    className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder-gray-400"
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
                    className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder-gray-400"
                  placeholder="Недостатки курса..."
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-3 rounded-lg font-semibold hover:from-primary-500 hover:to-primary-600 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {isSubmitting ? 'Отправка...' : 'Отправить на модерацию'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

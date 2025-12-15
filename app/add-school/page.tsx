'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

const schoolSchema = z.object({
  submittedByName: z.string().min(2, 'Имя должно содержать минимум 2 символа'),
  submittedByEmail: z.string().email('Некорректный email'),
  name: z.string().min(2, 'Название школы должно содержать минимум 2 символа'),
  bio: z.string().min(50, 'Описание должно содержать минимум 50 символов').optional().or(z.literal('')),
  website: z.string().url('Некорректная ссылка на сайт').optional().or(z.literal('')),
  email: z.string().email('Некорректный email').optional().or(z.literal('')),
  contacts: z.string().optional().or(z.literal('')),
  logo: z.any().optional(),
})

type SchoolFormData = z.infer<typeof schoolSchema>

export default function AddSchoolPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SchoolFormData>({
    resolver: zodResolver(schoolSchema),
  })

  const onSubmit = async (data: SchoolFormData) => {
    setIsSubmitting(true)

    try {
      const formData = new FormData()
      Object.entries(data).forEach(([key, value]: [string, any]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (key === 'logo' && value instanceof FileList && value.length > 0) {
            formData.append(key, value[0])
          } else if (key !== 'logo') {
            formData.append(key, value as string)
          }
        }
      })

      const response = await fetch('/api/schools/submit', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const result = await response.json()
        toast.success('Спасибо! Школа отправлена на модерацию и появится на сайте после проверки.')
        reset()

        // Redirect to schools page or home
        router.push('/')
      } else {
        const error = await response.json()
        console.error('Error response:', error)
        toast.error(error.message || 'Ошибка при отправке школы')
      }
    } catch (error) {
      console.error('Error submitting school:', error)
      toast.error('Ошибка при отправке школы. Проверьте консоль браузера для деталей.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-gray-900 min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-700">
          <h1 className="text-4xl font-bold text-white mb-2">
            Добавить школу
          </h1>
          <p className="text-gray-400 mb-8">
            Заполните форму ниже, и школа будет отправлена на модерацию. После проверки администратором она появится в каталоге.
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

            {/* School Info */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">
                Информация о школе
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Название школы *
                </label>
                <input
                  type="text"
                  {...register('name')}
                  className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder-gray-400"
                  placeholder="Название школы"
                />
                {errors.name && (
                  <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Сайт школы
                  </label>
                  <input
                    type="url"
                    {...register('website')}
                    className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder-gray-400"
                    placeholder="https://example.com"
                  />
                  {errors.website && (
                    <p className="text-red-400 text-sm mt-1">{errors.website.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Email школы
                  </label>
                  <input
                    type="email"
                    {...register('email')}
                    className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder-gray-400"
                    placeholder="info@school.com"
                  />
                  {errors.email && (
                    <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Логотип школы
                </label>
                <input
                  type="file"
                  accept="image/*"
                  {...register('logo')}
                  className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder-gray-400"
                />
                <p className="text-sm text-gray-400 mt-1">
                  Рекомендуемый размер: 400x400px (квадратный)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Описание школы
                </label>
                <textarea
                  {...register('bio')}
                  rows={6}
                  className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder-gray-400"
                  placeholder="Подробное описание школы, её преимущества, история..."
                />
                {errors.bio && (
                  <p className="text-red-400 text-sm mt-1">{errors.bio.message}</p>
                )}
                <p className="text-sm text-gray-400 mt-1">
                  Минимум 50 символов
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Контакты и юридическая информация
                </label>
                <textarea
                  {...register('contacts')}
                  rows={5}
                  className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder-gray-400"
                  placeholder="Телефон: 8 (800) 123-45-67&#10;Юридическое название&#10;ИНН: 1234567890&#10;ОГРН: 1234567890123&#10;Адрес: г. Москва, ул. Примерная, д. 1"
                />
                <p className="text-sm text-gray-400 mt-1">
                  Укажите телефон, юридическое название, ИНН, ОГРН, адрес
                </p>
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

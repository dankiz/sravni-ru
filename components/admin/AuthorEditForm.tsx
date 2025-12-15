'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

interface Author {
  id: string
  name: string
  slug: string
  bio: string | null
  logo: string | null
  contacts: string | null
  website: string | null
  email: string | null
  legalInfo: string | null
}

interface AuthorEditFormProps {
  author?: Author | null
}

export default function AuthorEditForm({ author }: AuthorEditFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const isEdit = !!author

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<{
    name: string
    bio: string
    contacts: string
    website: string
    email: string
    legalInfo: string
    logoFile?: FileList
  }>({
    defaultValues: {
      name: author?.name || '',
      bio: author?.bio || '',
      contacts: author?.contacts || '',
      website: author?.website || '',
      email: author?.email || '',
      legalInfo: author?.legalInfo || '',
    },
  })

  useEffect(() => {
    if (author) {
      setValue('name', author.name)
      setValue('bio', author.bio || '')
      setValue('contacts', author.contacts || '')
      setValue('website', author.website || '')
      setValue('email', author.email || '')
      setValue('legalInfo', author.legalInfo || '')
    }
  }, [author, setValue])

  const onSubmit = async (data: any) => {
    setIsLoading(true)

    try {
      const url = isEdit 
        ? `/api/admin/authors/${author.id}`
        : '/api/admin/authors'
      const method = isEdit ? 'PUT' : 'POST'

      // Create FormData for file upload
      const formData = new FormData()
      formData.append('name', data.name)
      formData.append('bio', data.bio || '')
      formData.append('contacts', data.contacts || '')
      formData.append('website', data.website || '')
      formData.append('email', data.email || '')
      formData.append('legalInfo', data.legalInfo || '')

      // Add logo file if selected
      const logoFile = data.logoFile?.[0]
      if (logoFile) {
        formData.append('logo', logoFile)
      }

      const response = await fetch(url, {
        method,
        body: formData, // Send FormData instead of JSON
      })

      if (response.ok) {
        toast.success(isEdit ? 'Организация обновлена' : 'Организация создана')
        router.push('/admin/authors')
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
            Название организации *
          </label>
          <input
            type="text"
            {...register('name', { required: 'Обязательное поле' })}
            className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder-gray-400"
            placeholder="Например: Skyeng"
          />
          {errors.name && (
            <p className="text-red-400 text-sm mt-1">{errors.name.message as string}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Логотип организации
          </label>
          <input
            type="file"
            accept="image/*"
            {...register('logoFile')}
            className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder-gray-400"
          />
          {author?.logo && (
            <div className="mt-2">
              <p className="text-xs text-gray-400 mb-1">Текущий логотип:</p>
              <img
                src={author.logo}
                alt="Logo preview"
                className="max-w-xs h-32 object-contain rounded-lg border border-gray-600 bg-white p-2"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
            </div>
          )}
          <p className="text-xs text-gray-400 mt-1">
            Загрузите логотип организации (рекомендуемый размер: 200x200px)
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Email
          </label>
          <input
            type="email"
            {...register('email')}
            className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder-gray-400"
            placeholder="info@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Сайт
          </label>
          <input
            type="url"
            {...register('website')}
            className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder-gray-400"
            placeholder="https://example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Описание организации
          </label>
          <textarea
            {...register('bio')}
            rows={8}
            className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder-gray-400"
            placeholder="Подробное описание организации, её истории, особенностей и преимуществ..."
          />
          <p className="text-xs text-gray-400 mt-1">
            Это описание будет отображаться на странице организации
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Контакты
          </label>
          <textarea
            {...register('contacts')}
            rows={3}
            className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder-gray-400"
            placeholder="Телефон, адрес, другие способы связи..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Юридическая информация
          </label>
          <textarea
            {...register('legalInfo')}
            rows={6}
            className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder-gray-400"
            placeholder="ООО &quot;Название&quot;&#10;ИНН: 1234567890&#10;ОГРН: 1234567890123&#10;Юридический адрес: г. Москва, ул. Примерная, д. 1"
          />
          <p className="text-xs text-gray-400 mt-1">
            Юридическое название, ИНН, ОГРН, адрес и другая юридическая информация
          </p>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isLoading}
            className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-2 rounded-lg hover:from-primary-500 hover:to-primary-600 transition disabled:opacity-50 shadow-lg"
          >
            {isLoading ? 'Сохранение...' : isEdit ? 'Сохранить' : 'Создать организацию'}
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

'use client'

import { Star } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'
import { getRedirectUrl } from '@/lib/utils'

interface SchoolCourseCardProps {
  course: {
    id: string
    title: string
    slug: string
    link: string
    image?: string | null
    pricePerLesson?: number | null
    pricePerMonth?: number | null
    priceOneTime?: number | null
    priceType?: string | null
    duration?: string | null
    averageRating?: number | null
    reviewCount?: number | null
    author?: {
      slug: string
      name: string
    }
    tags?: Array<{
      tag: {
        id: string
        name: string
        color?: string | null
      }
    }>
  }
}

export default function SchoolCourseCard({ course }: SchoolCourseCardProps) {
  const rating = course.averageRating || 0
  const reviewCount = course.reviewCount || 0
  const hasDiscount = course.pricePerMonth && course.priceOneTime
  const isSkysmart = course.author?.slug === 'skysmart'
  const [imageError, setImageError] = useState(false)

  // Нормализуем путь к изображению
  const getImageSrc = () => {
    if (!course.image) return null
    
    const image = course.image.trim()
    
    // Если путь начинается с /, это локальный путь
    if (image.startsWith('/')) {
      return image
    }
    
    // Если это полный URL, возвращаем как есть
    if (image.startsWith('http://') || image.startsWith('https://')) {
      return image
    }
    
    // Если путь не начинается с /, но содержит uploads, добавляем /
    if (image.includes('uploads/')) {
      return image.startsWith('/') ? image : `/${image}`
    }
    
    // Для остальных случаев добавляем /
    return `/${image}`
  }

  const imageSrc = getImageSrc()

  // Генерируем URL редиректа
  const redirectUrl = getRedirectUrl(course.link, {
    schoolName: course.author?.name,
    courseTitle: course.title,
    path: `/school/${course.author?.slug}/${course.slug}`,
    keyword: 'school',
    position: '1',
  })

  return (
    <div className={`bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-700 hover:border-primary-500/30 relative group ${isSkysmart ? 'ring-2 ring-green-500/50 shadow-green-500/30 shadow-[0_0_20px_rgba(34,197,94,0.3)]' : ''}`}>
      {/* Картинка курса */}
      {imageSrc && !imageError && (
        <div className="relative w-full h-48 bg-gradient-to-br from-gray-700 to-gray-800">
          <Image
            src={imageSrc}
            alt={course.title}
            fill
            loading="lazy"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              console.error('Image load error:', imageSrc, 'for course:', course.title)
              setImageError(true)
            }}
            unoptimized={imageSrc.startsWith('http://') || imageSrc.startsWith('https://')}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/20 to-transparent" />

          {/* Значки */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {hasDiscount && (
              <div className="bg-gradient-to-r from-green-500 to-green-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                ГОРЯЧЕЕ ПРЕДЛОЖЕНИЕ
              </div>
            )}
          </div>
          
          {/* Ленточка "Лучший выбор" для Skysmart */}
          {isSkysmart && (
            <div className="absolute top-3 right-3 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg z-10">
              ЛУЧШИЙ ВЫБОР
            </div>
          )}
        </div>
      )}

      {/* Контент */}
      <div className="p-5">
        {/* Рейтинг и отзывы */}
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center gap-1.5 bg-yellow-500/20 px-2.5 py-1 rounded-lg">
            <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
            <span className="text-sm font-bold text-yellow-500">{rating.toFixed(1)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-400 text-sm">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
              />
            </svg>
            <span>{reviewCount}</span>
          </div>
          {course.duration && (
            <div className="flex items-center gap-1.5 text-gray-400 text-sm ml-auto">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="font-semibold text-white">{course.duration}</span>
            </div>
          )}
        </div>

        {/* Название */}
        <h3 className="text-lg font-bold text-white mb-3 line-clamp-2 group-hover:text-primary-400 transition">
          {course.title}
        </h3>

        {/* Теги */}
        {course.tags && course.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {course.tags.slice(0, 3).map(({ tag }) => (
              <span
                key={tag.id}
                className="px-2.5 py-1 text-xs font-medium rounded-md bg-gray-700 text-gray-300 border border-gray-600"
                style={
                  tag.color
                    ? {
                        backgroundColor: `${tag.color}20`,
                        borderColor: `${tag.color}40`,
                        color: tag.color,
                      }
                    : {}
                }
              >
                {tag.name}
              </span>
            ))}
          </div>
        )}

        {/* Цена с периодом */}
        <div className="border-t border-gray-700 pt-4 mt-auto">
          {course.pricePerMonth && course.priceOneTime ? (
            <div className="space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="text-gray-400 text-sm">от</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold text-white">
                    {Math.floor(course.pricePerMonth).toLocaleString('ru-RU')} ₽
                  </span>
                  <span className="text-gray-400 text-sm font-medium">/мес</span>
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-gray-400 text-sm">или сразу</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-lg font-semibold text-gray-300">
                    {Math.floor(course.priceOneTime).toLocaleString('ru-RU')} ₽
                  </span>
                  <span className="text-gray-400 text-sm font-medium">за курс</span>
                </div>
              </div>
            </div>
          ) : course.pricePerMonth ? (
            <div className="flex items-baseline justify-between">
              <span className="text-gray-400 text-sm">от</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold text-white">
                  {Math.floor(course.pricePerMonth).toLocaleString('ru-RU')} ₽
                </span>
                <span className="text-gray-400 text-sm font-medium">/мес</span>
              </div>
            </div>
          ) : course.priceOneTime ? (
            <div className="text-right">
              <div className="flex items-baseline gap-1.5 justify-end">
                <span className="text-2xl font-bold text-white">
                  {Math.floor(course.priceOneTime).toLocaleString('ru-RU')} ₽
                </span>
                <span className="text-gray-400 text-sm font-medium">за курс</span>
              </div>
            </div>
          ) : course.pricePerLesson ? (
            <div className="text-right">
              <div className="flex items-baseline gap-1.5 justify-end">
                <span className="text-2xl font-bold text-white">
                  {Math.floor(course.pricePerLesson).toLocaleString('ru-RU')} ₽
                </span>
                <span className="text-gray-400 text-sm font-medium">/урок</span>
              </div>
            </div>
          ) : (
            <div className="text-right">
              <span className="text-gray-400 text-sm">Цена не указана</span>
            </div>
          )}
        </div>

        {/* Кнопка */}
        <a
          href={redirectUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 block w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white text-center py-3 rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl"
        >
          Далее
        </a>
      </div>
    </div>
  )
}

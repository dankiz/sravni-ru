'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Star } from 'lucide-react'
import { formatPrice, getRedirectUrl } from '@/lib/utils'
import { useState } from 'react'

interface CourseCardProps {
  course: {
    id: string
    title: string
    slug: string
    link: string
    image?: string | null
    averageRating?: number | null
    reviewCount?: number | null
    price?: number | null
    pricePerLesson?: number | null
    pricePerMonth?: number | null
    priceOneTime?: number | null
    priceType?: string | null
    description?: string | null
    author: {
      name: string
      slug: string
    }
    category?: {
      name: string
      slug: string
    } | null
    tags?: {
      tag: {
        id: string
        name: string
        slug: string
        color?: string | null
      }
    }[]
  }
}

export default function CourseCard({ course }: CourseCardProps) {
  const rating = course.averageRating || 0
  const reviewCount = course.reviewCount || 0
  const isSkysmart = course.author.slug === 'skysmart'
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
    schoolName: course.author.name,
    courseTitle: course.title,
    category: course.category?.name,
    path: `/courses/${course.slug}`,
    keyword: 'catalog',
    position: '1',
  })

  return (
    <div className="block group relative">
      <div className={`bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl border border-gray-700 overflow-hidden h-full flex flex-col card-hover group-hover:border-primary-500/50 transition-all ${isSkysmart ? 'ring-2 ring-green-500/50 shadow-green-500/30 shadow-[0_0_20px_rgba(34,197,94,0.3)]' : ''}`}>
        {imageSrc && !imageError && (
          <div className="relative w-full h-48 bg-gray-700 overflow-hidden">
            <Image
              src={imageSrc}
              alt={course.title}
              fill
              loading="lazy"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                console.error('Image load error:', imageSrc, 'for course:', course.title)
                setImageError(true)
              }}
              unoptimized={imageSrc.startsWith('http://') || imageSrc.startsWith('https://')}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent" />
            
            {/* Ленточка "Лучший выбор" для Skysmart */}
            {isSkysmart && (
              <div className="absolute top-3 right-3 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg z-10">
                ЛУЧШИЙ ВЫБОР
              </div>
            )}
          </div>
        )}
        <div className="p-6 flex-grow flex flex-col">
          <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 group-hover:text-primary-400 transition">
            {course.title}
          </h3>
          <Link
            href={`/school/${course.author.slug}`}
            className="text-primary-400 hover:text-primary-300 text-sm mb-2 transition inline-block"
            onClick={(e) => e.stopPropagation()}
          >
            {course.author.name}
          </Link>
          {course.description && (
            <p className="text-gray-400 text-sm mb-4 line-clamp-3 flex-grow">
              {course.description}
            </p>
          )}

          {/* Tags */}
          {course.tags && course.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {course.tags.slice(0, 3).map((courseTag: any) => (
                <Link
                  key={courseTag.tag.id}
                  href={`/tag/${courseTag.tag.slug}`}
                  onClick={(e) => e.stopPropagation()}
                  className="px-2 py-1 text-xs rounded-md bg-gray-700 text-gray-300 hover:bg-primary-600 hover:text-white transition"
                  style={
                    courseTag.tag.color
                      ? { backgroundColor: `${courseTag.tag.color}20`, borderColor: courseTag.tag.color, borderWidth: '1px' }
                      : undefined
                  }
                >
                  {courseTag.tag.name}
                </Link>
              ))}
              {course.tags.length > 3 && (
                <span className="px-2 py-1 text-xs rounded-md bg-gray-700 text-gray-400">
                  +{course.tags.length - 3}
                </span>
              )}
            </div>
          )}

          <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-700 mb-4">
            <div className="flex items-center gap-1.5">
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold text-white">{rating.toFixed(1)}</span>
              <span className="text-gray-500 text-sm">({reviewCount})</span>
            </div>
            <div className="text-right">
              {course.pricePerMonth && course.priceOneTime ? (
                <div className="space-y-1">
                  <div className="flex items-baseline gap-1 justify-end">
                    <span className="text-lg font-bold text-white">
                      {Math.floor(course.pricePerMonth).toLocaleString('ru-RU')} ₽
                    </span>
                    <span className="text-gray-400 text-xs">/мес</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    или {Math.floor(course.priceOneTime).toLocaleString('ru-RU')} ₽ за курс
                  </div>
                </div>
              ) : course.pricePerMonth ? (
                <div className="flex items-baseline gap-1 justify-end">
                  <span className="text-lg font-bold text-white">
                    {Math.floor(course.pricePerMonth).toLocaleString('ru-RU')} ₽
                  </span>
                  <span className="text-gray-400 text-xs">/мес</span>
                </div>
              ) : course.priceOneTime ? (
                <div className="flex items-baseline gap-1 justify-end">
                  <span className="text-lg font-bold text-white">
                    {Math.floor(course.priceOneTime).toLocaleString('ru-RU')} ₽
                  </span>
                  <span className="text-gray-400 text-xs">за курс</span>
                </div>
              ) : course.pricePerLesson ? (
                <div className="flex items-baseline gap-1 justify-end">
                  <span className="text-lg font-bold text-white">
                    {Math.floor(course.pricePerLesson).toLocaleString('ru-RU')} ₽
                  </span>
                  <span className="text-gray-400 text-xs">/урок</span>
                </div>
              ) : course.price ? (
                <div className="text-lg font-bold bg-gradient-to-r from-primary-500 to-primary-600 bg-clip-text text-transparent">
                  {formatPrice(course.price)}
                </div>
              ) : (
                <div className="text-gray-400 text-sm">Цена не указана</div>
              )}
            </div>
          </div>

          <a
            href={redirectUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white text-center py-3 rounded-lg font-semibold hover:from-primary-500 hover:to-primary-600 transition shadow-lg hover:shadow-xl"
          >
            Перейти к курсу
          </a>
        </div>
      </div>
    </div>
  )
}

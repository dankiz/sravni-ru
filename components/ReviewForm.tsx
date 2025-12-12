'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import StarRating from './StarRating'
import toast from 'react-hot-toast'

const reviewSchema = z.object({
  authorName: z.string().min(2, 'Имя должно содержать минимум 2 символа'),
  authorEmail: z.string().email('Некорректный email').optional().or(z.literal('')),
  rating: z.number().min(1, 'Выберите оценку').max(5),
  text: z.string().min(10, 'Отзыв должен содержать минимум 10 символов'),
})

type ReviewFormData = z.infer<typeof reviewSchema>

interface ReviewFormProps {
  courseId: string
}

export default function ReviewForm({ courseId }: ReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 0,
    },
  })

  const onSubmit = async (data: ReviewFormData) => {
    if (rating === 0) {
      toast.error('Пожалуйста, выберите оценку')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          rating,
          courseId,
        }),
      })

      if (response.ok) {
        toast.success('Спасибо! Ваш отзыв отправлен на модерацию и появится на сайте после проверки.')
        reset()
        setRating(0)
      } else {
        const error = await response.json()
        toast.error(error.message || 'Ошибка при отправке отзыва')
      }
    } catch (error) {
      toast.error('Ошибка при отправке отзыва')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Ваше имя *
        </label>
        <input
          type="text"
          {...register('authorName')}
          className="w-full px-3 py-2 bg-gray-800 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder-gray-400"
          placeholder="Иван Иванов"
        />
        {errors.authorName && (
          <p className="text-red-400 text-sm mt-1">{errors.authorName.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Email (не публикуется)
        </label>
        <input
          type="email"
          {...register('authorEmail')}
          className="w-full px-3 py-2 bg-gray-800 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder-gray-400"
          placeholder="ivan@example.com"
        />
        {errors.authorEmail && (
          <p className="text-red-400 text-sm mt-1">{errors.authorEmail.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Оценка *
        </label>
        <StarRating rating={rating} onChange={setRating} />
        {rating === 0 && (
          <p className="text-red-400 text-sm mt-1">Выберите оценку</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Текст отзыва *
        </label>
        <textarea
          {...register('text')}
          rows={4}
          className="w-full px-3 py-2 bg-gray-800 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder-gray-400"
          placeholder="Поделитесь своим опытом..."
        />
        {errors.text && (
          <p className="text-red-400 text-sm mt-1">{errors.text.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-3 rounded-lg font-semibold hover:from-primary-500 hover:to-primary-600 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
      >
        {isSubmitting ? 'Отправка...' : 'Отправить отзыв'}
      </button>
    </form>
  )
}

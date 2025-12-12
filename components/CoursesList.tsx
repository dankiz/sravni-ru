'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import CourseCard from './CourseCard'

interface Course {
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
  tags?: {
    tag: {
      id: string
      name: string
      slug: string
      color?: string | null
    }
  }[]
}

interface CoursesListProps {
  initialCourses: Course[]
  initialTotal: number
  searchParams: {
    search?: string
    category?: string
    minPrice?: string
    maxPrice?: string
    minRating?: string
    sort?: string
  }
}

export default function CoursesList({ initialCourses, initialTotal, searchParams }: CoursesListProps) {
  const [courses, setCourses] = useState<Course[]>(initialCourses)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(initialCourses.length < initialTotal)
  const observerTarget = useRef<HTMLDivElement>(null)

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return

    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: (page + 1).toString(),
        limit: '30',
        ...(searchParams.search && { search: searchParams.search }),
        ...(searchParams.category && { category: searchParams.category }),
        ...(searchParams.minPrice && { minPrice: searchParams.minPrice }),
        ...(searchParams.maxPrice && { maxPrice: searchParams.maxPrice }),
        ...(searchParams.minRating && { minRating: searchParams.minRating }),
        ...(searchParams.sort && { sort: searchParams.sort }),
      })

      const response = await fetch(`/api/courses?${params.toString()}`)
      const data = await response.json()

      if (data.courses && data.courses.length > 0) {
        setCourses((prev) => [...prev, ...data.courses])
        setPage((prev) => prev + 1)
        setHasMore(data.pagination.hasMore)
      } else {
        setHasMore(false)
      }
    } catch (error) {
      console.error('Error loading more courses:', error)
      setHasMore(false)
    } finally {
      setLoading(false)
    }
  }, [page, loading, hasMore, searchParams])

  useEffect(() => {
    // Сбрасываем состояние при изменении фильтров
    setCourses(initialCourses)
    setPage(1)
    setHasMore(initialCourses.length < initialTotal)
  }, [initialCourses, initialTotal])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMore()
        }
      },
      { threshold: 0.1 }
    )

    const currentTarget = observerTarget.current
    if (currentTarget) {
      observer.observe(currentTarget)
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget)
      }
    }
  }, [loadMore, hasMore, loading])

  if (courses.length === 0) {
    return (
      <div className="bg-gray-800 p-12 rounded-xl shadow-lg text-center border border-gray-700">
        <p className="text-gray-400 text-lg mb-4">
          Курсы не найдены. Попробуйте изменить фильтры.
        </p>
        <a
          href="/courses"
          className="text-primary-400 hover:text-primary-300 font-semibold"
        >
          Сбросить фильтры
        </a>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {courses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>

      {/* Элемент для отслеживания прокрутки */}
      {hasMore && (
        <div ref={observerTarget} className="py-8">
          {loading && (
            <div className="flex justify-center items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            </div>
          )}
        </div>
      )}

      {!hasMore && courses.length > 0 && (
        <div className="py-8 text-center">
          <p className="text-gray-400">Все курсы загружены</p>
        </div>
      )}
    </>
  )
}




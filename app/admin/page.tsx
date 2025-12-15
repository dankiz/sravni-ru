import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-helpers'
import Link from 'next/link'
import { BookOpen, MessageSquare, CheckCircle, XCircle } from 'lucide-react'

async function getDashboardStats() {
  const [
    pendingCourses,
    approvedCourses,
    pendingReviews,
    totalAuthors,
  ] = await Promise.all([
    prisma.course.count({ where: { status: 'PENDING' } }).catch(() => 0),
    prisma.course.count({ where: { status: 'APPROVED' } }).catch(() => 0),
    prisma.review.count({ where: { status: 'PENDING' } }).catch(() => 0),
    prisma.author.count().catch(() => 0),
  ])

  return {
    pendingCourses,
    approvedCourses,
    pendingReviews,
    totalAuthors,
  }
}

export default async function AdminDashboard() {
  await requireAuth()
  const stats = await getDashboardStats()

  const statCards = [
    {
      title: 'Курсы на модерации',
      value: stats.pendingCourses,
      href: '/admin/courses/pending',
      icon: CheckCircle,
      color: 'bg-yellow-500',
    },
    {
      title: 'Одобренные курсы',
      value: stats.approvedCourses,
      href: '/admin/courses',
      icon: BookOpen,
      color: 'bg-green-500',
    },
    {
      title: 'Отзывы на модерации',
      value: stats.pendingReviews,
      href: '/admin/reviews',
      icon: MessageSquare,
      color: 'bg-yellow-500',
    },
    {
      title: 'Всего авторов',
      value: stats.totalAuthors,
      href: '/admin/authors',
      icon: BookOpen,
      color: 'bg-blue-500',
    },
  ]

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-8">Дашборд</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card: any) => {
          const Icon = card.icon
          return (
            <Link
              key={card.href}
              href={card.href}
              className="bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition border border-gray-700 hover:border-primary-500/50 card-hover"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">{card.title}</p>
                  <p className="text-3xl font-bold text-white">{card.value}</p>
                </div>
                <div className={`${card.color} p-3 rounded-lg shadow-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

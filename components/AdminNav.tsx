'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  LayoutDashboard,
  BookOpen,
  MessageSquare,
  User,
  Star,
  LogOut,
  CheckCircle,
  XCircle,
  FolderTree,
  Tag as TagIcon
} from 'lucide-react'

const navItems = [
  { href: '/admin', label: 'Дашборд', icon: LayoutDashboard },
  { href: '/admin/courses/pending', label: 'Курсы на модерации', icon: CheckCircle },
  { href: '/admin/courses', label: 'Все курсы', icon: BookOpen },
  { href: '/admin/categories', label: 'Категории', icon: FolderTree },
  { href: '/admin/tags', label: 'Теги', icon: TagIcon },
  { href: '/admin/reviews', label: 'Отзывы на модерации', icon: MessageSquare },
  { href: '/admin/authors', label: 'Авторы', icon: User },
  { href: '/admin/ratings', label: 'Управление оценками', icon: Star },
]

export default function AdminNav() {
  const pathname = usePathname()

  return (
    <nav className="bg-gray-800 shadow-lg border-b border-gray-700">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/admin" className="text-xl font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
              Админ-панель
            </Link>
            <div className="hidden md:flex items-center gap-4">
              {navItems.map((item: any) => {
                const Icon = item.icon
                const isActive = pathname === item.href || 
                  (item.href !== '/admin' && pathname?.startsWith(item.href))
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition ${
                      isActive
                        ? 'bg-primary-600/20 text-primary-400 border border-primary-500/30'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-gray-300 hover:text-primary-400 text-sm transition"
            >
              На сайт
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: '/admin/login' })}
              className="flex items-center gap-2 text-gray-300 hover:text-red-400 text-sm transition"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">Выйти</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

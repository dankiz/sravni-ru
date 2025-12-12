import Link from 'next/link'
import { Search, GraduationCap } from 'lucide-react'

export default function Header() {
  return (
    <header className="bg-gray-800 border-b border-gray-700 shadow-lg sticky top-0 z-50 backdrop-blur-sm bg-opacity-95">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-2xl font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent hover:from-primary-300 hover:to-primary-500 transition">
            <GraduationCap className="w-7 h-7 text-primary-500" />
            <span>Агрегатор Курсов</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/courses" className="text-gray-300 hover:text-primary-400 transition font-medium">
              Каталог курсов
            </Link>
            <Link href="/add-course" className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-5 py-2.5 rounded-lg hover:from-primary-500 hover:to-primary-600 transition shadow-lg shadow-primary-500/20 font-medium">
              Добавить курс
            </Link>
          </nav>

          <Link href="/courses" className="md:hidden p-2 hover:bg-gray-700 rounded-lg transition">
            <Search className="w-6 h-6 text-gray-300" />
          </Link>
        </div>
      </div>
    </header>
  )
}

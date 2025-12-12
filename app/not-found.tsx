import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="text-center">
        <h1 className="text-6xl font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-white mb-4">
          Страница не найдена
        </h2>
        <p className="text-gray-400 mb-8">
          Извините, запрашиваемая страница не существует.
        </p>
        <Link
          href="/"
          className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-3 rounded-lg font-semibold hover:from-primary-500 hover:to-primary-600 transition shadow-lg"
        >
          На главную
        </Link>
      </div>
    </div>
  )
}

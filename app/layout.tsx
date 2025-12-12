import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const inter = Inter({ subsets: ['cyrillic', 'latin'] })

export const metadata: Metadata = {
  title: 'Агрегатор онлайн-курсов - Каталог лучших образовательных программ',
  description: 'Найдите лучшие онлайн-курсы по различным направлениям. Отзывы, рейтинги, сравнение цен. Добавьте свой курс бесплатно.',
  keywords: 'онлайн курсы, обучение, образование, курсы онлайн, рейтинг курсов',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru" className="dark">
      <body className={`${inter.className} bg-gray-900 text-gray-100`}>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </div>
        <Toaster 
          position="top-right" 
          toastOptions={{
            style: {
              background: '#1f2937',
              color: '#f3f4f6',
              border: '1px solid #374151',
            },
          }}
        />
      </body>
    </html>
  )
}

import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Вход в админ-панель - Агрегатор Курсов',
  robots: {
    index: false,
    follow: false,
  },
}

export default function AdminLoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}






import { notFound } from 'next/navigation'

// Отдельные страницы курсов отключены
// Все курсы теперь доступны только через страницы школ (/school/[slug])
// и ведут напрямую на внешние сайты

export default function CoursePage() {
  notFound()
}

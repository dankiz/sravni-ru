import { Metadata } from 'next'
import Quiz from '@/components/Quiz'

export const metadata: Metadata = {
  title: 'Подбор курсов - Интерактивный тест | Агрегатор Курсов',
  description: 'Пройдите тест из 5 вопросов и получите персональную подборку курсов, которые вам подходят',
}

export default function QuizPage() {
  return <Quiz />
}



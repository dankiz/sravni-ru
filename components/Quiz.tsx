'use client'

import { useState } from 'react'
import { ArrowRight, CheckCircle, Loader2, Sparkles } from 'lucide-react'
import Link from 'next/link'
import CourseCard from './CourseCard'

interface QuizAnswer {
  questionId: number
  answer: string | string[]
}

interface Course {
  id: string
  title: string
  slug: string
  description: string | null
  link: string
  image: string | null
  price: number | null
  pricePerLesson: number | null
  pricePerMonth: number | null
  priceOneTime: number | null
  priceType: 'PER_LESSON' | 'PER_MONTH' | 'ONE_TIME' | null
  averageRating: number | null
  reviewCount: number
  author: {
    id: string
    name: string
    slug: string
  }
  category: {
    id: string
    name: string
    slug: string
  } | null
  tags: Array<{
    tag: {
      id: string
      name: string
      slug: string
    }
  }>
}

const questions = [
  {
    id: 1,
    question: 'Какова ваша основная цель обучения?',
    options: [
      { value: 'profession', label: 'Получить новую профессию', icon: '💼' },
      { value: 'languages', label: 'Изучить иностранные языки', icon: '🌍' },
      { value: 'skills', label: 'Повысить квалификацию / освоить навыки', icon: '📈' },
      { value: 'hobby', label: 'Хобби и личное развитие', icon: '🎨' },
    ],
  },
  {
    id: 2,
    question: 'Какой у вас уровень подготовки?',
    options: [
      { value: 'beginner', label: 'Новичок (только начинаю)', icon: '🌱' },
      { value: 'intermediate', label: 'Средний (есть базовые знания)', icon: '📚' },
      { value: 'advanced', label: 'Продвинутый (хочу углубить знания)', icon: '🚀' },
    ],
  },
  {
    id: 3,
    question: 'Какой у вас бюджет на обучение?',
    options: [
      { value: 'low', label: 'До 5 000₽ в месяц', icon: '💰' },
      { value: 'medium', label: '5 000 - 15 000₽ в месяц', icon: '💵' },
      { value: 'high', label: '15 000 - 30 000₽ в месяц', icon: '💎' },
      { value: 'premium', label: 'Свыше 30 000₽ в месяц', icon: '👑' },
    ],
  },
  {
    id: 4,
    question: 'Какой формат оплаты вам удобнее?',
    options: [
      { value: 'per_month', label: 'Помесячная оплата', icon: '📅' },
      { value: 'per_lesson', label: 'Оплата за урок', icon: '🎯' },
      { value: 'one_time', label: 'Разовая оплата за весь курс', icon: '💳' },
      { value: 'any', label: 'Любой формат', icon: '🔄' },
    ],
  },
  {
    id: 5,
    question: 'Что для вас важнее всего?',
    options: [
      { value: 'price', label: 'Низкая цена', icon: '💸' },
      { value: 'quality', label: 'Высокое качество и рейтинг', icon: '⭐' },
      { value: 'speed', label: 'Быстрое обучение', icon: '⚡' },
      { value: 'balance', label: 'Оптимальное соотношение цены и качества', icon: '⚖️' },
    ],
  },
]

export default function Quiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<QuizAnswer[]>([])
  const [recommendations, setRecommendations] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  const handleAnswer = (value: string) => {
    const newAnswers = [...answers]
    const existingAnswerIndex = newAnswers.findIndex(
      (a) => a.questionId === questions[currentQuestion].id
    )

    if (existingAnswerIndex >= 0) {
      newAnswers[existingAnswerIndex].answer = value
    } else {
      newAnswers.push({
        questionId: questions[currentQuestion].id,
        answer: value,
      })
    }

    setAnswers(newAnswers)

    // Переход к следующему вопросу
    if (currentQuestion < questions.length - 1) {
      setTimeout(() => {
        setCurrentQuestion(currentQuestion + 1)
      }, 300)
    } else {
      // Последний вопрос - отправляем ответы
      handleSubmit(newAnswers)
    }
  }

  const handleSubmit = async (finalAnswers: QuizAnswer[]) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/quiz/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ answers: finalAnswers }),
      })

      if (!response.ok) {
        throw new Error('Ошибка при получении рекомендаций')
      }

      const data = await response.json()
      setRecommendations(data.courses || [])
      setIsComplete(true)
    } catch (error) {
      console.error('Error fetching recommendations:', error)
      alert('Произошла ошибка. Попробуйте еще раз.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRestart = () => {
    setCurrentQuestion(0)
    setAnswers([])
    setRecommendations([])
    setIsComplete(false)
  }

  const progress = ((currentQuestion + 1) / questions.length) * 100
  const currentAnswer = answers.find(
    (a) => a.questionId === questions[currentQuestion].id
  )?.answer

  if (isComplete && recommendations.length > 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-primary-500/10 text-primary-400 px-4 py-2 rounded-full mb-6 border border-primary-500/20">
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm font-medium">Тест завершен!</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white via-gray-100 to-gray-400 bg-clip-text text-transparent">
              Курсы, которые вам подходят
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-8">
              Мы подобрали для вас {recommendations.length} курсов на основе ваших ответов
            </p>
            <button
              onClick={handleRestart}
              className="text-primary-400 hover:text-primary-300 font-semibold flex items-center gap-2 mx-auto transition"
            >
              Пройти тест заново
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {recommendations.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>

          <div className="text-center">
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white px-8 py-4 rounded-lg font-semibold hover:from-primary-500 hover:to-primary-600 transition shadow-lg shadow-primary-500/20"
            >
              Посмотреть все курсы
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-400 text-lg">Подбираем курсы для вас...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-12 px-4">
      <div className="container mx-auto max-w-3xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">
              Вопрос {currentQuestion + 1} из {questions.length}
            </span>
            <span className="text-sm text-gray-400">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-primary-600 to-primary-700 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-gray-800 rounded-2xl border border-gray-700 p-8 md:p-12 shadow-2xl">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 bg-primary-500/10 text-primary-400 px-4 py-2 rounded-full mb-6 border border-primary-500/20">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">Подбор курсов</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {questions[currentQuestion].question}
            </h2>
            <p className="text-gray-400">
              Выберите наиболее подходящий вариант
            </p>
          </div>

          {/* Options */}
          <div className="space-y-4">
            {questions[currentQuestion].options.map((option) => {
              const isSelected = currentAnswer === option.value
              return (
                <button
                  key={option.value}
                  onClick={() => handleAnswer(option.value)}
                  className={`w-full text-left p-6 rounded-xl border-2 transition-all duration-200 ${
                    isSelected
                      ? 'border-primary-500 bg-primary-500/10 shadow-lg shadow-primary-500/20'
                      : 'border-gray-700 bg-gray-750 hover:border-gray-600 hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">{option.icon}</span>
                    <span
                      className={`text-lg font-semibold ${
                        isSelected ? 'text-white' : 'text-gray-300'
                      }`}
                    >
                      {option.label}
                    </span>
                    {isSelected && (
                      <CheckCircle className="w-6 h-6 text-primary-400 ml-auto" />
                    )}
                  </div>
                </button>
              )
            })}
          </div>

          {/* Navigation */}
          {currentQuestion > 0 && (
            <div className="mt-8">
              <button
                onClick={() => setCurrentQuestion(currentQuestion - 1)}
                className="text-gray-400 hover:text-white transition flex items-center gap-2"
              >
                <ArrowRight className="w-5 h-5 rotate-180" />
                Назад
              </button>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            Ответьте на 5 вопросов, и мы подберем курсы специально для вас
          </p>
        </div>
      </div>
    </div>
  )
}



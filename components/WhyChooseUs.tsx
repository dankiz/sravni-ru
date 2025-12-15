'use client'

import { CreditCard, Zap, Shield, Eye, Lock, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const benefits = [
  {
    icon: CreditCard,
    title: 'Прозрачные цены и сравнение',
    description: 'Видите все цены курсов в одном месте — от разных школ и платформ. Сравнивайте стоимость за месяц, за курс или за урок. Мы показываем финальную сумму без скрытых комиссий, чтобы вы могли выбрать оптимальный вариант для своего бюджета.',
    cta: 'Начать сравнение',
    href: '/courses',
    gradient: 'from-blue-500/20 to-cyan-500/20',
    borderColor: 'border-blue-500/30',
    iconColor: 'text-blue-400',
  },
  {
    icon: Zap,
    title: 'Быстрый поиск и фильтрация',
    description: 'Найдите нужный курс за минуты благодаря удобной системе фильтров. Ищите по категориям, тегам, цене, рейтингу и школе. Не тратьте часы на просмотр десятков сайтов — все в одном каталоге с актуальной информацией.',
    cta: 'Найти курс',
    href: '/courses',
    gradient: 'from-yellow-500/20 to-orange-500/20',
    borderColor: 'border-yellow-500/30',
    iconColor: 'text-yellow-400',
  },
  {
    icon: Shield,
    title: 'Проверенные отзывы и рейтинги',
    description: 'Все отзывы проходят модерацию перед публикацией. Реальные студенты делятся опытом прохождения курсов, указывают плюсы и минусы. Рейтинги формируются на основе реальных оценок, а не маркетинговых обещаний.',
    cta: 'Читать отзывы',
    href: '/courses',
    gradient: 'from-green-500/20 to-emerald-500/20',
    borderColor: 'border-green-500/30',
    iconColor: 'text-green-400',
  },
  {
    icon: Eye,
    title: 'Прозрачные условия',
    description: 'В карточке каждого курса видна полная информация: цена, длительность, формат обучения, наличие поддержки и сертификата. Никаких скрытых условий или дополнительных платежей. Видите все — принимаете решение.',
    cta: 'Смотреть каталог',
    href: '/courses',
    gradient: 'from-purple-500/20 to-pink-500/20',
    borderColor: 'border-purple-500/30',
    iconColor: 'text-purple-400',
  },
  {
    icon: Lock,
    title: 'Безопасный выбор',
    description: 'Мы не собираем ваши персональные данные для просмотра каталога. Все ссылки ведут напрямую на официальные сайты школ. Вы сами решаете, где и как проходить обучение — мы только помогаем найти лучший вариант.',
    cta: 'Выбрать курс',
    href: '/courses',
    gradient: 'from-red-500/20 to-rose-500/20',
    borderColor: 'border-red-500/30',
    iconColor: 'text-red-400',
  },
]

export default function WhyChooseUs() {
  return (
    <section className="py-16 bg-gray-800 border-y border-gray-700">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Почему выгодно выбирать курсы через наш агрегатор
            </h2>
            <p className="text-gray-400 text-lg max-w-3xl mx-auto">
              Хотите найти лучший онлайн-курс и не переплачивать? Наш агрегатор помогает 
              сравнить курсы разных школ, увидеть реальные отзывы и выбрать оптимальный вариант. 
              Мы убрали необходимость просматривать десятки сайтов вручную.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {benefits.map((benefit: any, index: number) => {
              const Icon = benefit.icon
              return (
                <div
                  key={index}
                  className={`bg-gradient-to-br ${benefit.gradient} rounded-xl p-6 border ${benefit.borderColor} hover:scale-105 transition-transform shadow-lg`}
                >
                  <div className={`bg-gray-800/50 w-12 h-12 rounded-lg flex items-center justify-center mb-4 border ${benefit.borderColor}`}>
                    <Icon className={`w-6 h-6 ${benefit.iconColor}`} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-300 mb-4 leading-relaxed">
                    {benefit.description}
                  </p>
                  <Link
                    href={benefit.href}
                    className={`inline-flex items-center gap-2 text-sm font-semibold ${benefit.iconColor} hover:opacity-80 transition`}
                  >
                    {benefit.cta}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )
            })}
          </div>

          <div className="text-center">
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white px-8 py-4 rounded-lg font-semibold hover:from-primary-500 hover:to-primary-600 transition shadow-lg shadow-primary-500/20"
            >
              Рассчитать стоимость обучения за 30 секунд
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}



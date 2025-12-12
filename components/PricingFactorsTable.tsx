'use client'

import { Info, TrendingUp, Star, Shield, Clock, ArrowRight } from 'lucide-react'

const factors = [
  {
    parameter: 'Рейтинг и отзывы',
    icon: Star,
    whyImportant: 'Курсы с высоким рейтингом (4.5+) и большим количеством отзывов (50+) обычно дают лучший результат обучения. Пользователи делятся реальным опытом прохождения.',
    advice: 'Проверьте рейтинг курса в нашем каталоге перед выбором. Курсы с рейтингом выше 4.5 и более 20 отзывами имеют высокую вероятность качественного контента. Обратите внимание на детальные отзывы с плюсами и минусами.',
  },
  {
    parameter: 'Тип цены и формат оплаты',
    icon: TrendingUp,
    whyImportant: 'Курсы с оплатой за месяц часто выгоднее для долгого обучения, а разовая оплата — для коротких программ. Некоторые школы предлагают рассрочку или возврат средств.',
    advice: 'Сравните цены за месяц и за весь курс. Для программ длительностью более 6 месяцев часто выгоднее помесячная оплата. Проверьте условия возврата средств перед покупкой.',
  },
  {
    parameter: 'Редкость и уникальность программы',
    icon: Shield,
    whyImportant: 'Узкоспециализированные курсы (например, по конкретному фреймворку или инструменту) могут стоить дороже, но дают уникальные знания, недоступные в массовых программах.',
    advice: 'Если курс покрывает редкую тему или использует актуальные технологии, это может оправдать более высокую цену. Проверьте, есть ли аналоги в каталоге — сравнение поможет принять решение.',
  },
  {
    parameter: 'Дополнительные возможности',
    icon: Info,
    whyImportant: 'Менторская поддержка, помощь в трудоустройстве, доступ к закрытому сообществу, сертификаты — все это влияет на итоговую стоимость и ценность курса.',
    advice: 'Оцените, нужны ли вам дополнительные услуги. Если вы опытный специалист, возможно, достаточно базового курса. Если начинающий — поддержка ментора может быть критически важна.',
  },
  {
    parameter: 'Доступность и сроки',
    icon: Clock,
    whyImportant: 'Курсы с пожизненным доступом стоят дороже, но дают возможность возвращаться к материалам. Ограниченный доступ (например, на 6 месяцев) дешевле, но требует быстрого прохождения.',
    advice: 'Если планируете изучать материал постепенно, выбирайте курсы с длительным или пожизненным доступом. Для интенсивного обучения подойдет ограниченный доступ с более низкой ценой.',
  },
]

export default function PricingFactorsTable() {
  return (
    <section className="py-16 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Как формируется стоимость курса
            </h2>
            <p className="text-gray-400 text-lg max-w-3xl mx-auto">
              Понимание факторов оценки помогает выбрать оптимальный курс и формат обучения. 
              Мы показываем все критерии оценки — без скрытых условий.
            </p>
          </div>

          <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">
                      Фактор оценки
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">
                      Почему это важно
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">
                      Совет перед выбором
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {factors.map((factor, index) => {
                    const Icon = factor.icon
                    return (
                      <tr key={index} className="hover:bg-gray-750 transition-colors">
                        <td className="px-6 py-6 align-top">
                          <div className="flex items-start gap-3">
                            <div className="bg-primary-500/20 p-2 rounded-lg border border-primary-500/30 flex-shrink-0">
                              <Icon className="w-5 h-5 text-primary-400" />
                            </div>
                            <div>
                              <div className="font-bold text-white mb-1">
                                {factor.parameter}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-6 align-top">
                          <p className="text-gray-300 leading-relaxed">
                            {factor.whyImportant}
                          </p>
                        </td>
                        <td className="px-6 py-6 align-top">
                          <p className="text-gray-300 leading-relaxed">
                            {factor.advice}
                          </p>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-8 text-center">
            <a
              href="/courses"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white px-8 py-4 rounded-lg font-semibold hover:from-primary-500 hover:to-primary-600 transition shadow-lg shadow-primary-500/20"
            >
              Проверить цены курсов
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}


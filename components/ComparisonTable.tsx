'use client'

import { Check, X, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const comparison = [
  {
    criterion: 'Сравнение цен',
    directSearch: 'Нужно открывать каждый сайт отдельно, вручную сравнивать цены. Нет единой системы сравнения.',
    ourService: 'Все цены в одном месте с удобной системой фильтров. Сравнение за месяц, за курс или за урок — одним кликом.',
    ourAdvantage: true,
  },
  {
    criterion: 'Отзывы и рейтинги',
    directSearch: 'Отзывы разбросаны по разным платформам (отзовики, форумы, соцсети). Сложно найти объективную информацию.',
    ourService: 'Все отзывы собраны в одном месте, проходят модерацию. Реальные студенты делятся опытом с указанием плюсов и минусов.',
    ourAdvantage: true,
  },
  {
    criterion: 'Скорость поиска',
    directSearch: 'Поиск может растянуться на часы или дни. Нужно просматривать десятки сайтов, сравнивать условия вручную.',
    ourService: 'Найдите нужный курс за минуты благодаря удобной системе фильтров по категориям, тегам, цене и рейтингу.',
    ourAdvantage: true,
  },
  {
    criterion: 'Учет особенностей',
    directSearch: 'Каждый сайт показывает информацию по-своему. Сложно сравнить формат обучения, наличие поддержки, сертификатов.',
    ourService: 'Единый формат карточек курсов. Видите все важные параметры: формат, длительность, поддержка, сертификат — в одном месте.',
    ourAdvantage: true,
  },
  {
    criterion: 'Безопасность',
    directSearch: 'Нужно переходить на разные сайты, некоторые могут быть небезопасными. Риск попасть на мошеннический ресурс.',
    ourService: 'Все ссылки ведут на официальные сайты школ. Мы проверяем курсы перед добавлением в каталог. Безопасный просмотр без регистрации.',
    ourAdvantage: true,
  },
]

export default function ComparisonTable() {
  return (
    <section className="py-16 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Сравнение: Поиск курсов вручную против нашего агрегатора
            </h2>
            <p className="text-gray-400 text-lg max-w-3xl mx-auto">
              Задача — не просто найти курс, а выбрать оптимальный вариант с учетом цены, 
              качества и отзывов. Почему тысячи пользователей используют агрегаторы вместо 
              ручного поиска? Все дело в экономии времени и возможности сравнить все варианты.
            </p>
          </div>

          <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">
                      Критерий
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">
                      Поиск вручную по сайтам
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">
                      Наш агрегатор
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {comparison.map((item: any, index: number) => (
                    <tr key={index} className="hover:bg-gray-750 transition-colors">
                      <td className="px-6 py-6 align-top">
                        <div className="font-bold text-white">
                          {item.criterion}
                        </div>
                      </td>
                      <td className="px-6 py-6 align-top">
                        <div className="flex items-start gap-2">
                          <X className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                          <p className="text-gray-300 leading-relaxed">
                            {item.directSearch}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-6 align-top">
                        <div className="flex items-start gap-2">
                          <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                          <p className="text-gray-300 leading-relaxed">
                            {item.ourService}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-8 bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Итог
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  При ручном поиске вы тратите часы на просмотр разных сайтов и все равно 
                  можете упустить лучший вариант. В нашем агрегаторе — все курсы в одном месте 
                  с удобным сравнением. Вы видите все варианты, читаете реальные отзывы и выбираете 
                  оптимальный курс за минуты, а не часы. Выберите формат под вашу задачу.
                </p>
              </div>
              <Link
                href="/courses"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-3 rounded-lg font-semibold hover:from-primary-500 hover:to-primary-600 transition shadow-lg whitespace-nowrap"
              >
                Сравнить выгоду сейчас
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}



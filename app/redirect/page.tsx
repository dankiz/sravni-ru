'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

function RedirectContent() {
  const searchParams = useSearchParams()
  const [countdown, setCountdown] = useState(15)
  const [destination, setDestination] = useState<string | null>(null)
  const [destinationDomain, setDestinationDomain] = useState<string>('')
  
  useEffect(() => {
    const dest = searchParams.get('dl') || searchParams.get('to')
    
    if (!dest) {
      window.location.href = '/'
      return
    }

    // Декодируем URL
    const decodedDest = decodeURIComponent(dest)
    setDestination(decodedDest)
    
    // Извлекаем домен из URL для отображения
    try {
      const url = new URL(decodedDest)
      setDestinationDomain(url.hostname)
    } catch (e) {
      setDestinationDomain(decodedDest)
    }
  }, [searchParams])

  useEffect(() => {
    if (!destination) return

    // Обратный отсчет
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          // Выполняем редирект напрямую на конечный URL
          window.location.href = destination
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [destination])

  const handleRedirect = () => {
    if (destination) {
      window.location.href = destination
    }
  }

  if (!destination) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Загрузка...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full bg-gray-800 rounded-xl shadow-2xl border border-gray-700 p-8 md:p-12 text-center">
        <div className="mb-6">
          <svg 
            className="w-16 h-16 mx-auto mb-4 text-yellow-500" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
            />
          </svg>
        </div>
        
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-4">
          Вы покидаете наш сайт и переходите по внешней ссылке
        </h1>
        
        <p className="text-gray-300 text-lg mb-6">
          Через <span className="font-bold text-primary-400 text-2xl">{countdown}</span> секунд вы будете перенаправлены на сайт
        </p>
        
        <div className="bg-gray-700 rounded-lg p-4 mb-6">
          <p className="text-primary-400 font-semibold text-lg break-all">
            {destinationDomain}
          </p>
        </div>

        <button
          onClick={handleRedirect}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white px-8 py-4 rounded-lg font-semibold hover:from-primary-500 hover:to-primary-600 transition shadow-lg shadow-primary-500/20 mb-4"
        >
          Перейти сейчас
        </button>

        <p className="text-gray-400 text-sm">
          Если этого не произошло,{' '}
          <button
            onClick={handleRedirect}
            className="text-primary-400 hover:text-primary-300 underline font-medium"
          >
            нажмите здесь
          </button>
        </p>
      </div>
    </div>
  )
}

export default function RedirectPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Загрузка...</p>
        </div>
      </div>
    }>
      <RedirectContent />
    </Suspense>
  )
}


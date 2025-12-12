'use client'

import { getRedirectUrl } from '@/lib/utils'

interface WebsiteRedirectButtonProps {
  url: string
  schoolName: string
  path?: string
}

export default function WebsiteRedirectButton({ url, schoolName, path }: WebsiteRedirectButtonProps) {
  const redirectUrl = getRedirectUrl(url, {
    schoolName,
    path: path || '/',
    keyword: 'school',
    position: '1',
  })

  return (
    <a
      href={redirectUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-3 rounded-lg font-semibold hover:from-primary-500 hover:to-primary-600 transition shadow-lg shadow-primary-500/20"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
      </svg>
      Перейти на сайт школы
    </a>
  )
}


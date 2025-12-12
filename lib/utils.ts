export function cn(...inputs: (string | undefined | null | boolean)[]) {
  return inputs.filter(Boolean).join(' ')
}

export function slugify(text: string): string {
  if (!text) return ''
  
  // Транслитерация кириллицы в латиницу
  const transliteration: { [key: string]: string } = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
    'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
    'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
    'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch',
    'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
    'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ё': 'Yo',
    'Ж': 'Zh', 'З': 'Z', 'И': 'I', 'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M',
    'Н': 'N', 'О': 'O', 'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U',
    'Ф': 'F', 'Х': 'H', 'Ц': 'Ts', 'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Sch',
    'Ъ': '', 'Ы': 'Y', 'Ь': '', 'Э': 'E', 'Ю': 'Yu', 'Я': 'Ya'
  }
  
  let result = text
    .toString()
    .toLowerCase()
    .trim()
    .split('')
    .map(char => transliteration[char] || char)
    .join('')
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '')
  
  return result || 'course'
}

export function formatPrice(price: number | null | undefined): string {
  if (!price && price !== 0) return 'Бесплатно'
  if (price === 0) return 'Бесплатно'
  return `${price.toLocaleString('ru-RU')} ₽`
}

/**
 * Генерирует URL для редиректа через промежуточную страницу
 * @param destination - URL назначения
 * @param options - Дополнительные параметры (не используются, оставлены для совместимости)
 */
export function getRedirectUrl(
  destination: string,
  options?: {
    schoolName?: string
    courseTitle?: string
    category?: string
    path?: string
    keyword?: string
    position?: string
  }
): string {
  if (!destination) return '#'
  
  // Если это внутренняя ссылка, возвращаем как есть
  if (destination.startsWith('/') || destination.startsWith('#')) {
    return destination
  }

  // Для внешних ссылок используем JavaScript редирект через страницу /redirect
  const baseUrl = typeof window !== 'undefined' 
    ? window.location.origin 
    : (process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000')
  
  const redirectUrl = new URL(`${baseUrl}/redirect`)
  // Используем параметр 'to' как на zoon.ru
  redirectUrl.searchParams.set('to', encodeURIComponent(destination))
  
  return redirectUrl.toString()
}

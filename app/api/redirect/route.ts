import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const destination = searchParams.get('dl')

    if (!destination) {
      return NextResponse.json(
        { error: 'Missing destination URL' },
        { status: 400 }
      )
    }

    // Декодируем destination URL
    const decodedDestination = decodeURIComponent(destination)

    // Получаем домен редиректа из переменных окружения или используем дефолтный
    const redirectDomain = process.env.REDIRECT_DOMAIN || 'https://go.acstat.com/fce64814c5585361'
    
    // Получаем дополнительные параметры для трекинга
    const sub1 = searchParams.get('sub1') || ''
    const sub2 = searchParams.get('sub2') || ''
    const sub4 = searchParams.get('sub4') ? decodeURIComponent(searchParams.get('sub4')!) : ''
    const sub5 = searchParams.get('sub5') ? decodeURIComponent(searchParams.get('sub5')!) : ''
    const keyword = searchParams.get('keyword') || 'direct'
    const position = searchParams.get('position') || '1'

    // Формируем URL редиректа
    const redirectUrl = new URL(redirectDomain)
    redirectUrl.searchParams.set('dl', decodedDestination)
    if (sub1) redirectUrl.searchParams.set('sub1', sub1)
    if (sub2) redirectUrl.searchParams.set('sub2', sub2)
    if (sub4) redirectUrl.searchParams.set('sub4', sub4)
    if (sub5) redirectUrl.searchParams.set('sub5', sub5)
    if (keyword) redirectUrl.searchParams.set('keyword', keyword)
    if (position) redirectUrl.searchParams.set('position', position)

    // Выполняем редирект
    return NextResponse.redirect(redirectUrl.toString(), { status: 302 })
  } catch (error) {
    console.error('Redirect error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


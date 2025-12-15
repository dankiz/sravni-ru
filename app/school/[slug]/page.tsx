import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import SchoolCourseCard from '@/components/SchoolCourseCard'
import { Metadata } from 'next'
import WebsiteRedirectButton from '@/components/WebsiteRedirectButton'

async function getAuthor(slug: string) {
  try {
    console.log('Fetching author with slug:', slug)

    const author = await prisma.author.findUnique({
      where: { slug },
      include: {
        courses: {
          where: { status: 'APPROVED' },
          include: {
            author: true,
            tags: {
              include: {
                tag: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    console.log('Author found:', author ? author.name : 'null')
    console.log('Courses count:', author?.courses?.length || 0)

    if (!author) {
      console.log('Author not found, returning null')
      return null
    }

    // Calculate average rating from all courses
    const avgRating = author.courses.length > 0
      ? author.courses.reduce((sum: number, course: any) => sum + (course.averageRating || 0), 0) / author.courses.length
      : 0

    // Calculate total reviews
    const totalReviews = author.courses.reduce((sum: number, course: any) => sum + (course.reviewCount || 0), 0)

    // Get reviews separately for courses that have them
    const courseIds = author.courses.map((c: any) => c.id)
    const allReviews = courseIds.length > 0
      ? await prisma.review.findMany({
          where: {
            courseId: { in: courseIds },
            status: 'APPROVED',
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        }).catch(() => [])
      : []

    // Get school reviews
    const schoolReviews = await prisma.schoolReview.findMany({
      where: {
        authorId: author.id,
        status: 'APPROVED',
      },
      orderBy: { createdAt: 'desc' },
    }).catch(() => [])

    // Calculate school rating
    const schoolAvgRating = schoolReviews.length > 0
      ? schoolReviews.reduce((sum: number, review: any) => sum + review.rating, 0) / schoolReviews.length
      : 0

    console.log('Course reviews count:', allReviews.length)
    console.log('School reviews count:', schoolReviews.length)

    return {
      ...author,
      avgRating,
      totalReviews,
      allReviews,
      schoolReviews,
      schoolAvgRating,
    }
  } catch (error) {
    console.error('Error fetching author:', error)
    return null
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const author = await getAuthor(params.slug)

  if (!author) {
    return {
      title: 'Школа не найдена',
    }
  }

  return {
    title: `${author.name} - Школа онлайн-курсов | Агрегатор Курсов`,
    description: author.bio || `Курсы от ${author.name} на Агрегаторе Курсов`,
    openGraph: {
      title: author.name,
      description: author.bio || '',
      images: author.logo ? [author.logo] : [],
    },
  }
}

export default async function SchoolPage({ params }: { params: { slug: string } }) {
  const author = await getAuthor(params.slug)

  if (!author) {
    notFound()
  }

  const isSkysmart = author.slug === 'skysmart'

  // Generate Schema.org JSON-LD
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'

  // Extract legal info from contacts if available
  const extractLegalInfo = (contacts: string | null) => {
    if (!contacts) return {}
    const innMatch = contacts.match(/ИНН[:\s]+(\d+)/i)
    const ogrnMatch = contacts.match(/ОГРН[:\s]+(\d+)/i)
    const addressMatch = contacts.match(/Адрес[:\s]+([^\n]+)/i)
    const legalNameMatch = contacts.match(/(ООО|ОАО|ЗАО|ИП|ОАНО ДПО)[^\n]+/i)

    return {
      inn: innMatch ? innMatch[1] : undefined,
      ogrn: ogrnMatch ? ogrnMatch[1] : undefined,
      address: addressMatch ? addressMatch[1] : undefined,
      legalName: legalNameMatch ? legalNameMatch[0] : undefined,
    }
  }

  const legalInfo = extractLegalInfo(author.contacts)
  const rating = author.avgRating || 0
  const reviewCount = author.totalReviews || 0
  const schoolRating = author.schoolAvgRating || 0
  const schoolReviewCount = author.schoolReviews?.length || 0

  // Build comprehensive Schema.org structured data
  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: author.name,
    description: author.bio || `Онлайн-школа ${author.name}`,
    url: author.website || `${baseUrl}/school/${author.slug}`,
  }

  // Add logo if available
  if (author.logo) {
    schema.image = author.logo
  }

  // Add aggregate rating for school reviews
  if (schoolReviewCount > 0) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: schoolRating.toFixed(1),
      reviewCount: schoolReviewCount,
      bestRating: '5',
      worstRating: '1',
    }
  }

  // Add school reviews
  if (author.schoolReviews && author.schoolReviews.length > 0) {
    schema.review = author.schoolReviews.map((review: any) => ({
      '@type': 'Review',
      reviewRating: {
        '@type': 'Rating',
        ratingValue: review.rating,
        bestRating: '5',
        worstRating: '1',
      },
      author: {
        '@type': 'Person',
        name: review.authorName || 'Аноним',
      },
      datePublished: review.createdAt.toISOString().split('T')[0],
      reviewBody: [
        review.title,
        review.pros ? `Плюсы: ${review.pros}` : '',
        review.cons ? `Минусы: ${review.cons}` : '',
        review.comment || '',
      ].filter(Boolean).join('. '),
      ...(review.title && { name: review.title }),
    }))
  }

  // Add contact information
  const contactPoints = []
  if (author.email) {
    contactPoints.push({
      '@type': 'ContactPoint',
      contactType: 'customer service',
      email: author.email,
    })
  }

  // Extract phone from contacts
  const phoneMatch = author.contacts?.match(/8\s?\(?\d{3}\)?\s?\d{3}[-\s]?\d{2}[-\s]?\d{2}/i)
  if (phoneMatch) {
    contactPoints.push({
      '@type': 'ContactPoint',
      contactType: 'customer service',
      telephone: phoneMatch[0].replace(/\s/g, ''),
    })
  }

  if (contactPoints.length > 0) {
    schema.contactPoint = contactPoints
  }

  // Add address if available
  if (legalInfo.address) {
    schema.address = {
      '@type': 'PostalAddress',
      streetAddress: legalInfo.address,
      addressCountry: 'RU',
    }
  }

  // Add legal name and identifiers
  if (legalInfo.legalName) {
    schema.legalName = legalInfo.legalName
  }

  if (legalInfo.inn) {
    schema.taxID = legalInfo.inn
  }

  if (legalInfo.ogrn) {
    schema.identifier = {
      '@type': 'PropertyValue',
      name: 'ОГРН',
      value: legalInfo.ogrn,
    }
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <div className="bg-gray-900 min-h-screen">
        {/* Breadcrumbs */}
        <div className="bg-gray-800 border-b border-gray-700">
          <div className="container mx-auto px-4 py-4">
            <nav className="text-sm">
              <Link href="/" className="text-primary-400 hover:text-primary-300 transition">Главная</Link>
              <span className="mx-2 text-gray-600">/</span>
              <Link href="/courses" className="text-primary-400 hover:text-primary-300 transition">Школы</Link>
              <span className="mx-2 text-gray-600">/</span>
              <span className="text-gray-400">{author.name}</span>
            </nav>
          </div>
        </div>

        {/* Hero Section with School Info */}
        <div className={`bg-gradient-to-br from-gray-800 via-gray-800 to-gray-900 border-b border-gray-700 relative ${isSkysmart ? 'ring-2 ring-green-500/30 shadow-[0_0_30px_rgba(34,197,94,0.2)]' : ''}`}>
          <div className="container mx-auto px-4 py-12">
            {/* Ленточка "Лучший выбор" для Skysmart */}
            {isSkysmart && (
              <div className="absolute top-4 right-4 bg-gradient-to-r from-green-500 to-green-600 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg z-10">
                ЛУЧШИЙ ВЫБОР
              </div>
            )}
            
            <div className="flex flex-col md:flex-row gap-8 items-start">
              {/* Logo */}
              {author.logo && (
                <div className="flex-shrink-0">
                  <div className={`relative w-32 h-32 md:w-40 md:h-40 bg-white rounded-2xl overflow-hidden shadow-2xl border-4 border-gray-700 ${isSkysmart ? 'ring-2 ring-green-500/50' : ''}`}>
                    <Image
                      src={author.logo}
                      alt={author.name}
                      fill
                      className="object-contain p-4"
                    />
                  </div>
                </div>
              )}

              {/* School Info */}
              <div className="flex-grow">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  {author.name}
                </h1>

                {/* Rating */}
                {reviewCount > 0 && (
                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex items-center gap-2 bg-yellow-500/20 px-4 py-2 rounded-xl border border-yellow-500/30">
                      <svg className="w-6 h-6 fill-yellow-500" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                      <span className="text-2xl font-bold text-yellow-500">{rating.toFixed(1)}</span>
                    </div>
                    <span className="text-gray-400">
                      {reviewCount} {reviewCount === 1 ? 'отзыв' : reviewCount < 5 ? 'отзыва' : 'отзывов'}
                    </span>
                  </div>
                )}

                {/* Description */}
                {author.bio && (
                  <p className="text-gray-300 text-lg leading-relaxed mb-6 w-full">
                    {author.bio}
                  </p>
                )}

                {/* Website Link */}
                {author.website && (
                  <WebsiteRedirectButton 
                    url={author.website} 
                    schoolName={author.name}
                    path={`/school/${author.slug}`}
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          {/* Courses Section */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-white mb-2">
              Курсы
            </h2>
            <p className="text-gray-400 mb-8">
              Бесплатно
            </p>

            {author.courses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {author.courses.map((course) => (
                  <SchoolCourseCard key={course.id} course={course} />
                ))}
              </div>
            ) : (
              <div className="bg-gray-800 p-12 rounded-xl shadow-lg text-center border border-gray-700">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <p className="text-gray-400 text-lg">
                  У этой школы пока нет опубликованных курсов
                </p>
              </div>
            )}
          </section>

          {/* School Reviews Section */}
          {author.schoolReviews && author.schoolReviews.length > 0 && (
            <section className="mb-16">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-white">
                  Отзывы о школе
                </h2>
              </div>

              {/* Rating Summary */}
              <div className="bg-gray-800 rounded-xl p-8 border border-gray-700 mb-8">
                <div className="flex flex-col md:flex-row md:items-center gap-8">
                  <div className="text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                      <span className="text-5xl font-bold text-white">{author.schoolAvgRating.toFixed(1)}</span>
                      <svg className="w-12 h-12 fill-yellow-500" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    </div>
                    <p className="text-gray-400">
                      {author.schoolReviews.length} {author.schoolReviews.length === 1 ? 'отзыв' : author.schoolReviews.length < 5 ? 'отзыва' : 'отзывов'}
                    </p>
                  </div>

                  <div className="flex-grow">
                    {[5, 4, 3, 2, 1].map((stars) => {
                      const count = author.schoolReviews.filter((r: any) => r.rating === stars).length
                      const percentage = author.schoolReviews.length > 0 ? (count / author.schoolReviews.length) * 100 : 0
                      return (
                        <div key={stars} className="flex items-center gap-3 mb-2">
                          <div className="flex items-center gap-1 w-20">
                            <span className="text-sm text-gray-400">{stars}</span>
                            <svg className="w-4 h-4 fill-yellow-500" viewBox="0 0 24 24">
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                            </svg>
                          </div>
                          <div className="flex-grow bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-yellow-500 h-2 rounded-full transition-all"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-400 w-12 text-right">{count}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* School Reviews List */}
              <div className="space-y-6">
                {author.schoolReviews.map((review: any) => (
                  <div key={review.id} className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`w-5 h-5 ${i < review.rating ? 'fill-yellow-500' : 'fill-gray-600'}`}
                              viewBox="0 0 24 24"
                            >
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                            </svg>
                          ))}
                        </div>
                        {review.title && (
                          <h3 className="font-semibold text-white text-lg mb-2">{review.title}</h3>
                        )}
                      </div>
                      <span className="text-sm text-gray-400">
                        {new Date(review.createdAt).toLocaleDateString('ru-RU')}
                      </span>
                    </div>
                    {review.pros && (
                      <div className="mb-3">
                        <p className="text-sm font-medium text-green-400 mb-1">Плюсы</p>
                        <p className="text-gray-300 text-sm">{review.pros}</p>
                      </div>
                    )}
                    {review.cons && (
                      <div className="mb-3">
                        <p className="text-sm font-medium text-red-400 mb-1">Минусы</p>
                        <p className="text-gray-300 text-sm">{review.cons}</p>
                      </div>
                    )}
                    {review.comment && (
                      <p className="text-gray-300">{review.comment}</p>
                    )}
                    <div className="mt-4 flex items-center gap-2 text-sm text-gray-400">
                      <span className="font-medium text-white">{review.authorName || 'Аноним'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Course Reviews Section */}
          {reviewCount > 0 && (
            <section className="mb-16">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-white">
                  Отзывы о курсах
                </h2>
                <Link
                  href="#reviews"
                  className="text-primary-400 hover:text-primary-300 font-semibold transition"
                >
                  Все отзывы
                </Link>
              </div>

              {/* Rating Summary */}
              <div className="bg-gray-800 rounded-xl p-8 border border-gray-700 mb-8">
                <div className="flex flex-col md:flex-row md:items-center gap-8">
                  <div className="text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                      <span className="text-5xl font-bold text-white">{rating.toFixed(1)}</span>
                      <svg className="w-12 h-12 fill-yellow-500" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    </div>
                    <p className="text-gray-400">
                      {reviewCount} {reviewCount === 1 ? 'отзыв' : reviewCount < 5 ? 'отзыва' : 'отзывов'}
                    </p>
                  </div>

                  <div className="flex-grow">
                    {[5, 4, 3, 2, 1].map((stars) => {
                      const count = author.allReviews.filter((r: any) => r.rating === stars).length
                      const percentage = reviewCount > 0 ? (count / reviewCount) * 100 : 0
                      return (
                        <div key={stars} className="flex items-center gap-3 mb-2">
                          <div className="flex items-center gap-1 w-20">
                            <span className="text-sm text-gray-400">{stars}</span>
                            <svg className="w-4 h-4 fill-yellow-500" viewBox="0 0 24 24">
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                            </svg>
                          </div>
                          <div className="flex-grow bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-yellow-500 h-2 rounded-full transition-all"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-400 w-12 text-right">{count}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Reviews List */}
              {author.allReviews.length > 0 && (
                <div className="space-y-6">
                  {author.allReviews.slice(0, 3).map((review: any) => (
                    <div key={review.id} className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            {[...Array(5)].map((_, i) => (
                              <svg
                                key={i}
                                className={`w-5 h-5 ${i < review.rating ? 'fill-yellow-500' : 'fill-gray-600'}`}
                                viewBox="0 0 24 24"
                              >
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                              </svg>
                            ))}
                          </div>
                          <h3 className="font-semibold text-white">{review.title || 'Отзыв'}</h3>
                        </div>
                        <span className="text-sm text-gray-400">
                          {new Date(review.createdAt).toLocaleDateString('ru-RU')}
                        </span>
                      </div>
                      {review.pros && (
                        <div className="mb-3">
                          <p className="text-sm font-medium text-green-400 mb-1">Плюсы</p>
                          <p className="text-gray-300 text-sm">{review.pros}</p>
                        </div>
                      )}
                      {review.cons && (
                        <div className="mb-3">
                          <p className="text-sm font-medium text-red-400 mb-1">Минусы</p>
                          <p className="text-gray-300 text-sm">{review.cons}</p>
                        </div>
                      )}
                      {review.comment && (
                        <p className="text-gray-300">{review.comment}</p>
                      )}
                      <div className="mt-4 flex items-center gap-2 text-sm text-gray-400">
                        <span className="font-medium text-white">{review.authorName || 'Аноним'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* General Information */}
          <section className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
            <div className="bg-gray-750 px-8 py-6 border-b border-gray-700">
              <h2 className="text-2xl font-bold text-white">
                Общая информация об онлайн-школе
              </h2>
            </div>

            <div className="p-8">
              <div className="space-y-6">
                {/* Description */}
                {author.bio && (
                  <div className="pb-6 border-b border-gray-700">
                    <p className="text-gray-300 leading-relaxed text-lg w-full">
                      {author.bio}
                    </p>
                  </div>
                )}

                {/* Contact Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Phone (if exists in contacts) */}
                  {author.contacts && author.contacts.includes('8') && (
                    <div>
                      <dt className="text-sm font-medium text-gray-400 mb-2">Телефон</dt>
                      <dd className="text-white text-lg font-semibold">
                        {author.contacts.split('\n')[0] || author.contacts}
                      </dd>
                    </div>
                  )}

                  {/* Website */}
                  {author.website && (
                    <div>
                      <dt className="text-sm font-medium text-gray-400 mb-2">Официальный сайт</dt>
                      <dd>
                        <a
                          href={author.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-400 hover:text-primary-300 transition break-all inline-flex items-center gap-1"
                        >
                          {author.website.replace(/^https?:\/\//, '')}
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      </dd>
                    </div>
                  )}

                  {/* Email */}
                  {author.email && (
                    <div>
                      <dt className="text-sm font-medium text-gray-400 mb-2">Email</dt>
                      <dd>
                        <a
                          href={`mailto:${author.email}`}
                          className="text-primary-400 hover:text-primary-300 transition"
                        >
                          {author.email}
                        </a>
                      </dd>
                    </div>
                  )}

                  {/* Personal Account Link */}
                  {author.website && (
                    <div>
                      <dt className="text-sm font-medium text-gray-400 mb-2">Личный кабинет</dt>
                      <dd>
                        <a
                          href={author.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-400 hover:text-primary-300 transition inline-flex items-center gap-1"
                        >
                          Перейти
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      </dd>
                    </div>
                  )}
                </div>

                {/* Full Contacts */}
                {author.contacts && (
                  <div className="pt-6 border-t border-gray-700">
                    <dt className="text-sm font-medium text-gray-400 mb-3">Контакты</dt>
                    <dd className="text-gray-300 whitespace-pre-line leading-relaxed">
                      {author.contacts}
                    </dd>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  )
}

const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-а-яё]+/g, '')
    .replace(/\-\-+/g, '-')
}

// Нормализует URL для сравнения
function normalizeUrl(url) {
  if (!url) return ''
  try {
    const urlObj = new URL(url)
    // Убираем query параметры и trailing slash
    let normalized = `${urlObj.protocol}//${urlObj.host}${urlObj.pathname}`
    normalized = normalized.replace(/\/$/, '') // Убираем trailing slash
    return normalized.toLowerCase()
  } catch (e) {
    // Если не валидный URL, просто убираем trailing slash
    return url.replace(/\/$/, '').toLowerCase()
  }
}

// Извлекает pathname из URL
function getPathname(url) {
  if (!url) return ''
  try {
    const urlObj = new URL(url)
    return urlObj.pathname.replace(/\/$/, '').toLowerCase()
  } catch (e) {
    // Если не валидный URL, пытаемся извлечь путь вручную
    const match = url.match(/https?:\/\/[^\/]+(\/.*)/)
    return match ? match[1].replace(/\/$/, '').toLowerCase() : ''
  }
}

async function main() {
  console.log('🚀 Начинаем обновление курсов: категории и цены...\n')

  // Читаем CSV
  const csvPath = path.join(process.env.USERPROFILE || 'C:\\Users\\Daniil', 'Downloads', 'Курсы - Лист1.csv')
  if (!fs.existsSync(csvPath)) {
    console.error(`❌ Файл не найден: ${csvPath}`)
    console.error(`Проверьте путь к файлу CSV`)
    process.exit(1)
  }

  const csvContent = fs.readFileSync(csvPath, 'utf-8')
  const lines = csvContent.split('\n').filter(l => l.trim())

  // Функция для парсинга CSV строки (учитывает пустые поля)
  function parseCSVLine(line) {
    const parts = []
    let current = ''
    let inQuotes = false
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        parts.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    parts.push(current.trim()) // Последнее поле
    
    // Дополняем до нужного количества полей (минимум 12)
    while (parts.length < 12) {
      parts.push('')
    }
    
    return parts
  }

  // Создаем категории из столбца "тег1"
  console.log('📂 Создаем/обновляем категории из столбца "тег1"...')
  const categorySet = new Set()
  for (let i = 1; i < lines.length; i++) {
    const parts = parseCSVLine(lines[i])
    const categoryName = parts[5]?.trim() // тег1 - это категория
    if (categoryName && categoryName !== '') {
      categorySet.add(categoryName)
    }
  }

  const categoryMap = {}
  let categoryOrder = 0
  for (const categoryName of categorySet) {
    const categorySlug = slugify(categoryName)

    // Проверяем существование категории
    let category = await prisma.category.findUnique({
      where: { slug: categorySlug },
    })

    if (category) {
      // Обновляем порядок
      category = await prisma.category.update({
        where: { id: category.id },
        data: { order: categoryOrder },
      })
    } else {
      // Создаем новую
      category = await prisma.category.create({
        data: {
          name: categoryName,
          slug: categorySlug,
          order: categoryOrder,
        },
      })
    }

    categoryMap[categoryName] = category
    categoryOrder++
    console.log(`  ✓ ${categoryName}`)
  }
  console.log(`✓ Обработано ${Object.keys(categoryMap).length} категорий\n`)

  // Показываем статистику по курсам в базе
  const totalCourses = await prisma.course.count()
  const sampleCourses = await prisma.course.findMany({
    take: 5,
    select: {
      title: true,
      link: true,
    },
  })
  
  console.log(`📊 Всего курсов в базе: ${totalCourses}`)
  
  if (sampleCourses.length > 0) {
    console.log('📋 Примеры URL из базы данных:')
    sampleCourses.forEach(c => {
      console.log(`   - ${c.title}`)
      console.log(`     ${c.link}`)
    })
    console.log('')
  } else {
    console.log('⚠️  В базе данных нет курсов!')
    console.log('   Сначала нужно загрузить курсы из CSV используя скрипт reload-courses-with-categories.js\n')
  }

  // Загружаем все курсы один раз для быстрого поиска
  console.log('📥 Загружаем все курсы из базы...')
  const allCourses = await prisma.course.findMany({
    select: {
      id: true,
      link: true,
      title: true,
    },
  })
  console.log(`✓ Загружено ${allCourses.length} курсов\n`)

  let updated = 0
  let notFound = 0
  let errors = 0

  // Обновляем курсы
  console.log('🔄 Обновляем курсы...\n')
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]
    const parts = parseCSVLine(line)

    const url = parts[0]?.trim()
    if (!url || url === '') continue

    try {
      const pricePerLesson = parts[1]?.trim()
      const priceOneTime = parts[2]?.trim()
      const pricePerMonth = parts[3]?.trim()
      const categoryName = parts[5]?.trim() // тег1 - это категория

      // Нормализуем URL для поиска
      const normalizedUrl = normalizeUrl(url)
      const pathname = getPathname(url)

      // Ищем курс по URL (точное совпадение)
      let course = allCourses.find(c => c.link === url)

      // Если не нашли, пробуем найти по нормализованному URL
      if (!course) {
        // Ищем по нормализованному URL
        course = allCourses.find(c => normalizeUrl(c.link) === normalizedUrl)

        // Если не нашли, пробуем найти по pathname (более гибкий поиск)
        if (!course && pathname) {
          // Ищем курсы, где pathname совпадает или содержит нужный путь
          course = allCourses.find(c => {
            const coursePath = getPathname(c.link)
            if (!coursePath) return false
            
            // Точное совпадение
            if (coursePath === pathname) return true
            
            // Один путь содержит другой (для случаев с/без trailing slash)
            const pathParts = pathname.split('/').filter(p => p)
            const courseParts = coursePath.split('/').filter(p => p)
            
            // Если последние части пути совпадают
            if (pathParts.length > 0 && courseParts.length > 0) {
              const lastPathPart = pathParts[pathParts.length - 1]
              const lastCoursePart = courseParts[courseParts.length - 1]
              if (lastPathPart === lastCoursePart && pathParts.length === courseParts.length) {
                return true
              }
            }
            
            return false
          })
        }
      }

      if (!course) {
        console.log(`⚠️  [${i}/${lines.length - 1}] Курс не найден: ${url}`)
        notFound++
        continue
      }

      // Определяем тип цены и значения
      let priceType = null
      let pricePerLessonValue = null
      let pricePerMonthValue = null
      let priceOneTimeValue = null

      // Парсим все цены
      if (pricePerLesson && pricePerLesson !== '-') {
        pricePerLessonValue = parseFloat(pricePerLesson)
        if (isNaN(pricePerLessonValue)) pricePerLessonValue = null
      }

      if (pricePerMonth && pricePerMonth !== '-') {
        pricePerMonthValue = parseFloat(pricePerMonth)
        if (isNaN(pricePerMonthValue)) pricePerMonthValue = null
      }

      if (priceOneTime && priceOneTime !== '-') {
        priceOneTimeValue = parseFloat(priceOneTime)
        if (isNaN(priceOneTimeValue)) priceOneTimeValue = null
      }

      // Определяем приоритетный тип цены для отображения
      // Приоритет: месяц > урок > курс
      if (pricePerMonthValue !== null) {
        priceType = 'PER_MONTH'
      } else if (pricePerLessonValue !== null) {
        priceType = 'PER_LESSON'
      } else if (priceOneTimeValue !== null) {
        priceType = 'ONE_TIME'
      }

      // Получаем категорию
      const category = categoryName ? categoryMap[categoryName] : null

      // Обновляем курс
      await prisma.course.update({
        where: { id: course.id },
        data: {
          pricePerLesson: pricePerLessonValue,
          pricePerMonth: pricePerMonthValue,
          priceOneTime: priceOneTimeValue,
          priceType: priceType,
          categoryId: category?.id || null,
        },
      })

      console.log(`✅ [${i}/${lines.length - 1}] Обновлен: ${course.title}`)
      console.log(`   Категория: ${categoryName || 'нет'}`)
      console.log(`   Цена за урок: ${pricePerLessonValue || '-'}`)
      console.log(`   Цена за месяц: ${pricePerMonthValue || '-'}`)
      console.log(`   Цена за курс: ${priceOneTimeValue || '-'}`)
      console.log(`   Тип цены: ${priceType || '-'}\n`)

      updated++

    } catch (error) {
      console.error(`❌ [${i}/${lines.length - 1}] Ошибка: ${error.message}`)
      errors++
    }
  }

  console.log('\n' + '='.repeat(50))
  console.log(`✅ Обновлено: ${updated}`)
  console.log(`⚠️  Не найдено: ${notFound}`)
  console.log(`❌ Ошибок: ${errors}`)
  console.log(`📊 Всего обработано: ${lines.length - 1}`)
  console.log(`📂 Категорий: ${Object.keys(categoryMap).length}`)
  console.log('='.repeat(50))

  await prisma.$disconnect()
}

main().catch(console.error)


const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')
const https = require('https')
const http = require('http')

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

async function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http

    const request = protocol.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        downloadImage(response.headers.location, filepath)
          .then(resolve)
          .catch(reject)
        return
      }

      if (response.statusCode !== 200) {
        reject(new Error(`Status: ${response.statusCode}`))
        return
      }

      const fileStream = fs.createWriteStream(filepath)
      response.pipe(fileStream)

      fileStream.on('finish', () => {
        fileStream.close()
        resolve(filepath)
      })

      fileStream.on('error', (err) => {
        fs.unlink(filepath, () => {})
        reject(err)
      })
    })

    request.on('error', reject)
    request.setTimeout(30000, () => {
      request.destroy()
      reject(new Error('Timeout'))
    })
  })
}

function getSchoolFromUrl(url) {
  if (url.includes('skyeng.ru')) return 'skyeng'
  if (url.includes('skysmart.ru') || url.includes('english.skysmart.ru') || url.includes('programmirovanie.skysmart.ru')) return 'skysmart'
  if (url.includes('sky.pro')) return 'skypro'
  return null
}

function extractTitle(url, primaryTag, tags) {
  // Приоритет: первый тег (категория), потом остальные теги
  if (primaryTag) return primaryTag
  if (tags && tags.length > 0 && tags[0]) return tags[0]
  return 'Курс'
}

async function main() {
  console.log('🚀 Начинаем перезагрузку курсов с категориями...\n')

  // Удаляем все старые курсы
  console.log('🗑️  Удаляем старые курсы...')
  await prisma.courseTag.deleteMany({})
  await prisma.course.deleteMany({})
  console.log('✓ Курсы удалены\n')

  const uploadDir = path.join(__dirname, '..', 'public', 'uploads', 'courses')
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true })
  }

  // Находим школы
  console.log('📚 Загружаем школы...')
  const schools = {
    skyeng: await prisma.author.findUnique({ where: { slug: 'skyeng' } }),
    skysmart: await prisma.author.findUnique({ where: { slug: 'skysmart' } }),
    skypro: await prisma.author.findUnique({ where: { slug: 'skypro' } }),
  }
  console.log('✓ Школы загружены\n')

  // Читаем CSV
  const csvPath = path.join('c:', 'Users', 'Daniil', 'Downloads', 'Курсы - Лист1.csv')
  const csvContent = fs.readFileSync(csvPath, 'utf-8')
  const lines = csvContent.split('\n').filter(l => l.trim())

  // Собираем уникальные категории из столбца "тег1" (это категория)
  console.log('📂 Создаем категории...')
  const categorySet = new Set()
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(',')
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

  let success = 0
  let errors = 0

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]
    const parts = line.split(',')

    const url = parts[0]?.trim()
    if (!url || url === '') continue

    try {
      const pricePerLesson = parts[1]?.trim()
      const priceOneTime = parts[2]?.trim()
      const pricePerMonth = parts[3]?.trim()
      const primaryTag = parts[4]?.trim() // Основной тег
      const categoryName = parts[5]?.trim() // тег1 - это категория
      const tags = [
        parts[4], // тег
        parts[6], // тег2
        parts[7], // тег3
        parts[8], // тег4
        parts[9], // тег5
        parts[10], // тег6
      ].filter(t => t && t.trim() && t.trim() !== '')

      const imageUrl = parts[11]?.trim()

      const schoolKey = getSchoolFromUrl(url)
      if (!schoolKey) {
        console.log(`⚠️  [${i}/${lines.length - 1}] Пропускаем (неизвестная школа): ${url}`)
        continue
      }

      const school = schools[schoolKey]
      const title = extractTitle(url, primaryTag, tags)

      console.log(`\n📝 [${i}/${lines.length - 1}] ${title}`)
      console.log(`   Школа: ${school.name}`)
      console.log(`   Категория: ${categoryName || 'нет'}`)

      // Генерируем slug
      let slug = slugify(title)
      let counter = 1
      while (await prisma.course.findUnique({ where: { slug } })) {
        slug = `${slugify(title)}-${counter}`
        counter++
      }

      // Определяем цены и тип
      let displayPrice = null
      let priceType = null

      if (pricePerLesson && pricePerLesson !== '-') {
        displayPrice = parseFloat(pricePerLesson)
        priceType = 'PER_LESSON'
      } else if (pricePerMonth && pricePerMonth !== '-') {
        displayPrice = parseFloat(pricePerMonth)
        priceType = 'PER_MONTH'
      } else if (priceOneTime && priceOneTime !== '-') {
        displayPrice = parseFloat(priceOneTime)
        priceType = 'ONE_TIME'
      }

      // Скачиваем изображение
      let imagePath = null
      if (imageUrl && imageUrl !== '') {
        try {
          const imageFilename = `${Date.now()}-${slug}.png`
          const imageFilePath = path.join(uploadDir, imageFilename)

          await downloadImage(imageUrl, imageFilePath)
          imagePath = `/uploads/courses/${imageFilename}`
          console.log(`   ✓ Изображение скачано`)
        } catch (err) {
          console.log(`   ⚠️  Не удалось скачать изображение: ${err.message}`)
        }
      }

      // Получаем категорию из тег1
      const category = categoryName ? categoryMap[categoryName] : null

      console.log(`   Теги: ${tags.join(', ')}`)
      console.log(`   Тип цены: ${priceType || 'нет'}`)

      // Создаем курс
      const course = await prisma.course.create({
        data: {
          title,
          slug,
          link: url,
          price: displayPrice,
          pricePerLesson: pricePerLesson && pricePerLesson !== '-' ? parseFloat(pricePerLesson) : null,
          pricePerMonth: pricePerMonth && pricePerMonth !== '-' ? parseFloat(pricePerMonth) : null,
          priceOneTime: priceOneTime && priceOneTime !== '-' ? parseFloat(priceOneTime) : null,
          priceType,
          image: imagePath,
          status: 'APPROVED',
          authorId: school.id,
          categoryId: category?.id || null,
          submittedByName: 'Автоматический импорт',
          submittedByEmail: 'import@system.local',
          publishedAt: new Date(),
        },
      })

      // Создаем теги
      for (const tagName of tags) {
        if (!tagName) continue

        const tagSlug = slugify(tagName.trim())
        const tag = await prisma.tag.upsert({
          where: { slug: tagSlug },
          update: {},
          create: {
            name: tagName.trim(),
            slug: tagSlug,
          },
        })

        await prisma.courseTag.create({
          data: {
            courseId: course.id,
            tagId: tag.id,
          },
        }).catch(() => {})
      }

      console.log(`   ✅ Курс создан!`)
      success++

    } catch (error) {
      console.error(`   ❌ Ошибка: ${error.message}`)
      errors++
    }
  }

  console.log('\n' + '='.repeat(50))
  console.log(`✅ Успешно: ${success}`)
  console.log(`❌ Ошибок: ${errors}`)
  console.log(`📊 Всего обработано: ${lines.length - 1}`)
  console.log(`📂 Категорий создано: ${Object.keys(categoryMap).length}`)
  console.log('='.repeat(50))

  await prisma.$disconnect()
}

main().catch(console.error)

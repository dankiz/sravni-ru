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

function extractTitle(url, tags) {
  const titleMap = {
    'ispanskij': 'Испанский язык',
    'francuzskij': 'Французский язык',
    'kitajskij': 'Китайский язык',
    'korejskij': 'Корейский язык',
    'nemeckij': 'Немецкий язык',
    'italyanskij': 'Итальянский язык',
    'portugalskij': 'Португальский язык',
    'tureckij': 'Турецкий язык',
    'yaponskij': 'Японский язык',
    'grecheskij': 'Греческий язык',
  }

  try {
    const urlObj = new URL(url)
    const segments = urlObj.pathname.split('/').filter(Boolean)
    const lastSegment = segments[segments.length - 1]

    if (titleMap[lastSegment]) {
      return titleMap[lastSegment]
    }
  } catch (e) {}

  if (tags && tags.length > 0 && tags[0]) {
    return tags[0]
  }

  return 'Курс'
}

async function main() {
  console.log('🚀 Начинаем загрузку курсов из CSV...\n')

  const uploadDir = path.join(__dirname, '..', 'public', 'uploads', 'courses')
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true })
  }

  // Создаем/находим школы
  console.log('📚 Создаем школы...')
  const schools = {
    skyeng: await prisma.author.upsert({
      where: { slug: 'skyeng' },
      update: {},
      create: {
        name: 'Skyeng',
        slug: 'skyeng',
        bio: 'Skyeng — онлайн-школа английского языка',
        website: 'https://skyeng.ru',
      },
    }),
    skysmart: await prisma.author.findUnique({ where: { slug: 'skysmart' } }),
    skypro: await prisma.author.upsert({
      where: { slug: 'skypro' },
      update: {},
      create: {
        name: 'Sky.Pro',
        slug: 'skypro',
        bio: 'Sky.Pro — онлайн-университет для освоения digital-профессий',
        website: 'https://sky.pro',
      },
    }),
  }

  console.log('✓ Школы готовы\n')

  // Читаем CSV
  const csvPath = path.join('c:', 'Users', 'Daniil', 'Downloads', 'Курсы - Лист1.csv')
  const csvContent = fs.readFileSync(csvPath, 'utf-8')
  const lines = csvContent.split('\n').filter(l => l.trim())

  let success = 0
  let errors = 0

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]
    const parts = line.split(',')

    const url = parts[0]?.trim()
    if (!url || url === '') continue

    try {
      const pricePerLesson = parts[1]?.trim()
      const pricePerCourse = parts[2]?.trim()
      const pricePerMonth = parts[3]?.trim()
      const tags = [
        parts[4],
        parts[5],
        parts[6],
        parts[7],
        parts[8],
        parts[9],
        parts[10],
      ].filter(t => t && t.trim() && t.trim() !== '')

      const imageUrl = parts[11]?.trim()

      const schoolKey = getSchoolFromUrl(url)
      if (!schoolKey) {
        console.log(`⚠️  [${i}/${lines.length - 1}] Пропускаем (неизвестная школа): ${url}`)
        continue
      }

      const school = schools[schoolKey]
      const title = extractTitle(url, tags)

      console.log(`\n📝 [${i}/${lines.length - 1}] ${title}`)
      console.log(`   Школа: ${school.name}`)
      console.log(`   URL: ${url}`)

      // Генерируем slug
      let slug = slugify(title)
      let counter = 1
      while (await prisma.course.findUnique({ where: { slug } })) {
        slug = `${slugify(title)}-${counter}`
        counter++
      }

      // Определяем цену
      let price = null
      if (pricePerMonth && pricePerMonth !== '-') price = parseFloat(pricePerMonth)
      else if (pricePerCourse && pricePerCourse !== '-') price = parseFloat(pricePerCourse)
      else if (pricePerLesson && pricePerLesson !== '-') price = parseFloat(pricePerLesson)

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

      console.log(`   Теги: ${tags.join(', ')}`)

      // Создаем курс без тегов
      const course = await prisma.course.create({
        data: {
          title,
          slug,
          link: url,
          price,
          image: imagePath,
          status: 'APPROVED',
          authorId: school.id,
          submittedByName: 'Автоматический импорт',
          submittedByEmail: 'import@system.local',
          publishedAt: new Date(),
        },
      })

      // Теперь создаем связи с тегами
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

        // Создаем связь через CourseTag
        await prisma.courseTag.create({
          data: {
            courseId: course.id,
            tagId: tag.id,
          },
        }).catch(() => {
          // Игнорируем ошибки дубликатов
        })
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
  console.log('='.repeat(50))

  await prisma.$disconnect()
}

main().catch(console.error)

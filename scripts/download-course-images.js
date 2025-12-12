const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')
const https = require('https')
const http = require('http')

// Пытаемся загрузить xlsx, но не критично, если его нет (можно использовать CSV)
let XLSX = null
try {
  XLSX = require('xlsx')
} catch (e) {
  // Библиотека не установлена, будем работать только с CSV
}

const prisma = new PrismaClient()

// Функция для нормализации URL
function normalizeUrl(url) {
  try {
    const urlObj = new URL(url)
    let pathname = urlObj.pathname
    if (pathname.endsWith('/')) {
      pathname = pathname.slice(0, -1)
    }
    return urlObj.origin + pathname
  } catch (e) {
    return url
  }
}

// Функция для скачивания изображения
async function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http

    const request = protocol.get(url, (response) => {
      // Обработка редиректов
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

// Функция для получения расширения файла из URL или Content-Type
function getImageExtension(url, contentType) {
  // Пробуем определить по Content-Type
  if (contentType) {
    if (contentType.includes('jpeg') || contentType.includes('jpg')) return '.jpg'
    if (contentType.includes('png')) return '.png'
    if (contentType.includes('gif')) return '.gif'
    if (contentType.includes('webp')) return '.webp'
  }
  
  // Пробуем определить по URL
  const urlLower = url.toLowerCase()
  if (urlLower.includes('.jpg') || urlLower.includes('.jpeg')) return '.jpg'
  if (urlLower.includes('.png')) return '.png'
  if (urlLower.includes('.gif')) return '.gif'
  if (urlLower.includes('.webp')) return '.webp'
  
  // По умолчанию PNG
  return '.png'
}

// Функция для получения реального URL изображения со скриншотера
async function getImageUrlFromScreenshoter(screenshotUrl) {
  return new Promise((resolve, reject) => {
    // Проверяем, не является ли URL уже прямой ссылкой на изображение
    const urlLower = screenshotUrl.toLowerCase()
    if (urlLower.match(/\.(jpg|jpeg|png|gif|webp)(\?|$)/i)) {
      resolve(screenshotUrl)
      return
    }

    const protocol = screenshotUrl.startsWith('https') ? https : http

    const request = protocol.get(screenshotUrl, (response) => {
      // Если это редирект, следуем за ним
      if (response.statusCode === 301 || response.statusCode === 302) {
        const location = response.headers.location
        if (location) {
          getImageUrlFromScreenshoter(location)
            .then(resolve)
            .catch(reject)
          return
        }
      }

      // Если Content-Type указывает на изображение, это прямая ссылка
      const contentType = response.headers['content-type'] || ''
      if (contentType.startsWith('image/')) {
        resolve(screenshotUrl)
        return
      }

      let data = ''
      response.on('data', (chunk) => {
        data += chunk
        // Ограничиваем размер данных для безопасности
        if (data.length > 1024 * 1024) { // 1MB
          request.destroy()
          reject(new Error('Response too large'))
        }
      })

      response.on('end', () => {
        // Пытаемся найти URL изображения в HTML
        // Ищем различные варианты: img src, meta og:image, и т.д.
        let imgUrl = null

        // Вариант 1: <img id="screenshot-image" ...> (приоритет для скриншотеров)
        // Ищем img с id="screenshot-image", атрибуты могут быть в любом порядке
        const screenshotImgMatch = data.match(/<img[^>]*id=["']screenshot-image["'][^>]*>/i)
        if (screenshotImgMatch) {
          // Извлекаем src из найденного тега
          const srcMatch = screenshotImgMatch[0].match(/src=["']([^"']+)["']/i)
          if (srcMatch && srcMatch[1]) {
            imgUrl = srcMatch[1]
          }
        }

        // Вариант 2: Любой <img src="..."> (но не из рекламы/трекинга)
        if (!imgUrl) {
          // Ищем все img теги и выбираем самый подходящий
          const imgMatches = data.matchAll(/<img[^>]+src=["']([^"']+)["']/gi)
          for (const match of imgMatches) {
            const url = match[1]
            // Пропускаем рекламу, трекинг и другие служебные изображения
            if (url.includes('yandex.ru') || 
                url.includes('mc.yandex.ru') || 
                url.includes('google-analytics') ||
                url.includes('doubleclick') ||
                url.includes('advertising') ||
                url.includes('tracking') ||
                url.includes('pixel') ||
                url.includes('beacon') ||
                url.match(/^data:/i)) {
              continue
            }
            // Если URL содержит путь к скриншоту (s/ или /s/), это наше изображение
            if (url.includes('/s/') || url.includes('skrinshoter.ru')) {
              imgUrl = url
              break
            }
            // Если это первый нормальный URL, сохраняем его
            if (!imgUrl && url.startsWith('http')) {
              imgUrl = url
            }
          }
        }

        // Вариант 3: <meta property="og:image" content="...">
        if (!imgUrl) {
          const ogMatch = data.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
          if (ogMatch && ogMatch[1]) {
            imgUrl = ogMatch[1]
          }
        }

        // Вариант 4: data-src или data-lazy-src (ленивая загрузка)
        if (!imgUrl) {
          const dataSrcMatch = data.match(/<img[^>]+data-(?:lazy-)?src=["']([^"']+)["']/i)
          if (dataSrcMatch && dataSrcMatch[1]) {
            imgUrl = dataSrcMatch[1]
          }
        }

        if (imgUrl) {
          // Декодируем HTML-entities
          imgUrl = imgUrl
            .replace(/&amp;/g, '&')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')

          // Если относительный URL, делаем его абсолютным
          if (imgUrl.startsWith('//')) {
            resolve('https:' + imgUrl)
          } else if (imgUrl.startsWith('/')) {
            const urlObj = new URL(screenshotUrl)
            resolve(urlObj.origin + imgUrl)
          } else if (imgUrl.startsWith('http')) {
            resolve(imgUrl)
          } else {
            // Относительный путь
            const urlObj = new URL(screenshotUrl)
            resolve(new URL(imgUrl, urlObj.origin).href)
          }
        } else {
          // Если не нашли в HTML, пробуем сам URL как изображение
          resolve(screenshotUrl)
        }
      })
    })

    request.on('error', reject)
    request.setTimeout(15000, () => {
      request.destroy()
      reject(new Error('Timeout'))
    })
  })
}

async function main() {
  console.log('🚀 Начинаем загрузку изображений для курсов...\n')

  // Путь к Excel файлу
  const excelPath = path.join(
    process.env.USERPROFILE || process.env.HOME || 'C:\\Users\\Daniil',
    'Downloads',
    'images.xlsx'
  )

  // Альтернативные пути
  const altExcelPath = path.join(process.cwd(), 'images.xlsx')
  const csvPath = path.join(
    process.env.USERPROFILE || process.env.HOME || 'C:\\Users\\Daniil',
    'Downloads',
    'images.csv'
  )
  const altCsvPath = path.join(process.cwd(), 'images.csv')

  let filePath = null
  let isCsv = false

  // Ищем файл
  if (fs.existsSync(excelPath)) {
    filePath = excelPath
  } else if (fs.existsSync(altExcelPath)) {
    filePath = altExcelPath
  } else if (fs.existsSync(csvPath)) {
    filePath = csvPath
    isCsv = true
  } else if (fs.existsSync(altCsvPath)) {
    filePath = altCsvPath
    isCsv = true
  } else {
    console.error('❌ Файл images.xlsx или images.csv не найден!')
    console.error(`   Искали в: ${excelPath}`)
    console.error(`   Искали в: ${altExcelPath}`)
    console.error(`   Искали в: ${csvPath}`)
    console.error(`   Искали в: ${altCsvPath}`)
    console.error('\n   Поместите файл images.xlsx или images.csv в папку Downloads или в корень проекта')
    process.exit(1)
  }

  console.log(`📂 Читаем файл: ${filePath}\n`)

  let rows = []

  if (isCsv) {
    // Читаем CSV файл
    const content = fs.readFileSync(filePath, 'utf-8')
    const lines = content.split('\n').filter(line => line.trim())
    
    for (const line of lines) {
      // Простой парсинг CSV (разделитель - табуляция или запятая)
      const parts = line.split(/\t|,/)
      if (parts.length >= 2) {
        rows.push([parts[0].trim(), parts[1].trim()])
      }
    }
  } else {
    // Читаем Excel файл
    if (!XLSX) {
      console.error('❌ Для работы с Excel файлами необходимо установить библиотеку xlsx')
      console.error('   Выполните: npm install xlsx')
      console.error('   Или сохраните файл в формате CSV (images.csv)')
      process.exit(1)
    }
    const workbook = XLSX.readFile(filePath)
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
  }

  if (rows.length < 2) {
    console.error('❌ Файл пуст или содержит только заголовки')
    process.exit(1)
  }

  console.log(`📊 Найдено строк: ${rows.length - 1}\n`)

  // Создаем папку для загрузок
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'courses')
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true })
  }

  // Получаем все курсы из базы данных для быстрого поиска
  console.log('📚 Загружаем курсы из базы данных...')
  const allCourses = await prisma.course.findMany({
    select: { id: true, link: true, title: true, image: true },
  })

  const normalizedCourses = allCourses.map(course => ({
    ...course,
    normalizedLink: normalizeUrl(course.link),
    pathname: new URL(course.link).pathname.replace(/\/$/, '')
  }))

  console.log(`✓ Загружено курсов: ${normalizedCourses.length}\n`)

  let successCount = 0
  let errorCount = 0
  let notFoundCount = 0
  let skippedCount = 0

  // Обрабатываем каждую строку (пропускаем заголовок, если есть)
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i]
    
    if (!row || row.length < 2) {
      console.log(`⚠️  [${i}/${rows.length - 1}] Пропущена пустая строка`)
      skippedCount++
      continue
    }

    const courseUrl = String(row[0] || '').trim()
    const screenshotUrl = String(row[1] || '').trim()

    if (!courseUrl || !screenshotUrl) {
      console.log(`⚠️  [${i}/${rows.length - 1}] Пропущена строка с пустыми значениями`)
      skippedCount++
      continue
    }

    console.log(`\n[${i}/${rows.length - 1}] Обрабатываем:`)
    console.log(`   URL курса: ${courseUrl}`)
    console.log(`   URL скриншота: ${screenshotUrl}`)

    try {
      // Нормализуем URL курса
      const normalizedCourseUrl = normalizeUrl(courseUrl)

      // Ищем курс в базе данных
      let course = normalizedCourses.find(
        dbCourse => dbCourse.normalizedLink === normalizedCourseUrl
      )

      // Если не нашли по полному URL, пробуем по pathname
      if (!course) {
        const coursePathname = new URL(courseUrl).pathname.replace(/\/$/, '')
        course = normalizedCourses.find(
          dbCourse => dbCourse.pathname === coursePathname
        )
      }

      if (!course) {
        console.log(`   ❌ Курс не найден в базе данных`)
        notFoundCount++
        continue
      }

      console.log(`   ✓ Найден курс: ${course.title}`)

      // Получаем реальный URL изображения со скриншотера
      let imageUrl = screenshotUrl
      try {
        console.log(`   🔍 Получаем URL изображения со скриншотера...`)
        imageUrl = await getImageUrlFromScreenshoter(screenshotUrl)
        console.log(`   ✓ URL изображения: ${imageUrl}`)
      } catch (err) {
        console.log(`   ⚠️  Не удалось получить URL изображения, используем исходный URL: ${err.message}`)
        // Продолжаем с исходным URL
      }

      // Скачиваем изображение
      try {
        const imageExt = getImageExtension(imageUrl, null)
        const imageFilename = `${Date.now()}-${course.id}${imageExt}`
        const imageFilePath = path.join(uploadDir, imageFilename)

        console.log(`   ⬇️  Скачиваем изображение...`)
        await downloadImage(imageUrl, imageFilePath)
        const imagePath = `/uploads/courses/${imageFilename}`
        console.log(`   ✓ Изображение сохранено: ${imagePath}`)

        // Обновляем курс в базе данных
        await prisma.course.update({
          where: { id: course.id },
          data: { image: imagePath },
        })

        console.log(`   ✅ Курс обновлен!`)
        successCount++
      } catch (err) {
        console.log(`   ❌ Ошибка при скачивании изображения: ${err.message}`)
        errorCount++
      }

      // Небольшая задержка между запросами, чтобы не перегружать сервер
      await new Promise(resolve => setTimeout(resolve, 500))
    } catch (error) {
      console.log(`   ❌ Ошибка: ${error.message}`)
      errorCount++
    }
  }

  console.log('\n' + '='.repeat(50))
  console.log('📊 Итоги:')
  console.log(`   ✅ Успешно обновлено: ${successCount}`)
  console.log(`   ⚠️  Не найдено курсов: ${notFoundCount}`)
  console.log(`   ❌ Ошибок: ${errorCount}`)
  console.log(`   ⏭️  Пропущено: ${skippedCount}`)
  console.log('='.repeat(50))

  await prisma.$disconnect()
}

main()
  .catch((error) => {
    console.error('❌ Критическая ошибка:', error)
    process.exit(1)
  })


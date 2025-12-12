const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')
const https = require('https')
const http = require('http')

const prisma = new PrismaClient()

// Helper function to slugify strings
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-а-яё]+/g, '')
    .replace(/\-\-+/g, '-')
}

// Helper function to download image
async function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http

    protocol.get(url, (response) => {
      // Handle redirects
      if (response.statusCode === 301 || response.statusCode === 302) {
        downloadImage(response.headers.location, filepath)
          .then(resolve)
          .catch(reject)
        return
      }

      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download image: ${response.statusCode}`))
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
    }).on('error', reject)
  })
}

// Helper function to determine school from URL
function getSchoolFromUrl(url) {
  if (url.includes('skyeng.ru')) return 'skyeng'
  if (url.includes('skysmart.ru')) return 'skysmart'
  if (url.includes('sky.pro')) return 'skypro'
  return null
}

// Helper function to extract course title from URL
function extractTitleFromUrl(url, tags) {
  // Try to get from URL path
  const urlPath = new URL(url).pathname
  const segments = urlPath.split('/').filter(Boolean)

  // If we have a meaningful last segment, use it
  if (segments.length > 0) {
    const lastSegment = segments[segments.length - 1]

    // Common patterns to convert to titles
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
      'matematika': 'Математика',
      'fizika': 'Физика',
      'himiya': 'Химия',
      'russkij-yazyk': 'Русский язык',
      'anglijskij-yazyk': 'Английский язык',
      'obshestvoznanie': 'Обществознание',
    }

    if (titleMap[lastSegment]) {
      return titleMap[lastSegment]
    }
  }

  // Fall back to first non-empty tag
  if (tags && tags.length > 0 && tags[0]) {
    return tags[0]
  }

  // Last resort: use URL domain + path
  return url
}

// Parse CSV manually (simple parser)
function parseCSV(content) {
  const lines = content.split('\n')
  const headers = lines[0].split(',')
  const data = []

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue

    const values = lines[i].split(',')
    const row = {}

    headers.forEach((header, index) => {
      row[header.trim()] = values[index] ? values[index].trim() : ''
    })

    data.push(row)
  }

  return data
}

// Main import function
async function importCoursesFromCSV() {
  try {
    console.log('Starting CSV import...')

    // Read CSV file
    const csvPath = path.join(__dirname, '..', '..', 'Downloads', 'Курсы - Лист1.csv')
    const csvContent = fs.readFileSync(csvPath, 'utf-8')
    const rows = parseCSV(csvContent)

    console.log(`Found ${rows.length} rows in CSV`)

    // Create upload directory if it doesn't exist
    const uploadDir = path.join(__dirname, '..', 'public', 'uploads', 'courses')
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }

    // Get or create schools
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
      skysmart: await prisma.author.upsert({
        where: { slug: 'skysmart' },
        update: {},
        create: {
          name: 'Skysmart',
          slug: 'skysmart',
          bio: 'Skysmart — современная онлайн-школа для детей и подростков',
          website: 'https://skysmart.ru',
        },
      }),
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

    console.log('Schools ready:', Object.keys(schools))

    let successCount = 0
    let skipCount = 0
    let errorCount = 0

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      const url = row['url']

      // Skip empty rows or rows without URL
      if (!url || url === '') {
        skipCount++
        continue
      }

      try {
        console.log(`\n[${i + 1}/${rows.length}] Processing: ${url}`)

        // Determine school
        const schoolKey = getSchoolFromUrl(url)
        if (!schoolKey) {
          console.log(`  ⚠ Could not determine school for ${url}`)
          skipCount++
          continue
        }

        const school = schools[schoolKey]

        // Extract tags
        const tags = [
          row['тег'],
          row['тег1'],
          row['тег2'],
          row['тег3'],
          row['тег4'],
          row['тег5'],
          row['тег6'],
        ].filter(tag => tag && tag !== '')

        // Extract title
        const title = extractTitleFromUrl(url, tags)
        console.log(`  Title: ${title}`)
        console.log(`  School: ${school.name}`)
        console.log(`  Tags: ${tags.join(', ')}`)

        // Generate slug
        const baseSlug = slugify(title)
        let slug = baseSlug
        let counter = 1

        while (await prisma.course.findUnique({ where: { slug } })) {
          slug = `${baseSlug}-${counter}`
          counter++
        }

        // Determine price
        let price = null
        const pricePerLesson = row['цена за урок(руб.)']
        const pricePerCourse = row['цена за курс']
        const pricePerMonth = row['Цена в месяц']

        if (pricePerMonth && pricePerMonth !== '-') {
          price = parseFloat(pricePerMonth)
        } else if (pricePerCourse && pricePerCourse !== '-') {
          price = parseFloat(pricePerCourse)
        } else if (pricePerLesson && pricePerLesson !== '-') {
          price = parseFloat(pricePerLesson)
        }

        console.log(`  Price: ${price}`)

        // Download image
        let imagePath = null
        const imageUrl = row['url картинки']

        if (imageUrl && imageUrl !== '') {
          try {
            const imageExt = '.png'
            const imageFilename = `${Date.now()}-${slug}${imageExt}`
            const imageFilePath = path.join(uploadDir, imageFilename)

            console.log(`  Downloading image from: ${imageUrl}`)
            await downloadImage(imageUrl, imageFilePath)
            imagePath = `/uploads/courses/${imageFilename}`
            console.log(`  ✓ Image saved: ${imagePath}`)
          } catch (err) {
            console.log(`  ⚠ Failed to download image: ${err.message}`)
          }
        }

        // Create or find tags
        const tagConnections = []
        for (const tagName of tags) {
          if (!tagName) continue

          const tagSlug = slugify(tagName)

          const tag = await prisma.tag.upsert({
            where: { slug: tagSlug },
            update: {},
            create: {
              name: tagName,
              slug: tagSlug,
            },
          })

          tagConnections.push({ id: tag.id })
        }

        // Create course
        const course = await prisma.course.create({
          data: {
            title,
            slug,
            link: url,
            price,
            image: imagePath,
            status: 'PUBLISHED',
            authorId: school.id,
            submittedByName: 'CSV Import',
            submittedByEmail: 'import@skysmart.ru',
            tags: {
              connect: tagConnections,
            },
          },
        })

        console.log(`  ✓ Course created: ${course.id}`)
        successCount++

      } catch (error) {
        console.error(`  ✗ Error processing row ${i + 1}:`, error.message)
        errorCount++
      }
    }

    console.log('\n=== Import Summary ===')
    console.log(`Success: ${successCount}`)
    console.log(`Skipped: ${skipCount}`)
    console.log(`Errors: ${errorCount}`)
    console.log(`Total: ${rows.length}`)

  } catch (error) {
    console.error('Fatal error during import:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run import
importCoursesFromCSV()

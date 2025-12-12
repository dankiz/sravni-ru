const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

// Функция для генерации случайного числа в диапазоне (для рейтинга)
function randomRating(min, max) {
  return Math.round((Math.random() * (max - min) + min) * 10) / 10
}

// Функция для генерации случайного целого числа в диапазоне (для количества отзывов)
function randomReviewCount(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

async function main() {
  console.log('🚀 Начинаем установку случайных рейтингов и количества отзывов для курсов...\n')

  try {
    // Получаем все курсы
    const courses = await prisma.course.findMany({
      select: {
        id: true,
        title: true,
        averageRating: true,
        reviewCount: true,
      },
    })

    console.log(`📚 Найдено курсов: ${courses.length}\n`)

    if (courses.length === 0) {
      console.log('⚠️  Курсы не найдены')
      return
    }

    let updatedCount = 0
    let errorCount = 0

    // Обновляем каждый курс
    for (let i = 0; i < courses.length; i++) {
      const course = courses[i]
      const newRating = randomRating(4.1, 4.8)
      const newReviewCount = randomReviewCount(3, 18)

      try {
        await prisma.course.update({
          where: { id: course.id },
          data: {
            averageRating: newRating,
            reviewCount: newReviewCount,
          },
        })

        console.log(`[${i + 1}/${courses.length}] ✓ ${course.title}`)
        console.log(`   Рейтинг: ${course.averageRating || 0} → ${newRating.toFixed(1)}`)
        console.log(`   Отзывов: ${course.reviewCount || 0} → ${newReviewCount}`)
        updatedCount++
      } catch (error) {
        console.log(`[${i + 1}/${courses.length}] ❌ ${course.title}`)
        console.log(`   Ошибка: ${error.message}`)
        errorCount++
      }
    }

    console.log('\n' + '='.repeat(50))
    console.log('📊 Итоги:')
    console.log(`   ✅ Успешно обновлено: ${updatedCount}`)
    console.log(`   ❌ Ошибок: ${errorCount}`)
    console.log('='.repeat(50))
  } catch (error) {
    console.error('❌ Критическая ошибка:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()


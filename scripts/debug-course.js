const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const slug = 'курсы-программирования-skysmart';

  console.log('Ищем курс с slug:', slug);
  console.log('Длина slug:', slug.length);
  console.log('Символы:', slug.split('').map(c => `${c}(${c.charCodeAt(0)})`).join(' '));
  console.log('');

  const course = await prisma.course.findUnique({
    where: { slug: slug },
  });

  if (course) {
    console.log('✅ Курс найден:');
    console.log('ID:', course.id);
    console.log('Title:', course.title);
    console.log('Slug:', course.slug);
    console.log('Slug length:', course.slug.length);
    console.log('Status:', course.status);
    console.log('Slug bytes:', course.slug.split('').map(c => `${c}(${c.charCodeAt(0)})`).join(' '));
  } else {
    console.log('❌ Курс НЕ найден');

    // Попробуем найти все курсы
    const allCourses = await prisma.course.findMany({
      select: { id: true, slug: true, title: true, status: true },
    });

    console.log('\nВсе курсы в базе:');
    allCourses.forEach(c => {
      console.log(`  - ${c.slug} (${c.status}) - ${c.title}`);
    });
  }
}

main()
  .catch((e) => {
    console.error('Ошибка:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

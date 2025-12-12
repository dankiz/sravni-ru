const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Добавление тестового курса...\n');

  // Находим автора Skysmart
  const author = await prisma.author.findFirst({
    where: { slug: 'skysmart' },
  });

  if (!author) {
    console.log('❌ Автор Skysmart не найден!');
    return;
  }

  // Создаем или обновляем курс с русским slug
  const course = await prisma.course.upsert({
    where: { slug: 'курсы-программирования-skysmart' },
    update: {
      title: 'Курсы программирования Skysmart',
      description: 'Тестовый курс с русским URL для проверки работы кириллических slug',
      link: 'https://skysmart.ru',
      status: 'APPROVED',
    },
    create: {
      title: 'Курсы программирования Skysmart',
      slug: 'курсы-программирования-skysmart',
      description: 'Тестовый курс с русским URL для проверки работы кириллических slug',
      link: 'https://skysmart.ru',
      authorId: author.id,
      status: 'APPROVED',
    },
  });

  console.log('✅ Курс создан/обновлен:');
  console.log(`   Title: ${course.title}`);
  console.log(`   Slug: ${course.slug}`);
  console.log(`   Status: ${course.status}`);
  console.log(`\nПроверьте по URL:`);
  console.log(`   http://localhost:3003/courses/${encodeURIComponent(course.slug)}`);
  console.log(`   или`);
  console.log(`   http://localhost:3003/courses/курсы-программирования-skysmart`);
}

main()
  .catch((e) => {
    console.error('Ошибка:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

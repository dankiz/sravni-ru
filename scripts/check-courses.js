const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Проверка курсов в базе данных...\n');

  const courses = await prisma.course.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  if (courses.length === 0) {
    console.log('❌ В базе данных нет курсов!');
    console.log('\nСоздайте курс через админ-панель:');
    console.log('http://localhost:3000/admin/courses/new');
  } else {
    console.log(`✓ Найдено курсов: ${courses.length}\n`);

    courses.forEach((course, index) => {
      console.log(`${index + 1}. ${course.title}`);
      console.log(`   Slug: ${course.slug}`);
      console.log(`   Status: ${course.status}`);
      console.log(`   URL: http://localhost:3000/courses/${encodeURIComponent(course.slug)}`);
      console.log('');
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

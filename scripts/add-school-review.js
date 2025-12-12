const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Find Skysmart author
  const author = await prisma.author.findUnique({
    where: { slug: 'skysmart' },
  });

  if (!author) {
    console.log('Skysmart author not found');
    return;
  }

  // Create test school review
  const review = await prisma.schoolReview.create({
    data: {
      authorId: author.id,
      authorName: 'Анна Петрова',
      authorEmail: 'anna@example.com',
      rating: 5,
      title: 'Отличная школа для детей',
      pros: 'Профессиональные преподаватели, интересная программа обучения, индивидуальный подход к каждому ученику. Ребенок с удовольствием занимается и показывает хорошие результаты.',
      cons: 'Высокая стоимость занятий. Хотелось бы больше групповых занятий по более доступной цене.',
      comment: 'Мой сын занимается программированием на Python уже 6 месяцев. Очень доволен результатами. Преподаватель всегда находит подход, объясняет понятно. Ребенок создал уже несколько своих проектов.',
      status: 'APPROVED',
      publishedAt: new Date(),
    },
  });

  console.log('School review created:', review);

  // Create another review
  const review2 = await prisma.schoolReview.create({
    data: {
      authorId: author.id,
      authorName: 'Дмитрий Иванов',
      authorEmail: 'dmitry@example.com',
      rating: 4,
      title: 'Хорошая школа, но есть нюансы',
      pros: 'Качественная программа обучения, опытные преподаватели, удобная платформа для занятий. Много практики и реальных проектов.',
      cons: 'Иногда бывают технические проблемы с платформой. Не всегда удобное расписание занятий.',
      comment: 'Дочь занимается созданием игр на Unity. В целом довольны, но бывают сложности с расписанием - хотелось бы больше гибкости.',
      status: 'APPROVED',
      publishedAt: new Date(),
    },
  });

  console.log('Second school review created:', review2);

  // Create third review
  const review3 = await prisma.schoolReview.create({
    data: {
      authorId: author.id,
      authorName: 'Елена Смирнова',
      authorEmail: 'elena@example.com',
      rating: 5,
      title: 'Рекомендую всем!',
      pros: 'Прекрасная школа! Ребенок научился программировать за короткий срок. Преподаватели - настоящие профессионалы. Материал подается в игровой форме, что очень увлекает детей.',
      cons: 'Пока не нашла минусов.',
      comment: 'Сын (9 лет) прошел курс по Scratch и сейчас начал изучать Python. Очень рады, что выбрали именно Skysmart!',
      status: 'APPROVED',
      publishedAt: new Date(),
    },
  });

  console.log('Third school review created:', review3);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

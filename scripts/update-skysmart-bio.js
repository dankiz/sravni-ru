const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Update Skysmart with bio and other info
  const author = await prisma.author.update({
    where: { slug: 'skysmart' },
    data: {
      bio: 'Skysmart — современная онлайн-школа для детей и подростков от 4 до 18 лет. Обучаем программированию, английскому языку, математике и другим школьным предметам. Индивидуальные занятия с преподавателем на интерактивной платформе. Более 1 миллиона учеников по всему миру.',
      website: 'https://skysmart.ru',
      email: 'help@skysmart.ru',
      contacts: `8 (800) 333-23-42
Бесплатный звонок по России

ОАНО ДПО "СКАЕНГ"
ИНН: 9715260854
ОГРН: 1157700016993

Адрес: 109004, г. Москва, Вн. тер. г. муниципальный округ Таганский, ул. Александра Солженицына, д. 23А, стр.4, этаж/помещ. 1/III, ком. 1

Режим работы: Пн-Вс с 10:00 до 22:00 (МСК)`,
    },
  });

  console.log('Skysmart updated:', author);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

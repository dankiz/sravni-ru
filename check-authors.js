const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const authors = await prisma.author.findMany({
    select: { name: true, slug: true }
  });

  console.log('Авторы в базе:');
  authors.forEach(a => console.log(`- ${a.name} (slug: ${a.slug})`));

  await prisma.$disconnect();
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});

// Загружаем переменные окружения из .env.local
const fs = require('fs')
const path = require('path')

// Функция для загрузки .env файла
function loadEnvFile(filePath) {
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf-8')
    content.split('\n').forEach(line => {
      const trimmed = line.trim()
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=')
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').replace(/^["']|["']$/g, '')
          process.env[key.trim()] = value.trim()
        }
      }
    })
  }
}

// Загружаем .env.local и .env
loadEnvFile(path.join(__dirname, '..', '.env.local'))
loadEnvFile(path.join(__dirname, '..', '.env'))

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

// Проверяем что DATABASE_URL установлен
if (!process.env.DATABASE_URL) {
  console.error('')
  console.error('❌ ОШИБКА: DATABASE_URL не найден!')
  console.error('')
  console.error('═══════════════════════════════════════════════════════════════')
  console.error('РЕШЕНИЕ:')
  console.error('═══════════════════════════════════════════════════════════════')
  console.error('')
  console.error('1. Убедитесь что файл .env.local существует в корне проекта:')
  console.error('   C:\\Users\\Daniil\\Desktop\\Скрипты\\Skysmart\\sravni.ru\\.env.local')
  console.error('')
  console.error('2. Файл должен содержать:')
  console.error('   DATABASE_URL="postgresql://postgres:ВАШ_ПАРОЛЬ@localhost:5432/sravni_ru?schema=public"')
  console.error('   NEXTAUTH_URL="http://localhost:3000"')
  console.error('   NEXTAUTH_SECRET="local-dev-key-12345"')
  console.error('   ADMIN_EMAIL="admin@example.com"')
  console.error('   ADMIN_PASSWORD="admin123"')
  console.error('')
  console.error('3. ⚠️ ВАЖНО: Замените ВАШ_ПАРОЛЬ на реальный пароль PostgreSQL!')
  console.error('')
  console.error('4. После создания/обновления .env.local выполните снова:')
  console.error('   npm run create-admin')
  console.error('')
  console.error('═══════════════════════════════════════════════════════════════')
  console.error('')
  process.exit(1)
}

const prisma = new PrismaClient()

async function main() {
  // Фиксированные данные для администратора
  const email = 'admin@example.com'
  const password = 'admin123'
  const name = 'Administrator'

  console.log('='.repeat(60))
  console.log('Создание администратора в базе данных')
  console.log('='.repeat(60))
  console.log('Email:', email)
  console.log('Password:', password)
  console.log('Database:', process.env.DATABASE_URL ? '✓ Подключена' : '✗ Не найдена')
  console.log('')

  // Хешируем пароль
  const hashedPassword = await bcrypt.hash(password, 10)
  console.log('Пароль захеширован')
  console.log('')

  // Проверяем подключение к базе данных
  console.log('Проверка подключения к базе данных...')
  try {
    await prisma.$connect()
    console.log('✓ Подключение к базе данных успешно')
    console.log('')
  } catch (connectError) {
    console.error('')
    console.error('❌ ОШИБКА ПОДКЛЮЧЕНИЯ К БАЗЕ ДАННЫХ')
    console.error('')
    console.error('═══════════════════════════════════════════════════════════════')
    console.error('ПРОБЛЕМА: Не удается подключиться к PostgreSQL')
    console.error('═══════════════════════════════════════════════════════════════')
    console.error('')
    console.error('Возможные причины:')
    console.error('1. Неверный пароль PostgreSQL в DATABASE_URL')
    console.error('2. База данных sravni_ru не существует')
    console.error('3. PostgreSQL не запущен')
    console.error('')
    console.error('РЕШЕНИЕ:')
    console.error('')
    console.error('1. Проверьте пароль в .env.local:')
    console.error('   DATABASE_URL="postgresql://postgres:ПАРОЛЬ@localhost:5432/sravni_ru?schema=public"')
    console.error('')
    console.error('2. Создайте базу данных (если её нет):')
    console.error('   - Откройте pgAdmin')
    console.error('   - Или выполните: psql -U postgres -c "CREATE DATABASE sravni_ru;"')
    console.error('')
    console.error('3. Проверьте что PostgreSQL запущен')
    console.error('')
    console.error('4. Проверьте подключение:')
    console.error('   npx prisma db push')
    console.error('')
    console.error('5. После исправления выполните снова:')
    console.error('   npm run create-admin')
    console.error('')
    console.error('═══════════════════════════════════════════════════════════════')
    console.error('')
    await prisma.$disconnect()
    process.exit(1)
  }

  try {
    // Проверяем существует ли админ
    const existing = await prisma.admin.findUnique({
      where: { email }
    })

    let admin
    if (existing) {
      console.log('Найден существующий администратор, обновляем пароль...')
      // Обновляем существующего
      admin = await prisma.admin.update({
        where: { email },
        data: {
          password: hashedPassword,
          name,
        },
      })
      console.log('✓ Администратор обновлен')
    } else {
      console.log('Создаем нового администратора...')
      // Создаем нового
      admin = await prisma.admin.create({
        data: {
          email,
          password: hashedPassword,
          name,
        },
      })
      console.log('✓ Администратор создан')
    }

    console.log('✅ Администратор успешно создан!')
    console.log('ID:', admin.id)
    console.log('Email:', admin.email)
    console.log('Name:', admin.name)
    console.log('')
    console.log('Теперь вы можете войти в админ-панель:')
    console.log('URL: http://localhost:3000/admin')
    console.log('Логин: admin@example.com')
    console.log('Пароль: admin123')
  } catch (error) {
    console.error('')
    console.error('❌ ОШИБКА при создании администратора:')
    console.error('')
    
    if (error.message && error.message.includes('Authentication failed')) {
      console.error('═══════════════════════════════════════════════════════════════')
      console.error('ОШИБКА ПОДКЛЮЧЕНИЯ К БАЗЕ ДАННЫХ')
      console.error('═══════════════════════════════════════════════════════════════')
      console.error('')
      console.error('Проблема: Неверный пароль PostgreSQL или база данных не существует')
      console.error('')
      console.error('РЕШЕНИЕ:')
      console.error('')
      console.error('1. Проверьте пароль PostgreSQL в файле .env.local')
      console.error('   DATABASE_URL="postgresql://postgres:ПАРОЛЬ@localhost:5432/sravni_ru?schema=public"')
      console.error('')
      console.error('2. Убедитесь что база данных sravni_ru существует:')
      console.error('   - Откройте pgAdmin')
      console.error('   - Или выполните: psql -U postgres -c "CREATE DATABASE sravni_ru;"')
      console.error('')
      console.error('3. Проверьте что PostgreSQL запущен')
      console.error('')
      console.error('4. Попробуйте подключиться вручную:')
      console.error('   psql -U postgres -d sravni_ru')
      console.error('')
      console.error('5. После исправления выполните:')
      console.error('   npx prisma db push')
      console.error('   npm run create-admin')
      console.error('')
    } else if (error.code === 'P2002') {
      console.error('Администратор с таким email уже существует')
    } else {
      console.error('Детали ошибки:', error.message)
      if (error.code) {
        console.error('Код ошибки:', error.code)
      }
    }
    console.error('')
    throw error
  }
}

main()
  .catch((e) => {
    console.error('Критическая ошибка:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })


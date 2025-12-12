import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'

// Загружаем переменные окружения вручную
function loadEnvFile(filePath: string) {
  if (existsSync(filePath)) {
    const content = readFileSync(filePath, 'utf-8')
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
loadEnvFile(resolve(__dirname, '..', '.env.local'))
loadEnvFile(resolve(__dirname, '..', '.env'))

const prisma = new PrismaClient()

async function main() {
  // Фиксированные данные - всегда создаем с этими значениями
  const email = 'admin@example.com'
  const password = 'admin123'

  console.log('='.repeat(60))
  console.log('Создание администратора в базе данных')
  console.log('='.repeat(60))
  console.log('Email:', email)
  console.log('Password:', password)
  console.log('')

  const hashedPassword = await bcrypt.hash(password, 10)
  console.log('✓ Пароль захеширован')

  try {
    // Сначала удаляем существующего админа если есть
    const existingAdmin = await prisma.admin.findUnique({
      where: { email }
    })

    if (existingAdmin) {
      console.log('✓ Найден существующий администратор, обновляем...')
      await prisma.admin.update({
        where: { email },
        data: {
          password: hashedPassword,
          name: 'Administrator',
        },
      })
      console.log('✓ Администратор обновлен')
    } else {
      console.log('✓ Создаем нового администратора...')
      await prisma.admin.create({
        data: {
          email,
          password: hashedPassword,
          name: 'Administrator',
        },
      })
      console.log('✓ Администратор создан')
    }

    console.log('')
    console.log('='.repeat(60))
    console.log('✅ ГОТОВО! Администратор создан/обновлен')
    console.log('='.repeat(60))
    console.log('')
    console.log('Данные для входа в админ-панель:')
    console.log('  URL: http://localhost:3000/admin')
    console.log('  Логин: admin@example.com')
    console.log('  Пароль: admin123')
    console.log('')
  } catch (error: any) {
    console.error('')
    console.error('❌ ОШИБКА при создании администратора:')
    console.error(error.message)
    if (error.code === 'P2002') {
      console.error('Администратор с таким email уже существует')
    }
    throw error
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

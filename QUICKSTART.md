# Быстрый старт

## Пошаговая инструкция для запуска на Windows

### 1. Установите PostgreSQL (если еще не установлен)

Скачайте и установите с https://www.postgresql.org/download/windows/
Или используйте Docker:
```bash
docker run --name postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres
```

### 2. Установите зависимости

```bash
npm install
```

### 3. Создайте базу данных

Откройте pgAdmin или выполните:
```bash
# Если PostgreSQL в PATH
psql -U postgres -c "CREATE DATABASE sravni_ru;"
```

Или создайте через любой GUI клиент PostgreSQL.

### 4. Создайте файл `.env.local`

Создайте файл `.env.local` в корне проекта со следующим содержимым:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/sravni_ru?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="local-dev-secret-key-change-in-production-12345"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="admin123"
```

**Важно:** 
- Замените `postgres:postgres` на ваш реальный логин и пароль PostgreSQL
- Для генерации безопасного `NEXTAUTH_SECRET` выполните: `npm run generate-secret`

### 5. Инициализируйте базу данных

```bash
# Сгенерировать Prisma Client
npx prisma generate

# Применить схему к БД
npx prisma db push

# Создать администратора
npm run init-admin
```

### 6. Запустите сайт

```bash
npm run dev
```

Откройте браузер: **http://localhost:3000**

## Вход в админ-панель

URL: http://localhost:3000/admin
- Email: `admin@example.com` (из .env.local)
- Пароль: `admin123` (из .env.local)

## Что такое NEXTAUTH_SECRET?

`NEXTAUTH_SECRET` - это секретный ключ для шифрования сессий и токенов в NextAuth.js.

**Для локальной разработки** можно использовать любой длинный текст, например:
```
local-dev-secret-key-12345
```

**Для генерации безопасного ключа:**
```bash
npm run generate-secret
```

Или онлайн: https://generate-secret.vercel.app/32

⚠️ **Никогда не коммитьте `.env.local` в git!**






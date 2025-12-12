# Инструкция по запуску сайта локально

## Шаг 1: Установка PostgreSQL

Если у вас еще не установлена PostgreSQL:

### Windows:
1. Скачайте PostgreSQL с официального сайта: https://www.postgresql.org/download/windows/
2. Установите PostgreSQL (запомните пароль для пользователя `postgres`)
3. PostgreSQL будет доступен на `localhost:5432`

### Альтернатива (без установки PostgreSQL):
Можно использовать Docker или облачную БД (например, Supabase, Neon, Railway)

## Шаг 2: Установка зависимостей

```bash
npm install
```

## Шаг 3: Настройка базы данных

### 3.1. Создайте файл `.env.local` в корне проекта:

```env
# Подключение к PostgreSQL
# Замените user, password и sravni_ru на свои значения
DATABASE_URL="postgresql://postgres:ваш_пароль@localhost:5432/sravni_ru?schema=public"

# URL вашего сайта (для локальной разработки)
NEXTAUTH_URL="http://localhost:3000"

# Секретный ключ для NextAuth (см. объяснение ниже)
NEXTAUTH_SECRET="ваш-случайный-секретный-ключ-минимум-32-символа"

# Учетные данные администратора
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="admin123"
```

### 3.2. Создайте базу данных в PostgreSQL:

Откройте pgAdmin или выполните в командной строке:

```bash
# Подключитесь к PostgreSQL
psql -U postgres

# Создайте базу данных
CREATE DATABASE sravni_ru;

# Выйдите
\q
```

Или используйте любой GUI клиент для PostgreSQL.

### 3.3. Инициализируйте схему базы данных:

```bash
# Сгенерируйте Prisma Client
npx prisma generate

# Примените схему к базе данных
npx prisma db push

# Создайте администратора
npm run init-admin
```

## Шаг 4: Запуск сайта

```bash
# Запустите dev-сервер
npm run dev
```

Откройте браузер: http://localhost:3000

## Доступ к админ-панели

URL: http://localhost:3000/admin

Логин: значение из `ADMIN_EMAIL` (по умолчанию `admin@example.com`)
Пароль: значение из `ADMIN_PASSWORD` (по умолчанию `admin123`)

## Что такое NEXTAUTH_SECRET?

`NEXTAUTH_SECRET` - это секретный ключ, который используется NextAuth.js для:
- Шифрования JWT токенов
- Подписи сессий
- Защиты от подделки CSRF

### Как сгенерировать безопасный секретный ключ:

**Вариант 1: Онлайн генератор**
Откройте https://generate-secret.vercel.app/32 и скопируйте сгенерированный ключ

**Вариант 2: Командная строка (OpenSSL)**
```bash
openssl rand -base64 32
```

**Вариант 3: Node.js**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Вариант 4: Для быстрого тестирования можно использовать любой длинный случайный текст:**
```
my-super-secret-key-for-local-development-only-12345
```

⚠️ **ВАЖНО**: 
- Для продакшена используйте действительно случайный ключ
- Никогда не коммитьте `.env.local` в git
- Используйте разные ключи для разных окружений

## Полезные команды

```bash
# Просмотр базы данных в браузере
npm run db:studio

# Пересоздать Prisma Client
npm run db:generate

# Применить изменения в схеме БД
npm run db:push
```

## Решение проблем

### Ошибка подключения к БД
- Проверьте, что PostgreSQL запущен
- Убедитесь, что пароль в `DATABASE_URL` правильный
- Проверьте, что база данных `sravni_ru` создана

### Ошибка "Module not found"
```bash
# Удалите node_modules и переустановите
rm -rf node_modules package-lock.json
npm install
```

### Порт 3000 занят
Измените порт в `package.json`:
```json
"dev": "next dev -p 3001"
```






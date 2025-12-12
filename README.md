# Агрегатор онлайн-курсов

Веб-сайт-каталог онлайн-курсов с анонимными добавлениями и модерацией контента.

## Особенности

- ✅ Анонимное добавление курсов и отзывов
- ✅ Полная модерация контента через админ-панель
- ✅ Server-Side Rendering (SSR) для SEO
- ✅ Микроразметка Schema.org
- ✅ Автоматическая генерация sitemap.xml и robots.txt
- ✅ Фильтрация и сортировка курсов
- ✅ Система рейтингов и отзывов
- ✅ Управление авторами курсов

## Технологии

- **Next.js 14** (App Router) - React фреймворк с SSR
- **TypeScript** - типизация
- **PostgreSQL** - база данных
- **Prisma** - ORM
- **NextAuth.js** - аутентификация
- **Tailwind CSS** - стилизация
- **React Hook Form** + **Zod** - формы и валидация

## Быстрый старт

Подробная инструкция: [QUICKSTART.md](./QUICKSTART.md)

## Установка

1. Клонируйте репозиторий и установите зависимости:

```bash
npm install
```

2. Настройте базу данных:

Создайте файл `.env.local` в корне проекта:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/sravni_ru?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="admin123"
```

3. Инициализируйте базу данных:

```bash
# Сгенерируйте Prisma Client
npx prisma generate

# Примените схему к базе данных
npx prisma db push

# Создайте администратора
npm run init-admin
```

**Примечание:** Убедитесь, что PostgreSQL запущен и доступен по адресу из `DATABASE_URL`.

**Генерация NEXTAUTH_SECRET:**
```bash
npm run generate-secret
```

4. Запустите dev-сервер:

```bash
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000)

## Админ-панель

Доступна по адресу `/admin`

- Логин: значение из `ADMIN_EMAIL`
- Пароль: значение из `ADMIN_PASSWORD`

## Структура проекта

```
├── app/                    # Next.js App Router
│   ├── admin/             # Админ-панель
│   ├── api/               # API routes
│   ├── courses/           # Страницы курсов
│   ├── author/            # Страницы авторов
│   └── add-course/        # Форма добавления курса
├── components/            # React компоненты
├── lib/                   # Утилиты и helpers
├── prisma/                # Схема базы данных
└── scripts/               # Вспомогательные скрипты
```

## Основные функции

### Публичная часть

- Главная страница с популярными курсами
- Каталог курсов с фильтрацией и сортировкой
- Страницы отдельных курсов с отзывами
- Страницы авторов
- Форма добавления курса (анонимная)
- Форма добавления отзыва (анонимная)

### Админ-панель

- Дашборд со статистикой
- Модерация курсов (одобрение/отклонение/редактирование)
- Модерация отзывов
- Управление авторами
- Управление оценками курсов
- CRUD операции для всех сущностей

## SEO

- Автоматическая генерация мета-тегов
- Микроразметка Schema.org (Course, Review, Person/Organization)
- Динамический sitemap.xml
- robots.txt
- Чистые URL (slug-based)

## Лицензия

MIT

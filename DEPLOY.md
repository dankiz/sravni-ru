# Инструкция по деплою сайта

## Вариант 1: Vercel (Рекомендуется - самый простой)

Vercel - это платформа от создателей Next.js, идеально подходит для деплоя.

### Шаги:

1. **Подготовка базы данных:**
   - Зарегистрируйтесь на [Neon](https://neon.tech) или [Supabase](https://supabase.com) (бесплатные PostgreSQL)
   - Создайте новую базу данных
   - Скопируйте `DATABASE_URL` (будет нужен позже)

2. **Подготовка кода:**
   ```bash
   # Убедитесь, что все изменения закоммичены в Git
   git add .
   git commit -m "Prepare for deployment"
   ```

3. **Деплой на Vercel:**
   - Зайдите на [vercel.com](https://vercel.com)
   - Войдите через GitHub/GitLab/Bitbucket
   - Нажмите "Add New Project"
   - Выберите ваш репозиторий
   - Настройки:
     - **Framework Preset:** Next.js
     - **Root Directory:** ./
     - **Build Command:** `prisma generate && next build`
     - **Output Directory:** .next (по умолчанию)

4. **Переменные окружения в Vercel:**
   Добавьте в настройках проекта (Settings → Environment Variables):
   ```
   DATABASE_URL=postgresql://user:password@host:5432/database
   NEXTAUTH_URL=https://your-domain.vercel.app
   NEXTAUTH_SECRET=your-secret-key-here
   ```
   
   Для генерации NEXTAUTH_SECRET:
   ```bash
   openssl rand -base64 32
   ```

5. **Миграции базы данных:**
   После первого деплоя, выполните миграции:
   ```bash
   # Через Vercel CLI или через SSH
   npx prisma migrate deploy
   # Или
   npx prisma db push
   ```

6. **Настройка домена (опционально):**
   - В настройках проекта → Domains
   - Добавьте свой домен
   - Обновите NEXTAUTH_URL на новый домен

---

## Вариант 2: Railway (Хорошо для PostgreSQL)

Railway предоставляет PostgreSQL и деплой в одном месте.

### Шаги:

1. **Регистрация:**
   - Зайдите на [railway.app](https://railway.app)
   - Войдите через GitHub

2. **Создание базы данных:**
   - New Project → Database → PostgreSQL
   - Скопируйте `DATABASE_URL` из настроек

3. **Деплой приложения:**
   - New Project → Deploy from GitHub repo
   - Выберите ваш репозиторий
   - Railway автоматически определит Next.js

4. **Переменные окружения:**
   В настройках сервиса добавьте:
   ```
   DATABASE_URL=<из настроек PostgreSQL>
   NEXTAUTH_URL=https://your-app.railway.app
   NEXTAUTH_SECRET=<сгенерируйте через openssl rand -base64 32>
   ```

5. **Build команда:**
   В настройках сервиса → Settings → Build:
   ```
   Build Command: prisma generate && next build
   Start Command: next start
   ```

6. **Миграции:**
   После деплоя, в терминале Railway выполните:
   ```bash
   npx prisma migrate deploy
   ```

---

## Вариант 3: DigitalOcean App Platform

### Шаги:

1. **База данных:**
   - Создайте Managed PostgreSQL в DigitalOcean
   - Или используйте внешний сервис (Neon, Supabase)

2. **Деплой:**
   - Зайдите на [cloud.digitalocean.com](https://cloud.digitalocean.com)
   - App Platform → Create App
   - Подключите GitHub репозиторий
   - Настройки:
     - **Type:** Web Service
     - **Build Command:** `prisma generate && next build`
     - **Run Command:** `next start`
     - **HTTP Port:** 3000

3. **Переменные окружения:**
   ```
   DATABASE_URL=postgresql://...
   NEXTAUTH_URL=https://your-app.ondigitalocean.app
   NEXTAUTH_SECRET=<сгенерируйте>
   ```

---

## Вариант 4: VPS (VDS) сервер (Полный контроль)

Если у вас есть VPS (например, от Timeweb, Selectel, DigitalOcean):

### Шаги:

1. **Подключение к серверу:**
   ```bash
   ssh root@your-server-ip
   ```

2. **Установка Node.js:**
   ```bash
   # Ubuntu/Debian
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Проверка
   node --version
   npm --version
   ```

3. **Установка PostgreSQL:**
   ```bash
   sudo apt update
   sudo apt install postgresql postgresql-contrib
   sudo systemctl start postgresql
   sudo systemctl enable postgresql
   
   # Создание базы данных
   sudo -u postgres psql
   CREATE DATABASE sravni_ru;
   CREATE USER sravni_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE sravni_ru TO sravni_user;
   \q
   ```

4. **Установка PM2 (менеджер процессов):**
   ```bash
   sudo npm install -g pm2
   ```

5. **Клонирование репозитория:**
   ```bash
   cd /var/www
   git clone https://github.com/your-username/your-repo.git
   cd your-repo
   npm install
   ```

6. **Настройка переменных окружения:**
   ```bash
   nano .env
   ```
   Добавьте:
   ```
   DATABASE_URL=postgresql://sravni_user:your_password@localhost:5432/sravni_ru
   NEXTAUTH_URL=https://your-domain.com
   NEXTAUTH_SECRET=<сгенерируйте>
   NODE_ENV=production
   ```

7. **Миграции и сборка:**
   ```bash
   npx prisma generate
   npx prisma migrate deploy
   npm run build
   ```

8. **Запуск с PM2:**
   ```bash
   pm2 start npm --name "sravni-ru" -- start
   pm2 save
   pm2 startup
   ```

9. **Настройка Nginx (обратный прокси):**
   ```bash
   sudo apt install nginx
   sudo nano /etc/nginx/sites-available/sravni-ru
   ```
   
   Конфигурация:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```
   
   ```bash
   sudo ln -s /etc/nginx/sites-available/sravni-ru /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

10. **SSL сертификат (Let's Encrypt):**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

---

## Общие шаги для всех вариантов:

### 1. Подготовка базы данных

После деплоя выполните миграции:
```bash
npx prisma migrate deploy
# или
npx prisma db push
```

### 2. Создание админ-пользователя

```bash
npm run create-admin
# или
npm run init-admin
```

### 3. Загрузка данных (если нужно)

```bash
npm run load-courses
npm run set-ratings
npm run update-schools
```

### 4. Настройка загрузки изображений

Убедитесь, что папка `public/uploads` существует и доступна для записи.

Для VPS:
```bash
mkdir -p public/uploads/courses
chmod -R 755 public/uploads
```

---

## Переменные окружения (полный список):

```env
# База данных
DATABASE_URL=postgresql://user:password@host:5432/database

# NextAuth
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-secret-key-here

# Опционально
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com
REDIRECT_DOMAIN=https://go.acstat.com/fce64814c5585361
NEXT_PUBLIC_REDIRECT_DOMAIN=https://go.acstat.com/fce64814c5585361
```

---

## Рекомендации:

1. **Для начала:** Используйте Vercel + Neon/Supabase (самый простой вариант)
2. **Для продакшена:** Railway или DigitalOcean (больше контроля)
3. **Для полного контроля:** VPS сервер

## Полезные команды:

```bash
# Проверка сборки локально
npm run build
npm start

# Миграции
npx prisma migrate dev
npx prisma migrate deploy

# Просмотр базы данных
npx prisma studio
```

---

## Troubleshooting:

### Ошибка подключения к БД:
- Проверьте DATABASE_URL
- Убедитесь, что БД доступна из интернета (для облачных сервисов)
- Проверьте firewall настройки

### Ошибка сборки:
- Убедитесь, что все зависимости установлены
- Проверьте версию Node.js (нужна 18+)
- Выполните `prisma generate` перед сборкой

### Изображения не загружаются:
- Проверьте права на папку `public/uploads`
- Убедитесь, что папка существует
- Проверьте настройки Next.js для изображений


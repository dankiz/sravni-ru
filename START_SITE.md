# Запуск сайта на сервере

## Шаг 1: Создание файла .env

```bash
cd /var/www/sravni-ru
nano .env
```

Добавьте следующее (замените значения):

```env
# База данных (из Neon или Supabase)
DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require

# NextAuth
NEXTAUTH_URL=http://195.58.51.50
NEXTAUTH_SECRET=сгенерируйте-секретный-ключ

# Окружение
NODE_ENV=production
NEXT_PUBLIC_APP_URL=http://195.58.51.50
```

**Для генерации NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

Сохраните файл: `Ctrl+O`, `Enter`, `Ctrl+X`

---

## Шаг 2: Настройка базы данных

Если ещё не создали базу данных:
1. Зайдите на [neon.tech](https://neon.tech) или [supabase.com](https://supabase.com)
2. Создайте проект
3. Скопируйте `DATABASE_URL` в файл `.env`

---

## Шаг 3: Применение миграций Prisma

```bash
# Генерируйте Prisma клиент (если ещё не сделали)
npx prisma generate

# Применяйте миграции к базе данных
npx prisma migrate deploy

# Или если миграций нет:
npx prisma db push
```

---

## Шаг 4: Сборка проекта

```bash
npm run build
```

Это займёт несколько минут. Дождитесь завершения.

---

## Шаг 5: Создание папок для загрузок

```bash
mkdir -p public/uploads/courses
chmod -R 755 public/uploads
```

---

## Шаг 6: Запуск через PM2

```bash
# Запускаем приложение
pm2 start npm --name "sravni-ru" -- start

# Сохраняем конфигурацию
pm2 save

# Настраиваем автозапуск
pm2 startup
# Выполните команду, которую выведет PM2 (обычно что-то вроде: sudo env PATH=...)

# Проверка статуса
pm2 status
```

---

## Шаг 7: Настройка Nginx

```bash
# Создаём конфигурацию
nano /etc/nginx/sites-available/sravni-ru
```

Вставьте следующее:

```nginx
server {
    listen 80;
    server_name 195.58.51.50;

    # Увеличиваем размер загружаемых файлов
    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Сохраните: `Ctrl+O`, `Enter`, `Ctrl+X`

```bash
# Активируем конфигурацию
ln -s /etc/nginx/sites-available/sravni-ru /etc/nginx/sites-enabled/

# Удаляем дефолтную (опционально)
rm -f /etc/nginx/sites-enabled/default

# Проверяем конфигурацию
nginx -t

# Перезапускаем Nginx
systemctl restart nginx
```

---

## Шаг 8: Настройка Firewall

```bash
# Разрешаем HTTP
ufw allow 80/tcp

# Проверка статуса
ufw status
```

---

## Шаг 9: Создание админ-пользователя

```bash
cd /var/www/sravni-ru
npm run create-admin
# или
npm run init-admin
```

Следуйте инструкциям для создания админ-аккаунта.

---

## Шаг 10: Проверка работы

Откройте в браузере:
```
http://195.58.51.50
```

Сайт должен открыться!

---

## Полезные команды для проверки:

### Проверка статуса приложения:
```bash
pm2 status
pm2 logs sravni-ru
```

### Проверка Nginx:
```bash
systemctl status nginx
tail -f /var/log/nginx/error.log
```

### Проверка портов:
```bash
netstat -tulpn | grep :3000
netstat -tulpn | grep :80
```

### Перезапуск приложения:
```bash
pm2 restart sravni-ru
```

---

## Troubleshooting:

### Сайт не открывается:
1. Проверьте PM2: `pm2 status`
2. Проверьте логи: `pm2 logs sravni-ru`
3. Проверьте Nginx: `systemctl status nginx`
4. Проверьте порт: `netstat -tulpn | grep :3000`

### Ошибка подключения к БД:
- Проверьте DATABASE_URL в `.env`
- Убедитесь, что БД доступна из интернета

### Ошибка при сборке:
- Проверьте логи: `npm run build`
- Убедитесь, что все зависимости установлены


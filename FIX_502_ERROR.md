# Исправление ошибки 502 Bad Gateway

## Проблема:
Nginx не может подключиться к приложению на порту 3000.

## Диагностика:

### 1. Проверьте статус приложения:

```bash
pm2 status
```

Если приложение не запущено или упало, увидите ошибку.

### 2. Проверьте логи приложения:

```bash
pm2 logs sravni-ru --lines 50
```

Ищите ошибки в логах.

### 3. Проверьте, слушает ли приложение порт 3000:

```bash
netstat -tulpn | grep :3000
```

Если ничего не выводится, приложение не запущено.

### 4. Проверьте логи Nginx:

```bash
tail -f /var/log/nginx/error.log
```

---

## Решения:

### Решение 1: Приложение не запущено или упало

```bash
# Проверьте статус
pm2 status

# Если приложение не запущено, запустите:
pm2 start npm --name "sravni-ru" -- start

# Если упало, перезапустите:
pm2 restart sravni-ru

# Проверьте логи на ошибки
pm2 logs sravni-ru
```

### Решение 2: Ошибка при запуске приложения

Проверьте логи на ошибки:

```bash
pm2 logs sravni-ru --err
```

Частые проблемы:
- Не настроен `.env` файл
- Ошибка подключения к БД
- Ошибка при сборке

### Решение 3: Приложение запускается на другом порту

Проверьте, на каком порту запущено:

```bash
netstat -tulpn | grep node
```

Если не на 3000, либо:
- Измените порт в `.env`: `PORT=3000`
- Или измените Nginx конфигурацию

### Решение 4: Проверьте переменные окружения

```bash
cd /var/www/sravni-ru
cat .env
```

Убедитесь, что все переменные заполнены правильно.

### Решение 5: Пересоберите проект

```bash
cd /var/www/sravni-ru
npm run build
pm2 restart sravni-ru
```

### Решение 6: Проверьте конфигурацию Nginx

```bash
# Проверьте синтаксис
nginx -t

# Проверьте, что конфигурация активна
ls -la /etc/nginx/sites-enabled/

# Перезапустите Nginx
systemctl restart nginx
```

---

## Полная диагностика (выполните все команды):

```bash
# 1. Статус PM2
pm2 status

# 2. Логи приложения
pm2 logs sravni-ru --lines 100

# 3. Проверка порта
netstat -tulpn | grep :3000

# 4. Проверка Nginx
systemctl status nginx
tail -20 /var/log/nginx/error.log

# 5. Проверка .env
cd /var/www/sravni-ru
ls -la .env
cat .env
```

---

## Быстрое исправление:

```bash
cd /var/www/sravni-ru

# 1. Остановите приложение
pm2 stop sravni-ru
pm2 delete sravni-ru

# 2. Проверьте .env
cat .env

# 3. Пересоберите (если нужно)
npm run build

# 4. Запустите заново
pm2 start npm --name "sravni-ru" -- start

# 5. Проверьте логи
pm2 logs sravni-ru

# 6. Проверьте порт
netstat -tulpn | grep :3000
```

---

## Частые ошибки:

### Ошибка: "Cannot find module"
```bash
npm install
npm run build
```

### Ошибка: "Database connection failed"
- Проверьте DATABASE_URL в `.env`
- Убедитесь, что БД доступна из интернета

### Ошибка: "Port 3000 already in use"
```bash
# Найдите процесс
lsof -i :3000
# Убейте процесс
kill -9 <PID>
# Или измените порт в .env
```

---

## После исправления:

1. Проверьте, что приложение запущено: `pm2 status`
2. Проверьте порт: `netstat -tulpn | grep :3000`
3. Проверьте в браузере: http://195.58.51.50


# Исправление: Установка базовых утилит

## Проблема:
- `curl: command not found`
- `npm: command not found`

## Решение:

### Шаг 1: Установите curl и другие базовые утилиты

```bash
apt update
apt install -y curl wget gnupg2 ca-certificates
```

### Шаг 2: Теперь установите Node.js

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
```

### Шаг 3: Проверьте установку

```bash
node --version
npm --version
```

### Шаг 4: Теперь установите PM2

```bash
npm install -g pm2
```

---

## Полная последовательность команд (скопируйте и выполните):

```bash
# 1. Обновление и установка базовых утилит
apt update
apt upgrade -y
apt install -y curl wget gnupg2 ca-certificates git

# 2. Установка Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# 3. Проверка
node --version
npm --version

# 4. Установка PM2
npm install -g pm2

# 5. Установка Nginx
apt install -y nginx
systemctl start nginx
systemctl enable nginx
```

После этого продолжайте с шага 7 из основной инструкции (клонирование проекта).


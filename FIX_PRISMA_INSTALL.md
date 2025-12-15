# Исправление ошибки установки Prisma

## Проблема:
```
npm error Error: aborted
code: 'ECONNRESET'
```

Это сетевая ошибка при скачивании Prisma engines.

## Решение:

### Вариант 1: Повторите установку (часто помогает)

```bash
# Очистите кэш npm
npm cache clean --force

# Удалите node_modules и package-lock.json
rm -rf node_modules package-lock.json

# Попробуйте установить снова
npm install
```

### Вариант 2: Установка с таймаутом и повторными попытками

```bash
# Увеличьте таймаут npm
npm install --timeout=60000

# Или с повторными попытками
npm install --fetch-retries=5 --fetch-retry-mintimeout=20000
```

### Вариант 3: Установка Prisma отдельно

```bash
# Сначала установите остальные зависимости
npm install --ignore-scripts

# Затем установите Prisma отдельно
npm install @prisma/client @prisma/client@latest --save
npx prisma generate
```

### Вариант 4: Использование зеркала npm (если проблемы с сетью)

```bash
# Установите зависимости через зеркало
npm install --registry=https://registry.npmjs.org/
```

### Вариант 5: Ручная установка Prisma engines

```bash
# Установите зависимости без Prisma
npm install --ignore-scripts

# Затем установите Prisma вручную
npm install prisma @prisma/client
npx prisma generate
```

---

## Рекомендуемая последовательность:

```bash
# 1. Очистите всё
rm -rf node_modules package-lock.json
npm cache clean --force

# 2. Попробуйте установить с увеличенным таймаутом
npm install --timeout=120000 --fetch-retries=5

# 3. Если не помогло, установите без скриптов, затем Prisma отдельно
npm install --ignore-scripts
npm install prisma @prisma/client
npx prisma generate
```

---

## Если всё ещё не работает:

Проверьте подключение к интернету:

```bash
# Проверка интернета
ping -c 3 8.8.8.8

# Проверка DNS
nslookup registry.npmjs.org
```

Если проблемы с сетью, возможно нужно настроить прокси или проверить firewall.


# Способы загрузки файлов на сервер RUVDS

## Способ 1: Через Git (Рекомендуется - самый простой)

### Шаг 1: Создайте репозиторий на GitHub

1. Зайдите на [github.com](https://github.com)
2. Создайте новый репозиторий (New Repository)
3. Назовите его, например, `sravni-ru`
4. **НЕ** добавляйте README, .gitignore или лицензию (если проект уже есть)

### Шаг 2: Загрузите код на GitHub

На вашем компьютере (в папке проекта):

```bash
# Если Git ещё не инициализирован
git init
git add .
git commit -m "Initial commit"

# Добавьте удаленный репозиторий
git remote add origin https://github.com/ваш-username/sravni-ru.git
git branch -M main
git push -u origin main
```

### Шаг 3: Клонируйте на сервере

В веб-консоли RUVDS выполните:

```bash
cd /var/www
git clone https://github.com/ваш-username/sravni-ru.git
cd sravni-ru
npm install
```

---

## Способ 2: Через SFTP клиент (FileZilla, WinSCP)

### Используя WinSCP (Windows):

1. Скачайте [WinSCP](https://winscp.net/eng/download.php)
2. Установите и откройте
3. Создайте новое соединение:
   - **Протокол:** SFTP
   - **Имя хоста:** 195.58.51.50
   - **Порт:** 22
   - **Имя пользователя:** root
   - **Пароль:** (ваш пароль)
4. Подключитесь
5. Перетащите папку проекта в `/var/www/sravni-ru`

### Используя FileZilla:

1. Скачайте [FileZilla](https://filezilla-project.org/download.php?type=client)
2. Откройте и создайте новое соединение:
   - **Хост:** sftp://195.58.51.50
   - **Пользователь:** root
   - **Пароль:** (ваш пароль)
   - **Порт:** 22
3. Подключитесь и загрузите файлы

---

## Способ 3: Через архив и wget (если нет Git)

### Шаг 1: Создайте архив на вашем компьютере

На Windows (PowerShell в папке проекта):

```powershell
# Установите 7-Zip или используйте встроенный архиватор
# Создайте ZIP архив всей папки проекта
```

Или используйте команду (если установлен Git Bash):
```bash
tar -czf sravni-ru.tar.gz .
```

### Шаг 2: Загрузите архив на файлообменник

Загрузите архив на:
- [Google Drive](https://drive.google.com)
- [Dropbox](https://dropbox.com)
- [Яндекс.Диск](https://disk.yandex.ru)
- Или любой другой файлообменник

### Шаг 3: Скачайте на сервере

В веб-консоли RUVDS:

```bash
cd /var/www

# Если загрузили на Google Drive, получите прямую ссылку на скачивание
# Или используйте другой файлообменник с прямой ссылкой

# Скачайте архив
wget https://ваша-ссылка-на-архив.zip

# Распакуйте
unzip sravni-ru.zip
# или
tar -xzf sravni-ru.tar.gz

cd sravni-ru
npm install
```

---

## Способ 4: Через base64 кодирование (для небольших файлов)

Этот способ подходит только для небольших изменений, не для всего проекта.

---

## Рекомендация:

**Используйте Способ 1 (Git)** - это самый удобный и правильный способ:
- Легко обновлять код
- Версионность
- Можно откатывать изменения
- Стандартная практика

---

## После загрузки файлов:

```bash
cd /var/www/sravni-ru

# Установите зависимости
npm install

# Создайте .env файл
nano .env

# Добавьте переменные окружения (см. основную инструкцию)
# DATABASE_URL=...
# NEXTAUTH_URL=http://195.58.51.50
# NEXTAUTH_SECRET=...

# Генерируйте Prisma клиент
npx prisma generate

# Примените миграции
npx prisma migrate deploy

# Соберите проект
npm run build

# Создайте папку для загрузок
mkdir -p public/uploads/courses
chmod -R 755 public/uploads

# Запустите через PM2
pm2 start npm --name "sravni-ru" -- start
pm2 save
```


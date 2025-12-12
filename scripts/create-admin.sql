-- SQL скрипт для прямого создания администратора в PostgreSQL
-- Выполните этот скрипт в pgAdmin или через psql

-- ВАЖНО: Сначала нужно получить хеш пароля "admin123"
-- Для этого запустите: npm run create-admin
-- Или используйте готовый хеш ниже

-- Готовый хеш пароля "admin123" (bcrypt, rounds=10)
-- Если нужно другой пароль, запустите скрипт create-admin-direct.js

-- Удаляем существующего админа
DELETE FROM "Admin" WHERE email = 'admin@example.com';

-- Вставляем нового администратора
-- Хеш пароля "admin123": $2a$10$rOzJqZqZqZqZqZqZqZqZqO
-- Для получения правильного хеша используйте скрипт create-admin-direct.js
INSERT INTO "Admin" (id, email, password, name, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid()::text,
  'admin@example.com',
  '$2a$10$rOzJqZqZqZqZqZqZqZqZqO', -- ЗАМЕНИТЕ на правильный хеш из скрипта
  'Administrator',
  NOW(),
  NOW()
);

-- Проверка
SELECT id, email, name, "createdAt" FROM "Admin" WHERE email = 'admin@example.com';







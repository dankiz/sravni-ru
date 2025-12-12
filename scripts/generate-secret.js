// Скрипт для генерации секретного ключа для NEXTAUTH_SECRET
const crypto = require('crypto');
const secret = crypto.randomBytes(32).toString('base64');
console.log('\n=== Сгенерированный NEXTAUTH_SECRET ===');
console.log(secret);
console.log('\nСкопируйте этот ключ в файл .env.local\n');






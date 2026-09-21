#!/bin/sh
set -e

echo "⏳ Waiting for MySQL database to be ready..."
while ! nc -z db 3306; do
  sleep 1
done
echo "✅ MySQL database is reachable!"

echo "🔄 Running database migrations..."
npx prisma migrate deploy || npx prisma db push

echo "🌱 Seeding initial database data..."
node seed.js || true

echo "🚀 Starting Almari Backend server..."
exec npm run start

#!/bin/sh
set -e

echo "⏳ Waiting for MySQL database to be ready..."
while ! nc -z db 3306; do
  sleep 1
done
echo "✅ MySQL database is reachable!"

echo "🔄 Running database migrations..."
npx prisma migrate deploy || npx prisma db push

# Never wipe or reset existing data on container boot/update!
SEED_DATABASE=${SEED_DATABASE:-false}
if [ "$SEED_DATABASE" = "true" ]; then
  echo "🌱 Checking if initial seed is required (SEED_DATABASE=true)..."
  node seed.js || true
else
  echo "🛡️ Preserving existing database data and uploaded media (SEED_DATABASE=false)."
fi

echo "🚀 Starting Almari Backend server..."
exec npm run start

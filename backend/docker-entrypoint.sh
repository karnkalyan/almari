#!/bin/sh
set -e

echo "⏳ Waiting for MySQL database to be ready..."
while ! nc -z db 3306; do
  sleep 1
done
echo "✅ MySQL database is reachable!"

echo "🔄 Running database migrations (non-destructive)..."
# Safely apply pending migrations using local prisma binary without resetting database
./node_modules/.bin/prisma migrate deploy || ./node_modules/.bin/prisma db push --skip-generate

# Never wipe or reset existing data on container build or startup
SEED_DATABASE=${SEED_DATABASE:-false}
FORCE_RESET_DATABASE=${FORCE_RESET_DATABASE:-false}

if [ "$SEED_DATABASE" = "true" ] && [ "$FORCE_RESET_DATABASE" != "true" ]; then
  echo "🌱 Checking if initial seed is needed for empty tables (SEED_DATABASE=true)..."
  node seed.js || true
else
  echo "🛡️ Preserving existing database data and uploaded media (no overwrite, no reset)."
fi

echo "🚀 Starting Almari Backend server..."
exec npm run start

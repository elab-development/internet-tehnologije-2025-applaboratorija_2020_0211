#!/bin/bash
# lab-backend/docker-entrypoint.sh

set +e

# ─── Čekanje na bazu ───────────────────────────────────────────────
DB_HOST="${DB_HOST:-db}"
DB_PORT="${DB_PORT:-5432}"   # default = PostgreSQL; lokalno Docker Compose overriduje na 3306
TIMEOUT=60

echo "⏳ Čekanje da baza postane dostupna na ${DB_HOST}:${DB_PORT}..."

while [ $TIMEOUT -gt 0 ]; do
    # Pokušaj sa nc ako je dostupan, inače bash TCP fallback
    if command -v nc > /dev/null 2>&1; then
        nc -z "$DB_HOST" "$DB_PORT" 2>/dev/null && break
    else
        bash -c "echo > /dev/tcp/$DB_HOST/$DB_PORT" 2>/dev/null && break
    fi

    echo "Pokušaj konekcije na ${DB_HOST}:${DB_PORT}... ($TIMEOUT sekundi preostalo)"
    sleep 2
    TIMEOUT=$((TIMEOUT - 2))
done

if [ $TIMEOUT -le 0 ]; then
    echo "❌ Baza nije dostupna nakon 60 sekundi!"
    exit 1
fi

echo "✅ Baza je dostupna!"

# ─── Laravel setup ─────────────────────────────────────────────────
echo "🧹 Brisanje bootstrap keša..."
rm -f bootstrap/cache/packages.php bootstrap/cache/services.php

echo "📦 Pokretanje migracija..."
php artisan migrate --force || true

echo "🌱 Pokretanje seedera..."
php artisan db:seed --force || true

echo "📁 Kreiranje storage direktorijuma..."
mkdir -p storage/framework/sessions storage/framework/views storage/framework/cache/data storage/logs
chmod -R 777 storage bootstrap/cache

echo "🔄 Brisanje keša i kreiranje storage linka..."
php artisan config:clear || true
php artisan cache:clear || true
php artisan storage:link || true

# ─── Pokretanje servera ────────────────────────────────────────────
APP_PORT="${PORT:-8000}"   # Render setuje $PORT automatski; lokalno = 8000
echo "🚀 Pokretanje Laravel servera na portu ${APP_PORT}..."
exec php artisan serve --host=0.0.0.0 --port="$APP_PORT"
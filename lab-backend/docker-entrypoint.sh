#!/bin/bash
# lab-backend/docker-entrypoint.sh

set +e

echo "⏳ Čekanje da baza postane dostupna..."
DB_HOST="${DB_HOST:-db}"
DB_PORT="${DB_PORT:-3306}"
TIMEOUT=60
while [ $TIMEOUT -gt 0 ]; do
    if nc -z "$DB_HOST" "$DB_PORT" 2>/dev/null; then
        echo "✅ Baza je dostupna!"
        break
    fi
    echo "Pokušaj konekcije na $DB_HOST:$DB_PORT... ($TIMEOUT sekundi preostalo)"
    sleep 2
    TIMEOUT=$((TIMEOUT - 2))
done

if [ $TIMEOUT -le 0 ]; then
    echo "❌ Baza nije dostupna nakon 60 sekundi!"
    exit 1
fi

echo "🧹 Brisanje bootstrap keša..."
rm -f bootstrap/cache/packages.php bootstrap/cache/services.php

echo "📦 Pokretanje migracija..."
# Pokreće migracije bez brisanja (safe za restart kontejnera)
# Prikazaće izlaz u Docker logovima za lakše debagovanje
php artisan migrate --force || true

echo "🌱 Pokretanje seedera..."
# Popunjava bazu test podacima (admin, researcher, user nalozi)
# --force je potrebno u non-interactive okruženju
php artisan db:seed --force || true

echo "📁 Kreiranje storage direktorijuma..."
mkdir -p storage/framework/sessions storage/framework/views storage/framework/cache/data storage/logs
chmod -R 777 storage bootstrap/cache

echo "🔄 Brisanje keša i kreiranje storage linka..."
php artisan config:clear || true
php artisan cache:clear || true
php artisan storage:link || true

echo "🚀 Pokretanje Laravel servera na portu 8000..."
# Pošto je studentski projekat, artisan serve je savršen za kontejner bez dodatnog Nginxa za backend
exec php artisan serve --host=0.0.0.0 --port=8000

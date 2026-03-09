#!/bin/bash
# lab-backend/docker-entrypoint.sh

set -e

echo "⏳ Čekanje da MySQL baza postane dostupna..."
# Čeka dok MySQL kontejner (host 'db') ne odgovori na pingu
while ! mysqladmin ping -h"db" --silent; do
    sleep 2
done
echo "✅ MySQL je dostupan!"

echo "🔄 Brisanje keša i kreiranje storage linka..."
php artisan config:clear
php artisan cache:clear
php artisan storage:link || true

echo "📦 Pokretanje migracija i seedera..."
# Pokreće migracije i seedere (puni bazu inicijalnim podacima iz Commita 5)
php artisan migrate:fresh --seed --force

echo "🚀 Pokretanje Laravel servera na portu 8000..."
# Pošto je studentski projekat, artisan serve je savršen za kontejner bez dodatnog Nginxa za backend
exec php artisan serve --host=0.0.0.0 --port=8000

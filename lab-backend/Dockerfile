# lab-backend/Dockerfile
FROM php:8.2-fpm

# Postavljanje radnog direktorijuma
WORKDIR /var/www/html

# Instalacija sistemskih zavisnosti
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    libpq-dev \
    zip \
    unzip \
    default-mysql-client \
    netcat-openbsd

# Čišćenje keša
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Instalacija PHP ekstenzija potrebnih za Laravel
# pdo_mysql  → lokalni Docker Compose (MySQL)
# pdo_pgsql  → produkcija na Render (PostgreSQL)
RUN docker-php-ext-install pdo_mysql pdo_pgsql mbstring exif pcntl bcmath gd fileinfo

# Instalacija Composera
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Kopiranje fajlova projekta u kontejner
COPY . .

# Instalacija Laravel zavisnosti
RUN composer install --no-interaction --optimize-autoloader --no-dev --no-scripts

# Generisanje key-a i storage linka (biće pregaženo entrypointom, ali je dobra praksa)
RUN php artisan key:generate || true

# Kreiranje direktorijuma ako ne postoje
RUN mkdir -p /var/www/html/storage /var/www/html/bootstrap/cache

# Postavljanje permisija (www-data je default korisnik za php-fpm)
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache
RUN chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# Kopiranje i setovanje entrypoint skripte
COPY docker-entrypoint.sh /usr/local/bin/
# Konverzija iz CRLF u LF (Windows/Linux kompatibilnost)
RUN sed -i 's/\r$//' /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Otvaranje porta 8000
EXPOSE 8000

# Pokretanje entrypoint skripte
ENTRYPOINT ["docker-entrypoint.sh"]
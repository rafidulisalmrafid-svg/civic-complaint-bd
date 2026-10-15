# ==========================================
# Multi-stage build for Civic Complaint BD
# ==========================================

# 1. Frontend Build Stage
FROM node:20-alpine AS node_builder
WORKDIR /app

COPY package*.json ./
RUN npm ci || npm install

COPY . .
RUN npm run build

# 2. Production PHP 8.3 & Nginx Stage
FROM php:8.3-fpm-alpine

# Install system utilities, Nginx, Supervisor, SQLite, and build dependencies
RUN apk add --no-cache \
    nginx \
    supervisor \
    curl \
    git \
    unzip \
    libpng \
    libpng-dev \
    libjpeg-turbo \
    libjpeg-turbo-dev \
    freetype \
    freetype-dev \
    libzip \
    libzip-dev \
    sqlite \
    sqlite-dev \
    icu-dev \
    oniguruma-dev \
    dos2unix

# Configure and install PHP extensions
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
        pdo \
        pdo_sqlite \
        mbstring \
        exif \
        pcntl \
        bcmath \
        gd \
        zip \
        intl \
        opcache

# Copy Composer binary
COPY --from=composer:2.7 /usr/bin/composer /usr/bin/composer

# Configure PHP settings for production & large uploads
RUN echo "upload_max_filesize = 64M" > /usr/local/etc/php/conf.d/custom.ini \
    && echo "post_max_size = 64M" >> /usr/local/etc/php/conf.d/custom.ini \
    && echo "memory_limit = 512M" >> /usr/local/etc/php/conf.d/custom.ini \
    && echo "max_execution_time = 300" >> /usr/local/etc/php/conf.d/custom.ini

WORKDIR /var/www

# Copy codebase
COPY . .

# Copy pre-compiled Vite bundles from stage 1
COPY --from=node_builder /app/public/build ./public/build

# Install production PHP dependencies
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Prepare directory structure
RUN mkdir -p database storage/framework/sessions storage/framework/views storage/framework/cache storage/app/public bootstrap/cache \
    && touch database/database.sqlite \
    && chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache /var/www/database \
    && chmod -R 775 /var/www/storage /var/www/bootstrap/cache /var/www/database

# Copy Nginx, Supervisord, and Entrypoint configurations
COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh

# Fix line endings and make executable
RUN dos2unix /usr/local/bin/entrypoint.sh \
    && chmod +x /usr/local/bin/entrypoint.sh

EXPOSE 80 10000

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]

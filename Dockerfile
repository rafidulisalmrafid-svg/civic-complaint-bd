# -----------------------------------------------------------------------------
# Stage 1: Build Frontend Assets (React + Inertia + Vite)
# -----------------------------------------------------------------------------
FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# -----------------------------------------------------------------------------
# Stage 2: Production PHP + Apache Environment
# -----------------------------------------------------------------------------
FROM php:8.3-apache

# Install system dependencies & libraries
RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    libzip-dev \
    libicu-dev \
    sqlite3 \
    libsqlite3-dev \
    zip \
    unzip \
    && rm -rf /var/lib/apt/lists/*

# Install required PHP extensions
RUN docker-php-ext-configure intl \
    && docker-php-ext-install -j$(nproc) \
    pdo_sqlite \
    mbstring \
    zip \
    intl \
    bcmath \
    opcache

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Enable Apache mod_rewrite
RUN a2enmod rewrite headers

# Copy custom Apache virtual host
COPY docker/apache.conf /etc/apache2/sites-available/000-default.conf

# Configure custom PHP upload and performance limits
RUN echo "upload_max_filesize = 100M" > /usr/local/etc/php/conf.d/custom-limits.ini \
    && echo "post_max_size = 120M" >> /usr/local/etc/php/conf.d/custom-limits.ini \
    && echo "memory_limit = 512M" >> /usr/local/etc/php/conf.d/custom-limits.ini \
    && echo "max_execution_time = 300" >> /usr/local/etc/php/conf.d/custom-limits.ini \
    && echo "max_input_time = 300" >> /usr/local/etc/php/conf.d/custom-limits.ini \
    && echo "variables_order = 'GPCS'" >> /usr/local/etc/php/conf.d/custom-limits.ini

WORKDIR /var/www/html

# Copy application code
COPY . /var/www/html

# Copy compiled frontend assets from Stage 1
COPY --from=frontend-builder /app/public/build /var/www/html/public/build

# Install composer production dependencies
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Prepare permissions
RUN mkdir -p /var/www/html/storage /var/www/html/bootstrap/cache /var/www/html/database \
    && chown -R www-data:www-data /var/www/html \
    && chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# Copy and setup entrypoint script
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

EXPOSE 10000

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]

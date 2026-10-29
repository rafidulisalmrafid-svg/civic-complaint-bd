#!/bin/bash
set -e

# Configure Apache port from Render's dynamic $PORT environment variable (defaults to 10000)
PORT="${PORT:-10000}"
sed -i "s/Listen 80/Listen ${PORT}/g" /etc/apache2/ports.conf 2>/dev/null || true
echo "Listen ${PORT}" > /etc/apache2/ports.conf
sed -i "s/<VirtualHost \*:.*>/<VirtualHost \*:${PORT}>/g" /etc/apache2/sites-available/*.conf 2>/dev/null || true

# Ensure SQLite database exists
mkdir -p /var/www/html/database
if [ ! -f /var/www/html/database/database.sqlite ]; then
    touch /var/www/html/database/database.sqlite
fi

# Ensure storage directories exist and are writable
mkdir -p /var/www/html/storage/framework/{sessions,views,cache}
mkdir -p /var/www/html/storage/logs
mkdir -p /var/www/html/storage/app/public
chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache /var/www/html/database
chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache /var/www/html/database

# Run Laravel setup
php artisan storage:link || true
php artisan migrate --force || true
php artisan db:seed --force || true
php artisan config:cache || true
php artisan route:cache || true
php artisan view:cache || true

echo "Starting Apache web server on port ${PORT}..."
exec apache2-foreground

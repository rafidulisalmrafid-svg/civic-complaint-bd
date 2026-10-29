#!/bin/bash
set -e

# Configure Apache port from Render's dynamic $PORT environment variable (defaults to 10000)
PORT="${PORT:-10000}"
sed -i "s/Listen 80/Listen ${PORT}/g" /etc/apache2/ports.conf 2>/dev/null || true
echo "Listen ${PORT}" > /etc/apache2/ports.conf
sed -i "s/<VirtualHost \*:.*>/<VirtualHost \*:${PORT}>/g" /etc/apache2/sites-available/*.conf 2>/dev/null || true

# If APP_KEY is empty or not starting with base64:, provide a fallback key
if [ -z "$APP_KEY" ] || [[ ! "$APP_KEY" == base64:* ]]; then
    export APP_KEY="base64:Rr+QegrnoWVcN+YZLoBvthY8zoxsJuth8PWaeIJH54I="
fi

# Ensure storage directories exist and are writable
mkdir -p /var/www/html/storage/framework/{sessions,views,cache}
mkdir -p /var/www/html/storage/logs
mkdir -p /var/www/html/storage/app/public

# Ensure SQLite database directory and file exist with correct permissions
mkdir -p /var/www/html/database
if [ ! -f /var/www/html/database/database.sqlite ]; then
    touch /var/www/html/database/database.sqlite
fi

# Set proper ownership and permissions for Apache (www-data)
chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache /var/www/html/database
chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache /var/www/html/database

# Ensure public storage link exists
php artisan storage:link || true

# Run database migrations
php artisan migrate --force || true

# Seed database only if users table is empty
php -r "require 'vendor/autoload.php'; \$app = require_once 'bootstrap/app.php'; \$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap(); if (\App\Models\User::count() === 0) { echo 'Seeding initial data... '; \Illuminate\Support\Facades\Artisan::call('db:seed', ['--force' => true]); echo \"Done.\n\"; }" || true

# Ensure permissions again after migration & seeding
chown -R www-data:www-data /var/www/html/database
chmod -R 775 /var/www/html/database

# Clear any cached config so environment variables are dynamically read
php artisan config:clear || true
php artisan route:clear || true
php artisan view:clear || true

echo "Starting Apache web server on port ${PORT}..."
exec apache2-foreground

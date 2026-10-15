#!/bin/sh
set -e

PORT="${PORT:-10000}"
echo "Configuring Nginx to listen on port: $PORT"
sed -i "s/LISTEN_PORT/$PORT/g" /etc/nginx/nginx.conf

# Ensure directories exist
mkdir -p /var/www/database /var/www/storage/framework/cache /var/www/storage/framework/sessions /var/www/storage/framework/views /var/www/storage/app/public /var/www/bootstrap/cache

# Ensure SQLite file exists
if [ ! -f /var/www/database/database.sqlite ]; then
    echo "Creating empty database/database.sqlite..."
    touch /var/www/database/database.sqlite
    php artisan migrate --force --seed
else
    echo "Existing database found, running migrations..."
    php artisan migrate --force
fi

# Link storage
echo "Linking storage..."
php artisan storage:link || true

# Set app key fallback
export APP_KEY="${APP_KEY:-base64:7vG3q+X9+d0R3fFk68A5PZ3bT28j9zL4H7sQ1y5+A9w=}"

# Clear previous cache and re-cache
php artisan optimize:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Set permissions for www-data
echo "Setting permissions..."
chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache /var/www/database
chmod -R 775 /var/www/storage /var/www/bootstrap/cache /var/www/database

echo "Starting services via supervisord..."
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf

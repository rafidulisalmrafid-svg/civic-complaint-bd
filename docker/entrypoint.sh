#!/bin/sh
set -e

PORT="${PORT:-10000}"
echo "Configuring Nginx to listen on port: $PORT"
sed -i "s/LISTEN_PORT/$PORT/g" /etc/nginx/nginx.conf

# Production Environment Fallbacks
export APP_NAME="${APP_NAME:-ই-অভিযোগ বাক্স}"
export APP_ENV="${APP_ENV:-production}"
export APP_DEBUG="${APP_DEBUG:-false}"
export APP_KEY="${APP_KEY:-base64:7vG3q+X9+d0R3fFk68A5PZ3bT28j9zL4H7sQ1y5+A9w=}"
export DB_CONNECTION=sqlite
export DB_DATABASE=/var/www/database/database.sqlite
export CACHE_STORE="${CACHE_STORE:-file}"
export CACHE_DRIVER="${CACHE_DRIVER:-file}"
export SESSION_DRIVER="${SESSION_DRIVER:-file}"
export QUEUE_CONNECTION="${QUEUE_CONNECTION:-sync}"

# Ensure directories exist
mkdir -p /var/www/database /var/www/storage/framework/cache /var/www/storage/framework/sessions /var/www/storage/framework/views /var/www/storage/app/public /var/www/bootstrap/cache

# Ensure SQLite file exists and is populated
if [ ! -s /var/www/database/database.sqlite ]; then
    echo "Creating and seeding database/database.sqlite..."
    touch /var/www/database/database.sqlite
    php artisan migrate:fresh --force --seed
else
    echo "Existing database found, running migrations..."
    php artisan migrate --force
fi

# Link storage
echo "Linking storage..."
php artisan storage:link || true

# Safe cache optimization
echo "Caching configurations and routes..."
php artisan config:clear || true
php artisan route:clear || true
php artisan view:clear || true
php artisan config:cache || true
php artisan route:cache || true
php artisan view:cache || true

# Set permissions for www-data
echo "Setting permissions..."
chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache /var/www/database
chmod -R 775 /var/www/storage /var/www/bootstrap/cache /var/www/database

echo "Starting services via supervisord on port $PORT..."
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf

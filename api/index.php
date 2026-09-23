<?php

// Forward all Vercel serverless requests with /tmp writable paths

$storageDirs = [
    '/tmp/storage',
    '/tmp/storage/app',
    '/tmp/storage/app/public',
    '/tmp/storage/framework',
    '/tmp/storage/framework/cache',
    '/tmp/storage/framework/cache/data',
    '/tmp/storage/framework/sessions',
    '/tmp/storage/framework/views',
    '/tmp/storage/logs',
    '/tmp/bootstrap/cache',
];

foreach ($storageDirs as $dir) {
    if (!is_dir($dir)) {
        @mkdir($dir, 0755, true);
    }
}

// Copy SQLite database to /tmp if not already present
$sqliteDest = '/tmp/database.sqlite';
if (!file_exists($sqliteDest)) {
    $sqliteSrc = dirname(__DIR__) . '/database/database.sqlite';
    if (file_exists($sqliteSrc)) {
        @copy($sqliteSrc, $sqliteDest);
    } else {
        @touch($sqliteDest);
    }
}

// Environment variables
$appKey = 'base64:7vG3q+X9+d0R3fFk68A5PZ3bT28j9zL4H7sQ1y5+A9w=';
putenv('APP_ENV=production');
putenv('APP_DEBUG=true');
putenv("APP_KEY={$appKey}");
putenv('APP_URL=https://civic-complaint-bd.vercel.app');
putenv('DB_CONNECTION=sqlite');
putenv("DB_DATABASE={$sqliteDest}");
putenv('APP_STORAGE=/tmp/storage');
putenv('VIEW_COMPILED_PATH=/tmp/storage/framework/views');
putenv('APP_PACKAGES_CACHE=/tmp/storage/framework/cache/packages.php');
putenv('APP_SERVICES_CACHE=/tmp/storage/framework/cache/services.php');
putenv('APP_CONFIG_CACHE=/tmp/storage/framework/cache/config.php');
putenv('APP_ROUTES_CACHE=/tmp/storage/framework/cache/routes.php');
putenv('APP_EVENTS_CACHE=/tmp/storage/framework/cache/events.php');
putenv('SESSION_DRIVER=cookie');
putenv('CACHE_STORE=array');
putenv('LOG_CHANNEL=stderr');

$_ENV['APP_ENV'] = 'production';
$_ENV['APP_DEBUG'] = 'true';
$_ENV['APP_KEY'] = $appKey;
$_ENV['APP_URL'] = 'https://civic-complaint-bd.vercel.app';
$_ENV['DB_CONNECTION'] = 'sqlite';
$_ENV['DB_DATABASE'] = $sqliteDest;
$_ENV['APP_STORAGE'] = '/tmp/storage';
$_ENV['VIEW_COMPILED_PATH'] = '/tmp/storage/framework/views';
$_ENV['APP_PACKAGES_CACHE'] = '/tmp/storage/framework/cache/packages.php';
$_ENV['APP_SERVICES_CACHE'] = '/tmp/storage/framework/cache/services.php';
$_ENV['APP_CONFIG_CACHE'] = '/tmp/storage/framework/cache/config.php';
$_ENV['APP_ROUTES_CACHE'] = '/tmp/storage/framework/cache/routes.php';
$_ENV['APP_EVENTS_CACHE'] = '/tmp/storage/framework/cache/events.php';
$_ENV['SESSION_DRIVER'] = 'cookie';
$_ENV['CACHE_STORE'] = 'array';
$_ENV['LOG_CHANNEL'] = 'stderr';

$_SERVER['APP_ENV'] = 'production';
$_SERVER['APP_DEBUG'] = 'true';
$_SERVER['APP_KEY'] = $appKey;
$_SERVER['DB_CONNECTION'] = 'sqlite';
$_SERVER['DB_DATABASE'] = $sqliteDest;

// Prevent Symfony from treating /api as script base directory
$_SERVER['SCRIPT_NAME'] = '/index.php';
$_SERVER['PHP_SELF'] = '/index.php';
$_SERVER['SCRIPT_FILENAME'] = dirname(__DIR__) . '/public/index.php';

require dirname(__DIR__) . '/vendor/autoload.php';

/** @var \Illuminate\Foundation\Application $app */
$app = require_once dirname(__DIR__) . '/bootstrap/app.php';

$app->useStoragePath('/tmp/storage');

$app->handleRequest(\Illuminate\Http\Request::capture());

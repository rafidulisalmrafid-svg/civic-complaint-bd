<?php

// Forward all Vercel serverless requests to public/index.php with /tmp storage paths

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
];

foreach ($storageDirs as $dir) {
    if (!is_dir($dir)) {
        @mkdir($dir, 0755, true);
    }
}

// Copy SQLite database to /tmp if not already present
$sqliteDest = '/tmp/database.sqlite';
if (!file_exists($sqliteDest)) {
    $sqliteSrc = __DIR__ . '/../database/database.sqlite';
    if (file_exists($sqliteSrc)) {
        @copy($sqliteSrc, $sqliteDest);
    } else {
        @touch($sqliteDest);
    }
}

// Environment overrides for Vercel Serverless
putenv('DB_CONNECTION=sqlite');
putenv("DB_DATABASE={$sqliteDest}");
putenv('APP_STORAGE=/tmp/storage');
putenv('VIEW_COMPILED_PATH=/tmp/storage/framework/views');
putenv('SESSION_DRIVER=cookie');
putenv('CACHE_STORE=array');
putenv('LOG_CHANNEL=stderr');

$_ENV['DB_CONNECTION'] = 'sqlite';
$_ENV['DB_DATABASE'] = $sqliteDest;
$_ENV['APP_STORAGE'] = '/tmp/storage';
$_ENV['VIEW_COMPILED_PATH'] = '/tmp/storage/framework/views';
$_ENV['SESSION_DRIVER'] = 'cookie';
$_ENV['CACHE_STORE'] = 'array';
$_ENV['LOG_CHANNEL'] = 'stderr';

require __DIR__ . '/../public/index.php';

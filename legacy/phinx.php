<?php

require_once 'vendor/autoload.php';

// Load .env file
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

// Muat konfigurasi database kita yang sudah ada
require_once 'config/database.php';

return
[
    'paths' => [
        'migrations' => '%%PHINX_CONFIG_DIR%%/database/migrations',
        'seeds' => '%%PHINX_CONFIG_DIR%%/database/seeds',
    ],
    'environments' => [
        'default_migration_table' => 'phinxlog', // Ini adalah nama tabel pelacak migrasi
        'default_environment' => 'development',

        'development' => [
            'adapter' => 'mysql',
            'host' => $_ENV['DB_HOST'] ?? 'localhost',
            'name' => $_ENV['DB_NAME'] ?? 'sigap_pnj',
            'user' => $_ENV['DB_USER'] ?? 'root',
            'pass' => $_ENV['DB_PASS'] ?? '',
            'port' => $_ENV['DB_PORT'] ?? 3306,
            'charset' => 'utf8mb4',
        ],

        // Anda bisa tambahkan konfigurasi untuk server production nanti
        // 'production' => [
        //     'adapter' => 'mysql',
        //     'host' => 'HOST_SERVER_ANDA',
        //     'name' => 'NAMA_DB_PRODUKSI',
        //     'user' => 'USER_DB_PRODUKSI',
        //     'pass' => 'PASSWORD_DB_PRODUKSI',
        //     'port' => 3306,
        //     'charset' => 'utf8mb4',
        // ]
    ],
    'version_order' => 'creation',
];

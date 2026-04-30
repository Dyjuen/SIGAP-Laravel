<?php

/**
 * Script untuk membersihkan entry MISSING MIGRATION FILE dari phinxlog
 *
 * Cara pakai:
 * php clean-phinxlog.php
 */
echo '';
echo "🧹 Clean Phinxlog - Hapus Entry Missing Migration\n";
echo "================================================\n\n";

// Load config Phinx
$config = require 'phinx.php';
$env = $config['environments']['development'];

// Koneksi database
try {
    $dsn = sprintf(
        'mysql:host=%s;port=%s;dbname=%s;charset=%s',
        $env['host'],
        $env['port'] ?? 3306,
        $env['name'],
        $env['charset']
    );

    $pdo = new PDO($dsn, $env['user'], $env['pass']);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    echo "✅ Berhasil koneksi ke database: {$env['name']}\n\n";

    // Cari missing migrations
    $stmt = $pdo->query('SELECT version, migration_name FROM phinxlog ORDER BY version');
    $migrations = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $missingMigrations = [];
    $migrationPath = __DIR__.'/database/migrations';

    foreach ($migrations as $migration) {
        $version = $migration['version'];
        $pattern = $migrationPath.'/'.$version.'_*.php';
        $files = glob($pattern);

        if (empty($files)) {
            $missingMigrations[] = $migration;
            echo "❌ Missing: {$version} - {$migration['migration_name']}\n";
        }
    }

    if (empty($missingMigrations)) {
        echo "✅ Tidak ada missing migration. Database bersih!\n";
        exit(0);
    }

    echo "\n📋 Total missing migrations: ".count($missingMigrations)."\n\n";

    // Konfirmasi
    echo "⚠️  Hapus entry di atas dari phinxlog?\n";
    echo "Ketik 'yes' untuk melanjutkan: ";
    $handle = fopen('php://stdin', 'r');
    $line = fgets($handle);
    $confirmation = trim($line);
    fclose($handle);

    if ($confirmation !== 'yes') {
        echo "\n❌ Dibatalkan.\n";
        exit(0);
    }

    // Hapus entry missing
    $versions = array_column($missingMigrations, 'version');
    $placeholders = str_repeat('?,', count($versions) - 1).'?';

    $sql = "DELETE FROM phinxlog WHERE version IN ($placeholders)";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($versions);

    $deletedCount = $stmt->rowCount();

    echo "\n✅ Berhasil menghapus {$deletedCount} entry dari phinxlog!\n";
    echo "\n📊 Jalankan status untuk verifikasi:\n";
    echo "   vendor/bin/phinx status -c phinx.php\n";

} catch (PDOException $e) {
    echo "\n❌ Error: ".$e->getMessage()."\n";
    exit(1);
}

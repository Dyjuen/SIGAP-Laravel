<?php

// ============================================================================
// router.php — SIGAP-PNJ (Fix Binary Output & 403 issues + API Routes)
// ============================================================================

// Nonaktifkan buffering supaya gak bocor output
while (ob_get_level()) {
    ob_end_clean();
}

// Load Composer autoloader (WAJIB)
require_once __DIR__.'/vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

require_once __DIR__.'/config/database.php';

$uri = urldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));
$baseDir = __DIR__.'/public';

// Fungsi MIME
function getMimeType($ext)
{
    static $mimes = [
        'css' => 'text/css',
        'js' => 'application/javascript',
        'json' => 'application/json',
        'png' => 'image/png',
        'jpg' => 'image/jpeg',
        'jpeg' => 'image/jpeg',
        'gif' => 'image/gif',
        'svg' => 'image/svg+xml',
        'ico' => 'image/x-icon',
        'woff' => 'font/woff',
        'woff2' => 'font/woff2',
        'ttf' => 'font/ttf',
        'mp4' => 'video/mp4',
        'webp' => 'image/webp',
        'html' => 'text/html',
        'map' => 'application/json',
    ];

    return $mimes[strtolower($ext)] ?? 'application/octet-stream';
}

// ============================================================================
// 1️⃣ Handle API Routes - PRIORITY TERTINGGI!
// ============================================================================
if (strpos($uri, '/api/') === 0) {
    // Bersihkan output buffer untuk API
    while (ob_get_level()) {
        ob_end_clean();
    }

    // Load API router
    $apiRouter = __DIR__.'/routes/api.php';
    if (file_exists($apiRouter)) {
        require_once $apiRouter;
        exit;
    }

    // Jika routes/api.php tidak ada, coba alternatif
    $apiRouter2 = __DIR__.'/api/routes/api.php';
    if (file_exists($apiRouter2)) {
        require_once $apiRouter2;
        exit;
    }

    // API endpoint tidak ditemukan
    http_response_code(404);
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'message' => 'API endpoint tidak ditemukan',
    ]);
    exit;
}

// ============================================================================
// 2️⃣ Tangani file statis
// ============================================================================
$filePath = realpath($baseDir.$uri);

if (! $filePath || ! file_exists($filePath)) {
    $filePath = $baseDir.$uri;
}

if (file_exists($filePath) && is_file($filePath)) {
    $ext = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));
    $mime = getMimeType($ext);

    // Bersihkan output buffer
    while (ob_get_level()) {
        ob_end_clean();
    }

    // Header aman untuk file biner
    header('Content-Type: '.$mime);
    header('Content-Length: '.filesize($filePath));
    header('Cache-Control: public, max-age=0'); // Changed from 31536000 to 0 for development
    header('Accept-Ranges: bytes');

    // Kirim file mentah
    $fp = fopen($filePath, 'rb');
    fpassthru($fp);
    fclose($fp);
    exit;
}

// ============================================================================
// 3️⃣ Fallback ke .html jika /login → /login.html
// ============================================================================
if (! file_exists($filePath) && file_exists($filePath.'.html')) {
    $filePath .= '.html';
    header('Content-Type: text/html');
    readfile($filePath);
    exit;
}

// ============================================================================
// 4️⃣ Fallback index.html untuk route SPA
// ============================================================================
$indexFile = $baseDir.'/index.html';
if (file_exists($indexFile)) {
    header('Content-Type: text/html');
    readfile($indexFile);
    exit;
}

// ============================================================================
// 5️⃣ Kalau semua gagal → 404
// ============================================================================
http_response_code(404);
echo "<h1>404 Not Found</h1><p>Resource not found: {$uri}</p>";

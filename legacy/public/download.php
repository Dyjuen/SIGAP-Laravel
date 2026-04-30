<?php

require_once __DIR__.'/../app/Core/Response.php'; // Adjust path as needed
require_once __DIR__.'/../app/Models/KegiatanLampiran.php'; // Adjust path as needed
require_once __DIR__.'/../app/Middlewares/AuthMiddleware.php'; // Adjust path as needed

use App\Core\Response;
use App\Middlewares\AuthMiddleware;
use App\Models\KegiatanLampiran;

// Initialize AuthMiddleware to get user context
$authMiddleware = new AuthMiddleware;
$authMiddleware->handle(); // This will populate $_SESSION['user'] or exit if unauthorized
session_start();
$user = $_SESSION['user'] ?? null;

if (! $user) {
    Response::unauthorized('User tidak terautentikasi.');
    exit();
}

$lampiranId = $_GET['id'] ?? null; // Prefer using ID for security
$filePathFromQuery = $_GET['path'] ?? null; // Fallback to path if ID not used (less secure)

$baseUploadDir = __DIR__.'/../storage/uploads/documents/';

if ($lampiranId) {
    $lampiranModel = new KegiatanLampiran;
    $lampiran = $lampiranModel->find($lampiranId);

    if (! $lampiran) {
        Response::notFound('File lampiran tidak ditemukan.');
        exit();
    }

    $fullPath = $baseUploadDir.basename($lampiran['path_file_disimpan']); // Use basename for security
    $originalFileName = $lampiran['nama_file_asli'];

    // Authorization check (example: only pengusul or bendahara for now)
    // You might need more granular checks based on the specific lampiran and kegiatan
    $isBendahara = in_array('Bendahara', $user['roles']);
    // For a specific lampiran, we might need to get its associated kegiatan and check pengusul_user_id
    // This requires joining or fetching kegiatan data from lampiran.
    // For simplicity, let's assume bendahara can view all, and pengusul can view their own.
    // A more robust solution would involve fetching kegiatan_id from $lampiran, then the kegiatan owner.

    // Temporary: Allow Bendahara to see everything for now, or if it's the uploader
    if (! $isBendahara && $lampiran['uploader_user_id'] != $user['user_id']) {
        Response::forbidden('Anda tidak memiliki izin untuk mengunduh file ini.');
        exit();
    }

} elseif ($filePathFromQuery) {
    // THIS IS LESS SECURE AND SHOULD BE AVOIDED IF POSSIBLE
    // Consider migrating all frontend links to use lampiran_id instead of path
    $fileName = basename($filePathFromQuery); // Extract just the file name
    $fullPath = $baseUploadDir.$fileName;
    $originalFileName = $fileName; // Best guess for original file name

    // Strict validation to prevent directory traversal
    if (strpos($filePathFromQuery, '..') !== false || strpos($filePathFromQuery, '/') !== false || strpos($filePathFromQuery, '\\') !== false) {
        Response::forbidden('Path file tidak valid.');
        exit();
    }
    if (! file_exists($fullPath)) {
        Response::notFound('File tidak ditemukan.');
        exit();
    }

    // Authorization check would be harder here without lampiran_id
    // For now, if using path, rely on file system permissions or broader access.
    // It's highly recommended to use lampiranId for secure access control.

} else {
    Response::error('Parameter ID atau path file tidak ditemukan.', 400);
    exit();
}

if (! file_exists($fullPath)) {
    Response::notFound('File tidak ditemukan.');
    exit();
}

// Set headers for inline display
$mimeType = mime_content_type($fullPath);
if ($mimeType === false) {
    // Fallback if mime_content_type fails
    $mimeType = 'application/octet-stream';
}

header('Content-Type: '.$mimeType);
header('Content-Disposition: inline; filename="'.($originalFileName).'"');
header('Expires: 0');
header('Cache-Control: must-revalidate');
header('Pragma: public');
header('Content-Length: '.filesize($fullPath));
readfile($fullPath);
exit();

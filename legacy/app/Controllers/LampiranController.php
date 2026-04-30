<?php

namespace App\Controllers;

use App\Core\FileUpload;
use App\Core\Response;
use App\Middlewares\AuthMiddleware;
use App\Models\KAK;
use App\Models\KAKAnggaran;
use App\Models\Kegiatan;
use App\Models\KegiatanLampiran;

class LampiranController
{
    private $kegiatanModel;

    private $lampiranModel;

    private $kakModel;

    private $kakAnggaranModel;

    private $fileUpload;

    protected $user;

    public function __construct()
    {
        // Initialize middleware
        $middleware = new AuthMiddleware;
        $middleware->handle();

        // Get authenticated user
        $this->user = AuthMiddleware::getAuthUser();

        if (! $this->user) {
            Response::unauthorized('User tidak terautentikasi.');
        }

        // Initialize models and utilities
        $this->kegiatanModel = new Kegiatan;
        $this->lampiranModel = new KegiatanLampiran;
        $this->kakModel = new KAK;
        $this->kakAnggaranModel = new KAKAnggaran;
        $this->fileUpload = new FileUpload;
    }

    /**
     * Get all lampiran for a kegiatan
     *
     * GET /api/kegiatan/{id}/lampiran
     */
    public function index()
    {
        try {
            // Get kegiatan_id from URL
            $kegiatanId = $this->extractKegiatanId();

            if (! $kegiatanId) {
                Response::error('Kegiatan ID tidak valid.', 400);
            }

            // Check if kegiatan exists
            $kegiatan = $this->kegiatanModel->find($kegiatanId);
            if (! $kegiatan) {
                Response::notFound('Kegiatan tidak ditemukan.');
            }

            // Authorization check
            $this->checkAccess($kegiatan);

            // Get lampiran list
            $lampiran = $this->lampiranModel->getByKegiatanId($kegiatanId);

            Response::success([
                'lampiran' => $lampiran,
                'summary' => [
                    'jumlah_file' => count($lampiran),
                    'max_files' => 10,
                ],
            ], 'Data lampiran berhasil diambil.');

        } catch (\Exception $e) {
            Response::error('Gagal mengambil data lampiran: '.$e->getMessage(), 500);
        }
    }

    /**
     * Upload lampiran
     *
     * POST /api/kegiatan/{id}/lampiran
     * Content-Type: multipart/form-data
     */
    public function upload()
    {
        try {
            // Get kegiatan_id from URL
            $kegiatanId = $this->extractKegiatanId();

            if (! $kegiatanId) {
                Response::error('Kegiatan ID tidak valid.', 400);
            }

            // Check if kegiatan exists
            $kegiatan = $this->kegiatanModel->find($kegiatanId);
            if (! $kegiatan) {
                Response::notFound('Kegiatan tidak ditemukan.');
            }

            if ($kegiatan['pengusul_user_id'] != $this->user['user_id'] && ! $this->hasRole('Admin')) {
                Response::forbidden('Anda tidak memiliki akses untuk upload lampiran.');
            }

            // Cannot upload if not Draft or Revisi
            if (! in_array($kegiatan['status_id'], [1, 5])) {
                Response::error('Lampiran hanya bisa diupload jika kegiatan berstatus Draft atau Revisi.', 400);
            }

            // Check max files limit (10)
            $existingFiles = $this->lampiranModel->countByKegiatanId($kegiatanId);
            if ($existingFiles >= 10) {
                Response::error('Maksimal 10 file per kegiatan. Hapus file lama terlebih dahulu.', 400);
            }

            // Check if file exists
            if (! isset($_FILES['file'])) {
                Response::badRequest('File tidak ditemukan. Gunakan key "file" untuk upload.');
            }

            // Upload file
            $uploadResult = $this->fileUpload->upload($_FILES['file']);

            if (! $uploadResult['success']) {
                Response::error($uploadResult['message'], 400);
            }

            // Get keterangan from POST data (optional)
            $keterangan = $_POST['keterangan'] ?? null;

            // Save to database
            $lampiranId = $this->lampiranModel->create([
                'kegiatan_id' => $kegiatanId,
                'nama_file' => $uploadResult['original_name'],
                'file_path' => $uploadResult['file_path'],
                'file_size' => $uploadResult['file_size'],
                'mime_type' => $uploadResult['mime_type'],
                'keterangan' => $keterangan,
                'uploader_user_id' => $this->user['user_id'],
            ]);

            // Get created lampiran
            $lampiran = $this->lampiranModel->find($lampiranId);

            Response::created($lampiran, 'File berhasil diupload.');

        } catch (\Exception $e) {
            Response::error('Gagal upload file: '.$e->getMessage(), 500);
        }
    }

    /**
     * Download lampiran
     *
     * GET /api/kegiatan/{id}/lampiran/{file_id}
     */
    public function download()
    {
        try {
            // Get IDs from URL
            $ids = $this->extractLampiranIds();
            $kegiatanId = $ids['kegiatan_id'];
            $lampiranId = $ids['lampiran_id'];

            if (! $kegiatanId || ! $lampiranId) {
                Response::error('ID tidak valid.', 400);
            }

            // Check if kegiatan exists
            $kegiatan = $this->kegiatanModel->find($kegiatanId);
            if (! $kegiatan) {
                Response::notFound('Kegiatan tidak ditemukan.');
            }

            // Check if lampiran exists
            $lampiran = $this->lampiranModel->find($lampiranId);
            if (! $lampiran || $lampiran['kegiatan_id'] != $kegiatanId) {
                Response::notFound('File tidak ditemukan.');
            }

            // Authorization check
            $this->checkAccess($kegiatan);

            // Check if file exists on server
            $filePath = $_SERVER['DOCUMENT_ROOT'].$lampiran['file_path'];

            if (! file_exists($filePath)) {
                Response::notFound('File tidak ditemukan di server.');
            }

            // Download file
            header('Content-Type: '.$lampiran['mime_type']);
            header('Content-Disposition: attachment; filename="'.$lampiran['nama_file'].'"');
            header('Content-Length: '.filesize($filePath));
            header('Cache-Control: no-cache, must-revalidate');
            header('Expires: 0');

            readfile($filePath);
            exit;

        } catch (\Exception $e) {
            Response::error('Gagal download file: '.$e->getMessage(), 500);
        }
    }

    /**
     * Delete lampiran
     *
     * DELETE /api/kegiatan/{id}/lampiran/{file_id}
     */
    public function delete()
    {
        try {
            // Get IDs from URL
            $ids = $this->extractLampiranIds();
            $kegiatanId = $ids['kegiatan_id'];
            $lampiranId = $ids['lampiran_id'];

            if (! $kegiatanId || ! $lampiranId) {
                Response::error('ID tidak valid.', 400);
            }

            // Check if kegiatan exists
            $kegiatan = $this->kegiatanModel->find($kegiatanId);
            if (! $kegiatan) {
                Response::notFound('Kegiatan tidak ditemukan.');
            }

            // Check if lampiran exists
            $lampiran = $this->lampiranModel->find($lampiranId);
            if (! $lampiran || $lampiran['kegiatan_id'] != $kegiatanId) {
                Response::notFound('File tidak ditemukan.');
            }

            // Authorization
            if ($kegiatan['pengusul_user_id'] != $this->user['user_id'] && ! $this->hasRole('Admin')) {
                Response::forbidden('Anda tidak memiliki akses untuk menghapus lampiran.');
            }

            // Cannot delete if not Draft or Revisi
            if (! in_array($kegiatan['status_id'], [1, 5])) {
                Response::error('Lampiran hanya bisa dihapus jika kegiatan berstatus Draft atau Revisi.', 400);
            }

            // Archive from database
            $this->lampiranModel->update($lampiranId, ['status_lampiran' => 'archived']);

            Response::success(null, 'File berhasil dihapus.');

        } catch (\Exception $e) {
            Response::error('Gagal menghapus file: '.$e->getMessage(), 500);
        }
    }

    /**
     * Helper: Check access
     */
    private function checkAccess($kegiatan)
    {
        // Admin dan Verifikator bisa lihat semua
        if ($this->hasRole('Admin') || $this->hasRole('Verifikator')) {
            return;
        }

        // Pengusul hanya bisa akses kegiatan sendiri
        if ($kegiatan['pengusul_user_id'] != $this->user['user_id']) {
            Response::forbidden('Anda tidak memiliki akses ke kegiatan ini.');
        }
    }

    /**
     * Helper: Check if user has role
     */
    private function hasRole($roleName)
    {
        return in_array($roleName, $this->user['roles'] ?? []);
    }

    /**
     * Helper: Extract kegiatan_id from URL
     */
    private function extractKegiatanId()
    {
        $uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

        // Pattern: /api/kegiatan/{id}/lampiran
        if (preg_match('/\/kegiatan\/(\d+)\/lampiran(?:\/)?$/', $uri, $matches)) {
            return (int) $matches[1];
        }

        return null;
    }

    /**
     * Helper: Extract kegiatan_id and lampiran_id from URL
     */
    private function extractLampiranIds()
    {
        $uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

        // Pattern: /api/kegiatan/{id}/lampiran/{file_id}
        if (preg_match('/\/kegiatan\/(\d+)\/lampiran\/(\d+)(?:\/)?$/', $uri, $matches)) {
            return [
                'kegiatan_id' => (int) $matches[1],
                'lampiran_id' => (int) $matches[2],
            ];
        }

        return [
            'kegiatan_id' => null,
            'lampiran_id' => null,
        ];
    }

    /**
     * Get a single lampiran record.
     * GET /api/lampiran/{id}
     */
    public function show($id)
    {
        try {
            $lampiran = $this->lampiranModel->find($id);

            if (! $lampiran) {
                Response::notFound('Lampiran tidak ditemukan.');
            }

            // Grant access immediately if user is Bendahara
            if ($this->hasRole('Bendahara')) {
                Response::success($lampiran, 'Data lampiran berhasil diambil.');

                return;
            }

            // For other roles, verify ownership via KAK
            $anggaran = $this->kakAnggaranModel->find($lampiran['anggaran_id']);
            if (! $anggaran) {
                Response::forbidden('Tidak dapat memverifikasi anggaran terkait lampiran ini.');
            }

            $kak = $this->kakModel->find($anggaran['kak_id']);
            if (! $kak) {
                Response::forbidden('Tidak dapat memverifikasi KAK terkait lampiran ini.');
            }

            if ($kak['pengusul_user_id'] == $this->user['user_id']) {
                Response::success($lampiran, 'Data lampiran berhasil diambil.');
            } else {
                $ownerId = $kak['pengusul_user_id'] ?? 'null';
                $userId = $this->user['user_id'] ?? 'null';
                $anggaranId = $anggaran['anggaran_id'] ?? 'null';
                $kakId = $kak['kak_id'] ?? 'null';
                $errorMessage = "Anda tidak memiliki akses untuk melihat lampiran ini. (Debug: Lampiran ID: {$id}, Anggaran ID: {$anggaranId}, KAK ID: {$kakId}, Pengusul KAK di DB: [{$ownerId}], ID Anda login: [{$userId}])";
                Response::forbidden($errorMessage);
            }

        } catch (\Exception $e) {
            Response::error('Gagal mengambil data lampiran: '.$e->getMessage(), 500);
        }
    }

    /**
     * Save catatan for a lampiran, restricted to Bendahara/Admin.
     * Lampiran akan ditandai sebagai revision_requested, tidak dihapus langsung.
     *
     * POST /api/lampiran/{id}/catatan
     * Body: { "catatan": "Perbaiki lampiran ini..." }
     */
    public function saveCatatan()
    {
        try {
            // Authorization: Only Bendahara or Admin can add catatan
            if (! $this->hasRole('Bendahara') && ! $this->hasRole('Admin')) {
                Response::forbidden('Anda tidak memiliki akses untuk menyimpan catatan.');
            }

            // Get lampiran_id from URL
            $lampiranId = $this->extractLampiranIdOnly();
            if (! $lampiranId) {
                Response::badRequest('Lampiran ID tidak valid.');
            }

            // Get lampiran from DB
            $lampiran = $this->lampiranModel->find($lampiranId);
            if (! $lampiran) {
                Response::notFound('Lampiran tidak ditemukan.');
            }

            // Get catatan from request body
            $data = json_decode(file_get_contents('php://input'), true);
            $catatan = $data['catatan_reviewer'] ?? null;

            if ($catatan === null || trim($catatan) === '') {
                Response::badRequest('Catatan tidak boleh kosong.');
            }

            // Update lampiran dengan status revision_requested dan simpan catatan
            // Lampiran TIDAK dihapus, hanya ditandai untuk revisi
            $this->lampiranModel->addReviewerNotes($lampiranId, $catatan, $this->user['user_id']);

            // Fetch the updated record to return
            $updatedLampiran = $this->lampiranModel->find($lampiranId);

            Response::success($updatedLampiran, 'Catatan berhasil disimpan. Pengusul perlu melakukan revisi lampiran ini.');

        } catch (\Exception $e) {
            Response::error('Gagal menyimpan catatan: '.$e->getMessage(), 500);
        }
    }

    /**
     * Approve a lampiran, restricted to Bendahara/Admin.
     *
     * POST /api/lampiran/{id}/approve
     */
    public function approveLampiran()
    {
        try {
            // Authorization: Only Bendahara or Admin can approve
            if (! $this->hasRole('Bendahara') && ! $this->hasRole('Admin')) {
                Response::forbidden('Anda tidak memiliki akses untuk approve lampiran.');
            }

            // Get lampiran_id from URL
            $lampiranId = $this->extractLampiranIdOnly();
            if (! $lampiranId) {
                Response::badRequest('Lampiran ID tidak valid.');
            }

            // Get lampiran from DB
            $lampiran = $this->lampiranModel->find($lampiranId);
            if (! $lampiran) {
                Response::notFound('Lampiran tidak ditemukan.');
            }

            // Approve lampiran
            $this->lampiranModel->approveLampiran($lampiranId, $this->user['user_id']);

            // Fetch the updated record to return
            $updatedLampiran = $this->lampiranModel->find($lampiranId);

            Response::success($updatedLampiran, 'Lampiran berhasil disetujui.');

        } catch (\Exception $e) {
            Response::error('Gagal approve lampiran: '.$e->getMessage(), 500);
        }
    }

    /**
     * Resubmit lampiran (pengusul upload lampiran revisi)
     * Lampiran yang diminta revisi akan di-archive, yang baru menjadi pending.
     *
     * POST /api/lampiran/{id}/resubmit
     * Content-Type: multipart/form-data
     */
    public function resubmit()
    {
        try {
            // Get lampiran_id dari URL
            $lampiranId = $this->extractLampiranIdOnly();
            if (! $lampiranId) {
                Response::badRequest('Lampiran ID tidak valid.');
            }

            // Get lampiran from DB
            $lampiran = $this->lampiranModel->find($lampiranId);
            if (! $lampiran) {
                Response::notFound('Lampiran tidak ditemukan.');
            }

            // Check if lampiran memiliki revision request
            if ($lampiran['status_lampiran'] !== 'revision_requested') {
                Response::error('Lampiran ini tidak memerlukan revisi.', 400);
            }

            // Check if file exists
            if (! isset($_FILES['file'])) {
                Response::badRequest('File tidak ditemukan. Gunakan key "file" untuk upload.');
            }

            // Upload file
            $uploadResult = $this->fileUpload->upload($_FILES['file']);

            if (! $uploadResult['success']) {
                Response::error($uploadResult['message'], 400);
            }

            // Get keterangan from POST data (optional)
            $keterangan = $_POST['keterangan'] ?? null;

            // Data untuk lampiran baru
            $newLampiranData = [
                'anggaran_id' => $lampiran['anggaran_id'],
                'nama_file_asli' => $uploadResult['original_name'],
                'path_file_disimpan' => $uploadResult['file_path'],
                'uploader_user_id' => $this->user['user_id'],
                'catatan' => $keterangan,
            ];

            // Resubmit sebagai revisi (parent lampiran akan di-archive)
            $newLampiranId = $this->lampiranModel->resubmitAsRevision($lampiranId, $newLampiranData);

            if (! $newLampiranId) {
                Response::error('Gagal membuat revisi lampiran.', 500);
            }

            // Get created lampiran
            $lampiran = $this->lampiranModel->find($newLampiranId);

            Response::created($lampiran, 'Lampiran revisi berhasil diupload. Lampiranmu telah tersimpan dalam riwayat untuk referensi.');

        } catch (\Exception $e) {
            Response::error('Gagal resubmit lampiran: '.$e->getMessage(), 500);
        }
    }

    /**
     * Get lampiran history (termasuk previous revisions)
     *
     * GET /api/lampiran/{id}/history
     */
    public function getHistory()
    {
        try {
            // Get lampiran_id from URL
            $lampiranId = $this->extractLampiranIdOnly();
            if (! $lampiranId) {
                Response::badRequest('Lampiran ID tidak valid.');
            }

            // Get lampiran from DB
            $lampiran = $this->lampiranModel->find($lampiranId);
            if (! $lampiran) {
                Response::notFound('Lampiran tidak ditemukan.');
            }

            // Authorization: Only Bendahara or related pengusul can view history
            if (! $this->hasRole('Bendahara') && ! $this->hasRole('Admin')) {
                $anggaran = $this->kakAnggaranModel->find($lampiran['anggaran_id']);
                if (! $anggaran) {
                    Response::forbidden('Tidak dapat memverifikasi anggaran terkait lampiran ini.');
                }
                $kak = $this->kakModel->find($anggaran['kak_id']);
                if (! $kak || $kak['pengusul_user_id'] != $this->user['user_id']) {
                    Response::forbidden('Anda tidak memiliki akses untuk melihat riwayat lampiran ini.');
                }
            }

            // Get history
            $history = $this->lampiranModel->getLampiranHistory($lampiranId);

            Response::success([
                'history' => $history,
                'total_revisions' => count($history),
            ], 'Riwayat lampiran berhasil diambil.');

        } catch (\Exception $e) {
            Response::error('Gagal mengambil riwayat lampiran: '.$e->getMessage(), 500);
        }
    }

    /**
     * Helper: Extract lampiran_id from a simple URL structure.
     */
    private function extractLampiranIdOnly()
    {
        $uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

        // Pattern: /api/lampiran/{id}/catatan or /api/lampiran/{id}/stream or /api/lampiran/{id}/resubmit or /api/lampiran/{id}/approve or /api/lampiran/{id}/history
        if (preg_match('/\/lampiran\/(\d+)\/(?:catatan|stream|resubmit|approve|history)$/', $uri, $matches)) {
            return (int) $matches[1];
        }

        return null;
    }

    /**
     * Stream lampiran for inline viewing
     *
     * GET /api/lampiran/{id}/stream
     */
    public function stream()
    {
        try {
            // Get lampiran_id from URL
            $lampiranId = $this->extractLampiranIdOnly();

            if (! $lampiranId) {
                Response::error('ID lampiran tidak valid.', 400);

                return;
            }

            // Check if lampiran exists
            $lampiran = $this->lampiranModel->find($lampiranId);
            if (! $lampiran) {
                Response::notFound('File tidak ditemukan.');

                return;
            }

            // Authorization: Use the same logic as show() method
            if (! $this->hasRole('Bendahara')) {
                $anggaran = $this->kakAnggaranModel->find($lampiran['anggaran_id']);
                if (! $anggaran) {
                    Response::forbidden('Tidak dapat memverifikasi anggaran terkait lampiran ini.');

                    return;
                }
                $kak = $this->kakModel->find($anggaran['kak_id']);
                if (! $kak || $kak['pengusul_user_id'] != $this->user['user_id']) {
                    Response::forbidden('Anda tidak memiliki izin untuk melihat file ini.');

                    return;
                }
            }

            // The path stored in the DB should be relative to the document root.
            $relativePath = $lampiran['path_file_disimpan'];

            // Construct the full, absolute path
            $fullPath = $_SERVER['DOCUMENT_ROOT'].$relativePath;

            // Normalize the path to resolve '..' and '.' and check existence
            $realPath = realpath($fullPath);

            if ($realPath === false || ! file_exists($realPath)) {
                // Log the failure for debugging
                error_log("File not found for streaming. Lampiran ID: {$lampiranId}. Path checked: {$fullPath}");
                Response::notFound('File tidak ditemukan di server.');

                return;
            }

            // Stream file for inline viewing
            $mimeType = mime_content_type($realPath) ?: 'application/octet-stream';

            header('Content-Type: '.$mimeType);
            header('Content-Disposition: inline; filename="'.basename($lampiran['nama_file_asli']).'"');
            header('Content-Length: '.filesize($realPath));
            header('Cache-Control: no-cache, must-revalidate');
            header('Expires: 0');

            @ob_end_clean();
            readfile($realPath);
            exit;

        } catch (\Exception $e) {
            error_log("Streaming error for lampiran ID {$lampiranId}: ".$e->getMessage());
            Response::error('Gagal menampilkan file: '.$e->getMessage(), 500);
        }
    }
}

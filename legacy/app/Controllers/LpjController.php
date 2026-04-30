<?php

namespace App\Controllers;

use App\Core\Controller;
use App\Core\FileUpload;
use App\Core\Response;
use App\Middlewares\AuthMiddleware;
use App\Models\KAK;
use App\Models\KAKAnggaran;
use App\Models\Kegiatan;
use App\Models\KegiatanApproval;
use App\Models\KegiatanLampiran;
use App\Models\KegiatanLogStatus;
use App\Models\Notifikasi;
use App\Models\User;
use App\Services\KegiatanTimerService;
use App\Services\MailService;

 // Add this line

class LpjController extends Controller
{
    private $kegiatanModel;

    private $kakAnggaranModel;

    private $kegiatanLampiranModel;

    private $logStatusModel;

    private $mailService; // Add this line

    protected $user;

    public function __construct()
    {
        // 1. Handle auth first to populate the global user variable
        $middleware = new AuthMiddleware;
        $middleware->handle();

        // 2. Now, call the parent constructor which reads the global user variable
        parent::__construct();

        // 3. Check if the user was successfully fetched by the parent
        if (! $this->user) {
            Response::unauthorized('User tidak terautentikasi.');
        }

        // 4. Initialize models
        $this->kegiatanModel = new Kegiatan;
        $this->kakAnggaranModel = new KAKAnggaran;
        $this->kegiatanLampiranModel = new KegiatanLampiran;
        $this->logStatusModel = new KegiatanLogStatus;
        $this->mailService = new MailService; // Initialize MailService
    }

    /**
     * Submit LPJ for a given kegiatan.
     * Handles multipart/form-data with realization data and proof files.
     * POST /api/kegiatan/{kegiatan_id}/lpj
     */
    public function submit($kegiatanId)
    {
        error_log('Incoming _FILES: '.json_encode($_FILES)); // Debug line
        $db = $this->kegiatanModel->getDb();
        $uploader = new FileUpload(
            '/storage/uploads/documents/', // path
            ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'xls', 'xlsx'], // allowed extensions
            10485760 // 10 MB max size
        );
        $uploadedFiles = [];

        try {
            $kegiatanId = (int) $kegiatanId;

            // 1. Authorization & Validation
            $kegiatan = $this->kegiatanModel->find($kegiatanId);
            if (! $kegiatan) {
                return Response::notFound('Kegiatan tidak ditemukan.');
            }
            if ($kegiatan['kak_pengusul_user_id'] != $this->user['user_id']) {
                return Response::forbidden('Anda bukan pengusul kegiatan ini.');
            }
            if ($kegiatan['lpj_submitted_at'] !== null) {
                return Response::error('LPJ untuk kegiatan ini sudah pernah disubmit.', 400);
            }

            $realisasiData = $_POST['realisasi'] ?? [];
            $files = $_FILES['bukti'] ?? [];

            if (empty($realisasiData)) {
                return Response::error('Data realisasi tidak boleh kosong.', 422);
            }

            $db->beginTransaction();

            // 2. Process each budget item's realization
            foreach ($realisasiData as $anggaranId => $data) {
                // Sanitize and prepare data for update
                $volume1 = (float) ($data['volume1'] ?? 0);
                $volume2 = (float) ($data['volume2'] ?? 0);
                $volume3 = (float) ($data['volume3'] ?? 0);
                $hargaSatuan = (float) ($data['harga_satuan'] ?? 0);

                $totalVolume = $volume1 + $volume2 + $volume3;
                $realisasiJumlah = $totalVolume * $hargaSatuan;

                $updateData = [
                    'realisasi_volume1' => ($data['volume1'] === '' ? null : $data['volume1']),
                    'realisasi_satuan1_id' => ($data['satuan1_id'] === '' ? null : $data['satuan1_id']),
                    'realisasi_volume2' => ($data['volume2'] === '' ? null : $data['volume2']),
                    'realisasi_satuan2_id' => ($data['satuan2_id'] === '' ? null : $data['satuan2_id']),
                    'realisasi_volume3' => ($data['volume3'] === '' ? null : $data['volume3']),
                    'realisasi_satuan3_id' => ($data['satuan3_id'] === '' ? null : $data['satuan3_id']),
                    'realisasi_harga_satuan' => ($data['harga_satuan'] === '' ? null : $data['harga_satuan']),
                    'realisasi_jumlah' => $realisasiJumlah,
                ];

                // Update the t_kak_anggaran table
                $this->kakAnggaranModel->update($anggaranId, $updateData);

                // The file upload logic will be handled in a separate loop below
            }

            // 3. Process file uploads
            if (! empty($files)) {
                foreach ($files['name'] as $anggaranId => $fileList) {
                    if (! is_array($fileList)) {
                        continue;
                    }
                    foreach ($fileList as $fileIndex => $fileName) {
                        if (isset($files['error'][$anggaranId][$fileIndex]) && $files['error'][$anggaranId][$fileIndex] === UPLOAD_ERR_OK) {
                            $fileToUpload = [
                                'name' => $fileName,
                                'type' => $files['type'][$anggaranId][$fileIndex],
                                'tmp_name' => $files['tmp_name'][$anggaranId][$fileIndex],
                                'error' => $files['error'][$anggaranId][$fileIndex],
                                'size' => $files['size'][$anggaranId][$fileIndex],
                            ];

                            $uploadResult = $uploader->upload($fileToUpload);
                            if (! $uploadResult['success']) {
                                throw new \Exception("Gagal mengupload file '{$fileName}': ".$uploadResult['message']);
                            }
                            $uploadedFiles[] = $uploadResult['file_path'];

                            $this->kegiatanLampiranModel->create([
                                'anggaran_id' => $anggaranId,
                                'nama_file_asli' => $uploadResult['original_name'],
                                'path_file_disimpan' => $uploadResult['file_path'],
                                'uploader_user_id' => $this->user['user_id'],
                            ]);
                        }
                    }
                }
            }

            // 4. Update Kegiatan status
            $this->kegiatanModel->update($kegiatanId, ['lpj_submitted_at' => date('Y-m-d H:i:s')]);

            $oldStatus = $kegiatan['status_id'];
            $this->kegiatanModel->updateStatus($kegiatanId, 11); // 11 = Review LPJ

            $this->logStatusModel->create([
                'kegiatan_id' => $kegiatanId,
                'status_id_lama' => $oldStatus,
                'status_id_baru' => 11,
                'actor_user_id' => $this->user['user_id'],
                'catatan' => 'LPJ disubmit untuk review.',
            ]);

            // Activate 'Bendahara-LPJ' approval status
            $this->kegiatanModel->activateLpjApproval($kegiatanId);

            $db->commit();

            // Notify Bendahara (Email)
            $kakModel = new KAK; // KAK model needed to get nama_kegiatan and pengusul_user_id
            $kakData = $kakModel->find($kegiatan['kak_table_kak_id']);
            $userModel = new User; // Instantiate User model
            $pengusulData = $userModel->findById($kakData['pengusul_user_id']);

            $kegiatanDataForEmail = [
                'nama_kegiatan' => $kakData['nama_kegiatan'],
                'pengusul_nama' => $pengusulData['nama_lengkap'] ?? 'N/A',
            ];
            $this->mailService->notifyLPJSubmitted($kegiatanId, $kegiatanDataForEmail);

            return Response::success(null, 'LPJ berhasil disubmit dan menunggu review dari Bendahara LPJ.');

        } catch (\Exception $e) {
            if ($db->inTransaction()) {
                $db->rollBack();
            }
            // Clean up uploaded files on failure
            foreach ($uploadedFiles as $path) {
                $uploader->delete($path);
            }

            return Response::error('Gagal submit LPJ: '.$e->getMessage(), 500);
        }
    }

    /**
     * Get LPJ data for review by Bendahara or Pengusul.
     * GET /api/kegiatan/{kegiatan_id}/lpj/review
     */
    public function review($kegiatanId)
    {
        try {
            // Authorization: Only Bendahara or the original Pengusul can view.
            $isBendahara = in_array('Bendahara', $this->user['roles']);
            $kegiatan = $this->kegiatanModel->find($kegiatanId);

            if (! $kegiatan) {
                return Response::notFound('Kegiatan tidak ditemukan.');
            }

            $isPengusul = $kegiatan['kak_pengusul_user_id'] == $this->user['user_id'];

            if (! $isBendahara && ! $isPengusul) {
                $ownerId = $kegiatan['kak_pengusul_user_id'] ?? 'null';
                $userId = $this->user['user_id'] ?? 'null';
                $kegiatanKakId = $kegiatan['kegiatan_kak_id'] ?? 'null';
                $kakTableKakId = $kegiatan['kak_table_kak_id'] ?? 'null';
                $errorMessage = "Anda tidak memiliki akses. ID Pengusul KAK: [{$ownerId}], ID Anda yang login: [{$userId}]. (Debug: Kegiatan ID: {$kegiatanId}, Kegiatan KAK ID: [{$kegiatanKakId}], KAK Table KAK ID: [{$kakTableKakId}])";

                return Response::forbidden($errorMessage);
            }

            // Fetch main kegiatan data
            $data['kegiatan'] = $kegiatan;

            // Fetch budget items (anggaran) for the associated KAK
            $data['anggaran'] = $this->kakAnggaranModel->getAnggaranWithKategoriByKakId($kegiatan['kak_id']);

            // Fetch attachments (lampiran) associated with the budget items
            $anggaranIds = array_map(fn ($item) => $item['anggaran_id'], $data['anggaran']);
            $data['lampiran'] = [];
            if (! empty($anggaranIds)) {
                $data['lampiran'] = $this->kegiatanLampiranModel->findByAnggaranIds($anggaranIds);
            }

            return Response::success($data, 'Data LPJ berhasil diambil.');

        } catch (\Exception $e) {
            return Response::error('Gagal mengambil data LPJ untuk direview: '.$e->getMessage(), 500);
        }
    }

    /**
     * Send an LPJ back for revision with granular comments.
     * POST /api/kegiatan/{kegiatan_id}/lpj/revise
     */
    public function revise($kegiatanId)
    {
        $db = $this->kegiatanModel->getDb();

        try {
            // Authorization: Only Bendahara can revise an LPJ
            if (! in_array('Bendahara', $this->user['roles'])) {
                return Response::forbidden('Hanya Bendahara yang dapat merevisi LPJ.');
            }

            $kegiatanId = (int) $kegiatanId;
            $payload = json_decode(file_get_contents('php://input'), true);

            if (empty($payload)) {
                return Response::error('Input tidak valid.', 422);
            }

            $kegiatan = $this->kegiatanModel->find($kegiatanId);
            if (! $kegiatan) {
                return Response::notFound('Kegiatan tidak ditemukan.');
            }

            $db->beginTransaction();

            // Handle lampiran comments from payload (Bulk save/Backup)
            if (! empty($payload['lampiran_comments']) && is_array($payload['lampiran_comments'])) {
                foreach ($payload['lampiran_comments'] as $commentData) {
                    if (! empty($commentData['id']) && ! empty($commentData['catatan_reviewer'])) {
                        $this->kegiatanLampiranModel->addReviewerNotes(
                            $commentData['id'],
                            $commentData['catatan_reviewer'],
                            $this->user['user_id']
                        );
                    }
                }
            }

            // 3. Update the approval status to 'Revisi'
            $approvalModel = new KegiatanApproval;
            $lpjApproval = $approvalModel->findByKegiatanIdAndLevel($kegiatanId, 'Bendahara-LPJ');

            if (! $lpjApproval) {
                $db->rollBack();

                return Response::notFound('Alur persetujuan LPJ untuk kegiatan ini tidak ditemukan.');
            }

            $generalComment = $payload['catatan_umum'] ?? 'LPJ perlu direvisi. Mohon periksa catatan pada setiap item.';
            $approvalModel->update($lpjApproval['approval_kegiatan_id'], [
                'status' => 'Revisi',
                'catatan' => $generalComment,
                'approver_user_id' => $this->user['user_id'],
            ]);

            $oldStatus = $kegiatan['status_id'];
            $this->kegiatanModel->updateStatus($kegiatanId, 12); // 12 = LPJ Direvisi

            $this->logStatusModel->create([
                'kegiatan_id' => $kegiatanId,
                'status_id_lama' => $oldStatus,
                'status_id_baru' => 12,
                'actor_user_id' => $this->user['user_id'],
                'catatan' => "Revisi LPJ: {$generalComment}",
            ]);

            // 4. Notify the Pengusul
            $notifikasiModel = new Notifikasi;
            $notifikasiModel->create([
                'penerima_user_id' => $kegiatan['kak_pengusul_user_id'],
                'pesan' => "LPJ untuk kegiatan \"{$kegiatan['nama_kegiatan']}\" perlu direvisi. Catatan: {$generalComment}",
                'link_tujuan' => '/pengusul/kegiatan/lpj/new?kegiatan_id='.$kegiatanId,
            ]);

            $db->commit();

            return Response::success(null, 'LPJ telah dikembalikan untuk revisi.');

        } catch (\Exception $e) {
            if ($db->inTransaction()) {
                $db->rollBack();
            }

            return Response::error('Gagal merevisi LPJ: '.$e->getMessage(), 500);
        }
    }

    /**
     * Resubmit a revised LPJ by the Pengusul.
     * Handles multipart/form-data with realization data, new files, and files to delete.
     * POST /api/kegiatan/{kegiatan_id}/lpj/resubmit
     */
    public function resubmit($kegiatanId)
    {
        $db = $this->kegiatanModel->getDb();
        $uploader = new FileUpload(
            '/storage/uploads/documents/',
            ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'xls', 'xlsx'],
            10485760 // 10 MB
        );
        $uploadedFiles = [];

        try {
            $kegiatanId = (int) $kegiatanId;

            // 1. Authorization & Validation
            $kegiatan = $this->kegiatanModel->find($kegiatanId);
            if (! $kegiatan) {
                return Response::notFound('Kegiatan tidak ditemukan.');
            }
            if ($kegiatan['kak_pengusul_user_id'] != $this->user['user_id']) {
                return Response::forbidden('Anda bukan pengusul kegiatan ini.');
            }

            $db->beginTransaction();

            // 2. Process files for deletion
            $filesToDelete = isset($_POST['files_to_delete']) ? json_decode($_POST['files_to_delete'], true) : [];
            if (! empty($filesToDelete)) {
                foreach ($filesToDelete as $lampiranId) {
                    $lampiran = $this->kegiatanLampiranModel->find($lampiranId);
                    if ($lampiran) {
                        $this->kegiatanLampiranModel->update($lampiranId, ['status_lampiran' => 'archived']);
                    }
                }
            }

            // 3. Process realization data updates
            $realisasiData = isset($_POST['realisasi']) ? json_decode($_POST['realisasi'], true) : [];
            if (! empty($realisasiData)) {
                foreach ($realisasiData as $anggaranId => $data) {
                    $this->kakAnggaranModel->update($anggaranId, [
                        'realisasi_volume1' => ($data['realisasi_volume1'] === '' ? null : $data['realisasi_volume1']),
                        'realisasi_satuan1_id' => ($data['realisasi_satuan1_id'] === '' ? null : $data['realisasi_satuan1_id']),
                        'realisasi_harga_satuan' => ($data['realisasi_harga_satuan'] === '' ? null : preg_replace('/[^0-9]/', '', $data['realisasi_harga_satuan'])),
                    ]);
                }
            }

            // 4. Process new file uploads
            $files = $_FILES['bukti'] ?? [];
            if (! empty($files)) {
                foreach ($files['name'] as $anggaranId => $fileList) {
                    foreach ($fileList as $fileIndex => $fileName) {
                        if ($files['error'][$anggaranId][$fileIndex] === UPLOAD_ERR_OK) {
                            $fileToUpload = [
                                'name' => $files['name'][$anggaranId][$fileIndex],
                                'type' => $files['type'][$anggaranId][$fileIndex],
                                'tmp_name' => $files['tmp_name'][$anggaranId][$fileIndex],
                                'error' => $files['error'][$anggaranId][$fileIndex],
                                'size' => $files['size'][$anggaranId][$fileIndex],
                            ];

                            $uploadResult = $uploader->upload($fileToUpload);
                            if (! $uploadResult['success']) {
                                throw new \Exception("Gagal mengupload file '{$fileName}': ".$uploadResult['message']);
                            }
                            $uploadedFiles[] = $uploadResult['file_path'];

                            $this->kegiatanLampiranModel->create([
                                'anggaran_id' => $anggaranId,
                                'nama_file_asli' => $uploadResult['original_name'],
                                'path_file_disimpan' => $uploadResult['file_path'],
                                'uploader_user_id' => $this->user['user_id'],
                            ]);
                        }
                    }
                }
            }

            // 5. Update approval status back to 'Aktif' for Bendahara review
            $approvalModel = new KegiatanApproval;
            $lpjApproval = $approvalModel->findByKegiatanIdAndLevel($kegiatanId, 'Bendahara-LPJ');
            if ($lpjApproval) {
                $approvalModel->update($lpjApproval['approval_kegiatan_id'], [
                    'status' => 'Aktif',
                    'catatan' => null, // Clear previous rejection note
                    'approver_user_id' => null,
                    'updated_at' => date('Y-m-d H:i:s'),
                ]);
            }

            // Also update the main submission timestamp
            $this->kegiatanModel->update($kegiatanId, ['lpj_submitted_at' => date('Y-m-d H:i:s')]);

            $oldStatus = $kegiatan['status_id'];
            $this->kegiatanModel->updateStatus($kegiatanId, 11); // 11 = Review LPJ

            $this->logStatusModel->create([
                'kegiatan_id' => $kegiatanId,
                'status_id_lama' => $oldStatus,
                'status_id_baru' => 11,
                'actor_user_id' => $this->user['user_id'],
                'catatan' => 'LPJ disubmit ulang setelah revisi.',
            ]);

            $db->commit();

            return Response::success(null, 'LPJ berhasil disubmit ulang dan menunggu review dari Bendahara.');

        } catch (\Exception $e) {
            if ($db->inTransaction()) {
                $db->rollBack();
            }
            foreach ($uploadedFiles as $path) {
                $uploader->delete($path);
            }

            return Response::error('Gagal submit ulang LPJ: '.$e->getMessage(), 500);
        }
    }

    /**
     * Approve an LPJ and move its status to 'Setor Fisik'.
     * POST /api/kegiatan/{kegiatan_id}/lpj/approve
     */
    public function approve($kegiatanId)
    {
        $db = $this->kegiatanModel->getDb();
        try {
            // Authorization: Only Bendahara can approve an LPJ
            if (! in_array('Bendahara', $this->user['roles'])) {
                return Response::forbidden('Hanya Bendahara yang dapat menyetujui LPJ.');
            }

            $kegiatanId = (int) $kegiatanId;
            $kegiatan = $this->kegiatanModel->find($kegiatanId);
            if (! $kegiatan) {
                return Response::notFound('Kegiatan tidak ditemukan.');
            }

            $approvalModel = new KegiatanApproval;
            $lpjApproval = $approvalModel->findByKegiatanIdAndLevel($kegiatanId, 'Bendahara-LPJ');

            if (! $lpjApproval) {
                return Response::notFound('Alur persetujuan LPJ untuk kegiatan ini tidak ditemukan.');
            }

            // Prevent re-approval if not in a pending state
            if (! in_array($lpjApproval['status'], ['Aktif', 'Revisi'])) {
                return Response::error('LPJ ini tidak dalam status yang dapat disetujui (status saat ini: '.$lpjApproval['status'].').', 400);
            }

            $db->beginTransaction();

            // 1. Mark the current 'Bendahara-LPJ' step as 'Disetujui'
            $approvalModel->update($lpjApproval['approval_kegiatan_id'], [
                'status' => 'Disetujui',
                'catatan' => 'LPJ disetujui secara digital.',
                'approver_user_id' => $this->user['user_id'],
                'updated_at' => date('Y-m-d H:i:s'),
            ]);

            // 2. Find and activate the next step: 'Bendahara-Setor'
            $nextApproval = $this->kegiatanModel->findNextApproval($kegiatanId, $lpjApproval['approval_kegiatan_id']);
            if ($nextApproval && $nextApproval['approval_level'] === 'Bendahara-Setor') {
                $this->kegiatanModel->updateApprovalStatus($nextApproval['approval_kegiatan_id'], 'Aktif', null, null);
            }

            $oldStatus = $kegiatan['status_id'];
            $this->kegiatanModel->updateStatus($kegiatanId, 13); // 13 = Setor Fisik Dokumen

            $this->logStatusModel->create([
                'kegiatan_id' => $kegiatanId,
                'status_id_lama' => $oldStatus,
                'status_id_baru' => 13,
                'actor_user_id' => $this->user['user_id'],
                'catatan' => 'LPJ digital disetujui. Menunggu setor fisik.',
            ]);

            // 3. Notify the Pengusul
            $notifikasiModel = new Notifikasi;
            $notifikasiModel->create([
                'penerima_user_id' => $kegiatan['kak_pengusul_user_id'],
                'pesan' => "LPJ untuk kegiatan \"{$kegiatan['nama_kegiatan']}\" telah disetujui. Proses dilanjutkan ke tahap berikutnya.",
                'link_tujuan' => '/pengusul/kegiatan',
            ]);

            $db->commit();

            return Response::success(null, 'LPJ berhasil disetujui dan alur kerja dilanjutkan ke tahap Bendahara Setor.');

        } catch (\Exception $e) {
            if ($db->inTransaction()) {
                $db->rollBack();
            }

            return Response::error('Gagal menyetujui LPJ: '.$e->getMessage(), 500);
        }
    }

    /**
     * Mark an LPJ as fully completed after physical submission.
     * POST /api/kegiatan/{kegiatan_id}/lpj/complete
     */
    public function complete($kegiatanId)
    {
        $db = $this->kegiatanModel->getDb();
        try {
            // Authorization: Only Bendahara can complete an LPJ
            if (! in_array('Bendahara', $this->user['roles'])) {
                return Response::forbidden('Hanya Bendahara yang dapat menyelesaikan LPJ.');
            }

            $kegiatanId = (int) $kegiatanId;
            $kegiatan = $this->kegiatanModel->find($kegiatanId);
            if (! $kegiatan) {
                return Response::notFound('Kegiatan tidak ditemukan.');
            }

            $approvalModel = new KegiatanApproval;
            // Find the current active approval step for the kegiatan
            $activeApproval = $approvalModel->findActiveByKegiatanId($kegiatanId);

            if (! $activeApproval) {
                return Response::error('Tidak ada alur persetujuan yang sedang aktif untuk kegiatan ini.', 400);
            }

            // New Validation: LPJ can only be completed if the approval is at the 'Bendahara-Setor' level.
            if ($activeApproval['approval_level'] !== 'Bendahara-Setor') {
                return Response::error('LPJ hanya bisa diselesaikan jika alur persetujuan berada di level "Bendahara-Setor".', 400);
            }

            $db->beginTransaction();

            // Mark the 'Bendahara-Setor' step as 'Disetujui', completing the LPJ workflow.
            $approvalModel->update($activeApproval['approval_kegiatan_id'], [
                'status' => 'Disetujui',
                'catatan' => 'Bukti fisik telah diterima dan LPJ dinyatakan selesai.',
                'approver_user_id' => $this->user['user_id'],
                'updated_at' => date('Y-m-d H:i:s'),
            ]);

            $oldStatus = $kegiatan['status_id'];
            $this->kegiatanModel->updateStatus($kegiatanId, 14); // 14 = Selesai

            $this->logStatusModel->create([
                'kegiatan_id' => $kegiatanId,
                'status_id_lama' => $oldStatus,
                'status_id_baru' => 14,
                'actor_user_id' => $this->user['user_id'],
                'catatan' => 'LPJ fisik diterima. Kegiatan selesai.',
            ]);

            // Notify the Pengusul
            $notifikasiModel = new Notifikasi;
            $notifikasiModel->create([
                'penerima_user_id' => $kegiatan['kak_pengusul_user_id'],
                'pesan' => "LPJ untuk kegiatan \"{$kegiatan['nama_kegiatan']}\" telah selesai dan disetujui sepenuhnya.",
                'link_tujuan' => '/pengusul/kegiatan/lpj',
            ]);

            $db->commit();

            return Response::success(null, 'LPJ telah ditandai selesai.');

        } catch (\Exception $e) {
            if ($db->inTransaction()) {
                $db->rollBack();
            }

            return Response::error('Gagal menyelesaikan LPJ: '.$e->getMessage(), 500);
        }
    }

    /**
     * Get overdue LPJ approvals for Bendahara.
     * GET /api/lpj/overdue-bendahara
     */
    public function getOverdueLpjForBendahara()
    {
        try {
            // Authorization: Only Bendahara can access this
            if (! in_array('Bendahara', $this->user['roles'])) {
                Response::forbidden('Anda tidak memiliki akses untuk melihat LPJ overdue Bendahara.');
            }

            $kegiatanTimerService = new KegiatanTimerService;
            $overdueLpj = $kegiatanTimerService->getOverdueLpjApprovals();

            $overdueCount = count($overdueLpj);

            Response::success([
                'count' => $overdueCount,
                'lpjs' => $overdueLpj,
            ], 'Data LPJ overdue Bendahara berhasil diambil.');

        } catch (\Exception $e) {
            Response::error('Gagal mengambil data LPJ overdue Bendahara: '.$e->getMessage(), 500);
        }
    }
}

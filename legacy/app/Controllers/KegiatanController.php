<?php

namespace App\Controllers;

use App\Core\FileUpload;
use App\Core\Response;
use App\Middlewares\AuthMiddleware;
use App\Models\KAK;
use App\Models\Kegiatan;
use App\Models\KegiatanAnggaran;
use App\Models\KegiatanApproval;
use App\Models\KegiatanLampiran;
use App\Models\KegiatanLogStatus;
use App\Models\Notifikasi;
use App\Models\PencairanDana;
use App\Models\Role;
use App\Models\User;
use App\Services\LpjTimerService;
use App\Services\MailService;
use App\Validators\KegiatanValidator;

class KegiatanController
{
    private $kegiatanModel;

    private $anggaranModel;

    private $lampiranModel;

    private $logStatusModel;

    private $kegiatanApprovalModel;

    private $notifikasiModel;

    private $kakModel;

    private $userModel;

    private $roleModel;

    private $userData;

    private $mailService;

    private $pencairanDanaModel;

    public function __construct()
    {
        $this->kegiatanModel = new Kegiatan;
        $this->anggaranModel = new KegiatanAnggaran;
        $this->lampiranModel = new KegiatanLampiran;
        $this->logStatusModel = new KegiatanLogStatus;
        $this->kegiatanApprovalModel = new KegiatanApproval;
        $this->notifikasiModel = new Notifikasi;
        $this->kakModel = new KAK;
        $this->userModel = new User;
        $this->roleModel = new Role;
        $this->mailService = new MailService;
        $this->pencairanDanaModel = new PencairanDana;

        // Get authenticated user data
        $this->userData = AuthMiddleware::getAuthUser();
    }

    /**
     * Get all kegiatan with filters
     *
     * GET /api/kegiatan?status=1&search=workshop&page=1&per_page=10
     */
    public function index()
    {
        try {
            // Get query parameters for filtering, searching, and pagination
            $filters = [
                'status_id' => $_GET['status'] ?? null,
                'search' => $_GET['search'] ?? null,
                'tanggal_mulai' => $_GET['tanggal_mulai'] ?? null,
                'tanggal_selesai' => $_GET['tanggal_selesai'] ?? null,
                'unit_pengusul' => $_GET['unit_pengusul'] ?? null,
                'kategori_kegiatan' => $_GET['kategori_kegiatan'] ?? null,
                'kode_kegiatan' => $_GET['kode_kegiatan'] ?? null,
                'page' => isset($_GET['page']) ? (int) $_GET['page'] : 1,
                'per_page' => isset($_GET['per_page']) ? (int) $_GET['per_page'] : 10,
            ];

            // Authorization: Pengusul can only see their own activities.
            // Admin and other high-level roles can see all, but can filter by 'unit_pengusul'.
            if ($this->hasRole('Pengusul') && ! $this->hasRole('Admin')) {
                $filters['user_id'] = $this->userData['user_id'];
            }

            // Get kegiatan with filters
            $result = $this->kegiatanModel->getAllWithFilters($filters);

            Response::success($result, 'Data kegiatan berhasil diambil.');

        } catch (\Exception $e) {
            Response::error('Gagal mengambil data kegiatan: '.$e->getMessage(), 500);
        }
    }

    /**
     * Get kegiatan detail
     *
     * GET /api/kegiatan/{id}
     */
    public function show()
    {
        try {
            // Get kegiatan_id from URL
            $uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
            preg_match('/\/kegiatan\/(\d+)$/', $uri, $matches);
            $kegiatanId = $matches[1] ?? null;

            if (! $kegiatanId) {
                Response::error('Kegiatan ID tidak valid.', 400);
            }

            // Get kegiatan detail
            $kegiatan = $this->kegiatanModel->getKegiatanForPDF($kegiatanId);

            if (! $kegiatan) {
                Response::notFound('Kegiatan tidak ditemukan.');
            }

            // Authorization: Pengusul hanya bisa lihat kegiatan sendiri
            if ($this->hasRole('Pengusul') && ! $this->hasRole('Admin')) {
                if ($kegiatan['pengusul_user_id'] != $this->userData['user_id']) {
                    Response::forbidden('Anda tidak memiliki akses ke kegiatan ini.');
                }
            }

            Response::success($kegiatan, 'Detail kegiatan berhasil diambil.');

        } catch (\Exception $e) {
            Response::error('Gagal mengambil detail kegiatan: '.$e->getMessage(), 500);
        }
    }

    /**
     * Get riwayat kegiatan based on user role
     *
     * GET /api/kegiatan/riwayat
     */
    public function getRiwayat()
    {
        try {
            // Get query parameters for filtering, searching, and pagination
            $filters = [
                'search' => $_GET['search'] ?? null,
                'tanggal_mulai' => $_GET['tanggal_mulai'] ?? null,
                'tanggal_selesai' => $_GET['tanggal_selesai'] ?? null,
                'page' => isset($_GET['page']) ? (int) $_GET['page'] : 1,
                'per_page' => isset($_GET['per_page']) ? (int) $_GET['per_page'] : 10,
            ];

            $userId = $this->userData['user_id'];
            $roles = $this->userData['roles'] ?? [];

            // Tentukan filter berdasarkan role
            if ($this->hasRole('Pengusul') && ! $this->hasRole('Admin')) {
                // Pengusul: hanya KAK miliknya yang sudah disetujui verifikator
                $filters['pengusul_user_id'] = $userId;

            } elseif ($this->hasRole('PPK')) {
                // PPK: kegiatan yang sudah dia approve
                $filters['approver_user_id'] = $userId;
                $filters['approval_level'] = 'PPK';

            } elseif ($this->hasRole('Wadir')) {
                // Wadir: kegiatan yang sudah dia approve
                $filters['approver_user_id'] = $userId;
                $filters['approval_level'] = 'Wadir2';

            } elseif ($this->hasRole('Bendahara')) {
                // Bendahara: kegiatan yang sudah dia approve (semua level bendahara)
                $filters['approver_user_id'] = $userId;
                $filters['approval_level'] = 'Bendahara-Setor'; // akan match Bendahara-Cair, Bendahara-LPJ, dll

            } elseif ($this->hasRole('Verifikator')) {
                // Verifikator: filter by tipe_kegiatan_id matching username number (handled in Model)
                $filters['username'] = $this->userData['username'];

            } elseif ($this->hasRole('Rektorat') || $this->hasRole('Admin')) {
                // Rektorat/Admin: tampilkan semua
                // No additional filter
            }

            // Get riwayat with filters
            $result = $this->kegiatanModel->getRiwayatWithFilters($filters);

            Response::success($result, 'Data riwayat berhasil diambil.');

        } catch (\Exception $e) {
            Response::error('Gagal mengambil data riwayat: '.$e->getMessage(), 500);
        }
    }

    /**
     * Get kegiatan detail for LPJ input
     *
     * GET /api/kegiatan/{id}/detail
     */
    public function getDetail()
    {
        try {
            // Get kegiatan_id from URL
            $uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
            preg_match('/\/kegiatan\/(\d+)\/detail$/', $uri, $matches);
            $kegiatanId = $matches[1] ?? null;

            if (! $kegiatanId) {
                Response::error('Kegiatan ID tidak valid.', 400);
            }

            // Get kegiatan detail
            $kegiatan = $this->kegiatanModel->getKegiatanForPDF($kegiatanId);

            if (! $kegiatan) {
                Response::notFound('Kegiatan tidak ditemukan.');
            }

            // Authorization: Pengusul hanya bisa lihat kegiatan sendiri
            if ($this->hasRole('Pengusul') && ! $this->hasRole('Admin')) {
                if ($kegiatan['pengusul_user_id'] != $this->userData['user_id']) {
                    Response::forbidden('Anda tidak memiliki akses ke kegiatan ini.');
                }
            }

            // Restructure data for frontend and add debug info
            $anggaranItems = $kegiatan['anggaran_items'] ?? [];

            // Fetch attachments (lampiran) associated with the budget items
            $anggaranIds = array_map(fn ($item) => $item['anggaran_id'], $anggaranItems);
            $lampiran = [];
            if (! empty($anggaranIds)) {
                $lampiran = $this->lampiranModel->findByAnggaranIds($anggaranIds);
            }

            $lpjData = [
                'anggaran_items' => $anggaranItems,
                'lampiran' => $lampiran,
                'status' => ! empty($kegiatan['lpj_submitted_at']) ? 'submitted' : 'new',
            ];
            unset($kegiatan['anggaran_items']);

            $responseData = [
                'kegiatan' => $kegiatan,
                'lpj' => $lpjData,
                '_debug' => [
                    'kak_id_queried' => $kegiatan['kak_id'],
                    'anggaran_items_found' => count($anggaranItems),
                    'lampiran_found' => count($lampiran),
                ],
            ];

            Response::success($responseData, 'Detail kegiatan berhasil diambil.');

        } catch (\Exception $e) {
            Response::error('Gagal mengambil detail kegiatan: '.$e->getMessage(), 500);
        }
    }

    /**
     * Create new kegiatan from an approved telaah, including surat pengantar upload.
     *
     * POST /api/kegiatan
     * Expects multipart/form-data with 'telaah_id' and 'surat_pengantar' file.
     */
    public function create()
    {
        $db = $this->kegiatanModel->getDb();
        $uploader = null;
        $uploadResult = null;

        try {
            // This endpoint now expects multipart/form-data
            $kakId = $_POST['kak_id'] ?? null;
            $suratPengantarFile = $_FILES['surat_pengantar'] ?? null;
            $penanggungJawab = $_POST['penanggung_jawab_manual'] ?? null;
            $pelaksana = $_POST['pelaksana_manual'] ?? null;

            // --- 1. Basic Validation ---
            if (! $kakId) {
                Response::error('kak_id harus diisi.', 400);
            }
            if (! $suratPengantarFile || $suratPengantarFile['error'] !== UPLOAD_ERR_OK) {
                Response::error('File surat_pengantar harus diupload.', 400);
            }
            if (empty($penanggungJawab)) {
                Response::error('Penanggung jawab harus diisi.', 400);
            }
            if (empty($pelaksana)) {
                Response::error('Pelaksana harus diisi.', 400);
            }

            // --- 2. Find and Validate KAK ---
            $kak = $this->kakModel->find($kakId);
            if (! $kak) {
                Response::notFound('KAK tidak ditemukan.');
            }
            if ($kak['status_id'] != 3) { // 3 = Disetujui Verifikator
                Response::error('Hanya KAK yang sudah disetujui verifikator yang bisa dijadikan kegiatan.', 400);
            }

            // --- 3. Check for Existing Kegiatan ---
            $existingKegiatan = $this->kegiatanModel->findBy('kak_id', $kakId);
            if ($existingKegiatan) {
                Response::error('Kegiatan untuk KAK ini sudah ada.', 409); // 409 Conflict
            }

            // --- 4. Upload Surat Pengantar ---
            $uploader = new FileUpload(
                '/storage/uploads/documents/', // Path to save the file
                ['pdf', 'doc', 'docx'],      // Allowed extensions
                5242880                       // Max size 5MB
            );
            $uploadResult = $uploader->upload($suratPengantarFile);

            if (! $uploadResult['success']) {
                Response::error('Gagal mengupload surat pengantar: '.$uploadResult['message'], 400);
            }

            $db->beginTransaction();

            // --- 5. Create New Kegiatan with dynamic data ---
            $kegiatanData = [
                'kak_id' => $kakId,
                'surat_pengantar_path' => $uploadResult['file_path'], // Save the file path
                'tanggal_mulai_final' => $kak['tanggal_mulai'],
                'penanggung_jawab_manual' => $penanggungJawab,
                'pelaksana_manual' => $pelaksana,
            ];
            $kegiatanId = $this->kegiatanModel->create($kegiatanData);

            // --- 6. Create Initial Approval Flow ---
            $approvalLevels = ['PPK', 'Wadir2', 'Bendahara-Cair', 'Bendahara-LPJ', 'Bendahara-Setor'];
            foreach ($approvalLevels as $level) {
                $this->kegiatanModel->updateApproval($kegiatanId, [
                    'approval_level' => $level,
                    'approver_user_id' => null,
                    'status' => $level === 'PPK' ? 'Aktif' : 'Menunggu', // PPK is the first active step
                    'catatan' => null,
                ]);
            }

            // --- 7. Update KAK Status ---
            $this->kakModel->update($kakId, ['status_id' => 6]); // 6 = Review PPK

            $db->commit();

            // Notify PPK
            $role = $this->roleModel->findByName('PPK');
            if ($role) {
                $ppkUsers = $this->userModel->findByRoleId($role['role_id']);
                $kegiatan = $this->kegiatanModel->findById($kegiatanId);
                foreach ($ppkUsers as $ppk) {
                    $this->notifikasiModel->create([
                        'penerima_user_id' => $ppk['user_id'],
                        'pesan' => "Kegiatan baru \"{$kegiatan['nama_kegiatan']}\" telah dibuat dan menunggu persetujuan Anda.",
                        'link_tujuan' => '/verifikator/kegiatan/'.$kegiatanId,
                    ]);
                }
            }

            Response::created([
                'kegiatan_id' => $kegiatanId,
                'surat_pengantar_path' => $uploadResult['file_path'],
            ], 'Kegiatan berhasil dibuat dan alur persetujuan dimulai.');

        } catch (\Exception $e) {
            if ($db->inTransaction()) {
                $db->rollBack();
            }
            // If something goes wrong after upload, delete the orphaned file
            if (isset($uploadResult) && $uploadResult['success']) {
                $uploader->delete($uploadResult['file_path']);
            }
            Response::error('Gagal membuat kegiatan: '.$e->getMessage(), 500);
        }
    }

    /**
     * Update kegiatan
     *
     * PUT /api/kegiatan/{id}
     */
    public function update()
    {
        try {
            // Get kegiatan_id from URL
            $uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
            preg_match('/\/kegiatan\/(\d+)$/', $uri, $matches);
            $kegiatanId = $matches[1] ?? null;

            if (! $kegiatanId) {
                Response::error('Kegiatan ID tidak valid.', 400);
            }

            // Check if kegiatan exists
            $kegiatan = $this->kegiatanModel->findById($kegiatanId);
            if (! $kegiatan) {
                Response::notFound('Kegiatan tidak ditemukan.');
            }

            // Authorization: Only owner can edit
            if ($kegiatan['pengusul_user_id'] != $this->userData['user_id'] && ! $this->hasRole('Admin')) {
                Response::forbidden('Anda tidak memiliki akses untuk mengedit kegiatan ini.');
            }

            // Cannot edit if not Draft or Revisi
            if (! in_array($kegiatan['status_id'], [1, 5])) { // 1=Draft, 5=Revisi
                Response::error('Kegiatan hanya bisa diedit jika berstatus Draft atau Revisi.', 400);
            }

            // Get JSON input
            $data = json_decode(file_get_contents('php://input'), true);

            // Validate input
            $validator = new KegiatanValidator;
            if (! $validator->validateUpdate($data)) {
                Response::validationError($validator->getErrors(), 'Validasi gagal.');
            }

            // Update kegiatan
            $this->kegiatanModel->update($kegiatanId, $data);

            // Get updated kegiatan
            $updatedKegiatan = $this->kegiatanModel->findById($kegiatanId);

            Response::success($updatedKegiatan, 'Kegiatan berhasil diupdate.');

        } catch (\Exception $e) {
            Response::error('Gagal update kegiatan: '.$e->getMessage(), 500);
        }
    }

    /**
     * Delete kegiatan (Draft only)
     *
     * DELETE /api/kegiatan/{id}
     */
    public function delete()
    {
        try {
            // Get kegiatan_id from URL
            $uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
            preg_match('/\/kegiatan\/(\d+)$/', $uri, $matches);
            $kegiatanId = $matches[1] ?? null;

            if (! $kegiatanId) {
                Response::error('Kegiatan ID tidak valid.', 400);
            }

            // Check if kegiatan exists
            $kegiatan = $this->kegiatanModel->findById($kegiatanId);
            if (! $kegiatan) {
                Response::notFound('Kegiatan tidak ditemukan.');
            }

            // Authorization: Only owner can delete
            if ($kegiatan['pengusul_user_id'] != $this->userData['user_id'] && ! $this->hasRole('Admin')) {
                Response::forbidden('Anda tidak memiliki akses untuk menghapus kegiatan ini.');
            }

            // Only Draft can be deleted
            if ($kegiatan['status_id'] != 1) {
                Response::error('Hanya kegiatan berstatus Draft yang bisa dihapus.', 400);
            }

            // Delete kegiatan (cascade akan hapus anggaran & lampiran)
            $this->kegiatanModel->delete($kegiatanId);

            Response::success(null, 'Kegiatan berhasil dihapus.');

        } catch (\Exception $e) {
            Response::error('Gagal menghapus kegiatan: '.$e->getMessage(), 500);
        }
    }

    /**
     * Submit kegiatan for review
     *
     * POST /api/kegiatan/{id}/submit
     */
    public function submit()
    {
        $db = $this->kegiatanModel->getDb();
        try {
            $db->beginTransaction();

            // Get kegiatan_id from URL
            $uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
            preg_match('/\/kegiatan\/(\d+)\/submit$/', $uri, $matches);
            $kegiatanId = $matches[1] ?? null;

            if (! $kegiatanId) {
                Response::error('Kegiatan ID tidak valid.', 400);
            }

            // Check if kegiatan exists
            $kegiatan = $this->kegiatanModel->findById($kegiatanId);
            if (! $kegiatan) {
                Response::notFound('Kegiatan tidak ditemukan.');
            }

            // Authorization
            if ($kegiatan['pengusul_user_id'] != $this->userData['user_id'] && ! $this->hasRole('Admin')) {
                Response::forbidden('Anda tidak memiliki akses untuk submit kegiatan ini.');
            }

            // Check if status is Draft or Revisi
            if (! in_array($kegiatan['status_id'], [1, 5])) {
                Response::error('Hanya kegiatan berstatus Draft atau Revisi yang bisa disubmit.', 400);
            }

            // Check if has anggaran items
            $anggaran = $this->anggaranModel->getByKegiatanId($kegiatanId);
            if (empty($anggaran)) {
                Response::error('Kegiatan harus memiliki minimal 1 item anggaran sebelum disubmit.', 400);
            }

            // Update status to Dalam Review
            $oldStatus = $kegiatan['status_id'];
            $this->kegiatanModel->updateStatus($kegiatanId, 2); // 2 = Dalam Review

            // Log status change
            $this->logStatusModel->create([
                'kegiatan_id' => $kegiatanId,
                'status_id_lama' => $oldStatus,
                'status_id_baru' => 2,
                'actor_user_id' => $this->userData['user_id'],
                'catatan' => 'Kegiatan disubmit untuk review',
            ]);

            $db->commit();
            Response::success(null, 'Kegiatan berhasil disubmit untuk review.');

        } catch (\Exception $e) {
            if ($db->inTransaction()) {
                $db->rollBack();
            }
            Response::error('Gagal submit kegiatan: '.$e->getMessage(), 500);
        }
    }

    /**
     * Revise kegiatan (by approver)
     *
     * POST /api/kegiatan/{id}/revise
     */
    public function revise()
    {
        $db = $this->kegiatanModel->getDb();
        try {
            $db->beginTransaction();

            // Get kegiatan_id from URL
            $uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
            preg_match('/\/kegiatan\/(\d+)\/revise$/', $uri, $matches);
            $kegiatanId = $matches[1] ?? null;

            if (! $kegiatanId) {
                Response::error('Kegiatan ID tidak valid.', 400);
            }

            // Get JSON input
            $data = json_decode(file_get_contents('php://input'), true);
            $catatan = $data['catatan'] ?? null;

            if (! $catatan) {
                Response::error('Catatan revisi harus diisi.', 400);
            }

            // Check if kegiatan exists
            $kegiatan = $this->kegiatanModel->findById($kegiatanId);
            if (! $kegiatan) {
                Response::notFound('Kegiatan tidak ditemukan.');
            }

            // Authorization: Only approvers can revise
            if (! in_array('Verifikator', $this->userData['roles'] ?? []) &&
                ! in_array('PPK', $this->userData['roles'] ?? []) &&
                ! in_array('Admin', $this->userData['roles'] ?? [])) {
                Response::forbidden('Anda tidak memiliki akses untuk revisi kegiatan.');
            }

            // Update status to Revisi
            $oldStatus = $kegiatan['status_id'];
            $this->kegiatanModel->updateStatus($kegiatanId, 5); // 5 = Revisi

            // Log status change
            $this->logStatusModel->create([
                'kegiatan_id' => $kegiatanId,
                'status_id_lama' => $oldStatus,
                'status_id_baru' => 5,
                'actor_user_id' => $this->userData['user_id'],
                'catatan' => $catatan,
            ]);

            // Send notification to pengusul
            $this->notifikasiModel->create([
                'penerima_user_id' => $kegiatan['pengusul_user_id'],
                'pesan' => "Kegiatan \"{$kegiatan['nama_kegiatan']}\" perlu direvisi. Catatan: {$catatan}",
                'link_tujuan' => '/pengusul/kegiatan/'.$kegiatanId,
                'is_read' => false,
            ]);

            $db->commit();
            Response::success(null, 'Kegiatan berhasil dikembalikan untuk revisi.');

        } catch (\Exception $e) {
            if ($db->inTransaction()) {
                $db->rollBack();
            }
            Response::error('Gagal revisi kegiatan: '.$e->getMessage(), 500);
        }
    }

    /**
     * Approve kegiatan
     * INTEGRATED WITH LPJ TIMER SERVICE
     *
     * POST /api/kegiatan/{id}/approve
     */
    public function approve()
    {
        // Get the database connection and start a transaction
        $db = $this->kegiatanModel->getDb();
        try {
            $db->beginTransaction();

            // 1. Get Input and Find Kegiatan
            $uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
            preg_match('/\/kegiatan\/(\d+)\/approve$/', $uri, $matches);
            $kegiatanId = $matches[1] ?? null;

            if (! $kegiatanId) {
                Response::error('Kegiatan ID tidak valid.', 400);
            }

            $data = json_decode(file_get_contents('php://input'), true);
            $status = $data['status'] ?? null; // 'Disetujui' or 'Revisi'
            $catatan = $data['catatan'] ?? null;

            if (! in_array($status, ['Disetujui', 'Revisi'])) {
                Response::error("Status harus 'Disetujui' atau 'Revisi'.", 400);
            }
            if ($status === 'Revisi' && empty($catatan)) {
                Response::error('Catatan revisi harus diisi.', 400);
            }

            $kegiatan = $this->kegiatanModel->findById($kegiatanId);
            if (! $kegiatan) {
                Response::notFound('Kegiatan tidak ditemukan.');
            }

            // 2. Find the Current Active Approval Step and its Index
            $allApprovals = $this->kegiatanApprovalModel->findAllByKegiatanId($kegiatanId);
            $currentApproval = null;
            $activeIndex = -1;
            foreach ($allApprovals as $index => $approval) {
                if ($approval['status'] === 'Aktif') {
                    $currentApproval = $approval;
                    $activeIndex = $index;
                    break;
                }
            }

            if (! $currentApproval) {
                Response::error('Tidak ada alur persetujuan yang aktif untuk kegiatan ini.', 400);
            }

            // 3. Authorization Check using hardcoded hierarchy
            $approvalHierarchy = ['PPK', 'Wadir2', 'Bendahara-Cair', 'Bendahara-LPJ'];
            $expectedRole = $approvalHierarchy[$activeIndex] ?? null;

            if (! $expectedRole) {
                Response::error('Approval level tidak valid.', 400);
            }

            $allowedRoles = [
                'PPK' => ['PPK', 'Admin'],
                'Wadir2' => ['Wadir', 'Admin'],
                'Bendahara-Cair' => ['Bendahara', 'Admin'],
                'Bendahara-LPJ' => ['Bendahara', 'Admin'],
            ];

            $hasPermission = false;
            foreach ($allowedRoles[$expectedRole] as $role) {
                if ($this->hasRole($role)) {
                    $hasPermission = true;
                    break;
                }
            }

            if (! $hasPermission) {
                Response::forbidden("Anda tidak memiliki akses untuk persetujuan level {$expectedRole}.");
            }

            // 4. Handle Revision
            if ($status === 'Revisi') {
                $this->kegiatanModel->updateApprovalStatus(
                    $currentApproval['approval_kegiatan_id'],
                    'Revisi',
                    $this->userData['user_id'],
                    $catatan
                );
                $this->kegiatanModel->updateStatus($kegiatanId, 5); // 5 = Revisi

                $this->logStatusModel->create([
                    'kegiatan_id' => $kegiatanId,
                    'status_id_lama' => $kegiatan['status_id'],
                    'status_id_baru' => 5,
                    'actor_user_id' => $this->userData['user_id'],
                    'catatan' => "Revisi dari {$expectedRole}: {$catatan}",
                ]);

                $this->notifikasiModel->create([
                    'penerima_user_id' => $kegiatan['pengusul_user_id'],
                    'pesan' => "Kegiatan \"{$kegiatan['nama_kegiatan']}\" perlu direvisi oleh {$expectedRole}. Catatan: {$catatan}",
                    'link_tujuan' => '/pengusul/kegiatan/'.$kegiatanId,
                ]);

                $db->commit();
                Response::success(null, 'Kegiatan berhasil dikembalikan untuk revisi.');

                return;
            }

            // 5. Handle Approval
            $this->kegiatanModel->updateApprovalStatus(
                $currentApproval['approval_kegiatan_id'],
                'Disetujui',
                $this->userData['user_id'],
                $catatan
            );

            $this->logStatusModel->create([
                'kegiatan_id' => $kegiatanId,
                'status_id_lama' => $kegiatan['status_id'],
                'status_id_baru' => $kegiatan['status_id'],
                'actor_user_id' => $this->userData['user_id'],
                'catatan' => "Disetujui oleh {$expectedRole}.".($catatan ? " Catatan: {$catatan}" : ''),
            ]);

            if ($expectedRole === 'PPK') {
                $proposer = $this->userModel->findById($kegiatan['pengusul_user_id']);
                if ($proposer && ! empty($proposer['email'])) {
                    $kegiatanDataForEmail = [
                        'nama_kegiatan' => $kegiatan['nama_kegiatan'],
                        'pengusul_nama' => $proposer['nama_lengkap'],
                        'pengusul_email' => $proposer['email'],
                    ];
                    $this->mailService->notifyKegiatanApprovedByPPK($kegiatanId, $kegiatanDataForEmail);
                }
            } elseif ($expectedRole === 'Wadir2') { // Add this new condition
                $proposer = $this->userModel->findById($kegiatan['pengusul_user_id']);
                if ($proposer && ! empty($proposer['email'])) {
                    $kegiatanDataForEmail = [
                        'nama_kegiatan' => $kegiatan['nama_kegiatan'],
                        'pengusul_nama' => $proposer['nama_lengkap'],
                        'pengusul_email' => $proposer['email'],
                    ];
                    $this->mailService->notifyKegiatanApprovedByWadir($kegiatanId, $kegiatanDataForEmail);
                }
            }

            // --- END OF LPJ TIMER LOGIC (REMOVED) ---

            // 6. Activate Next Step or Finalize
            $nextApproval = $allApprovals[$activeIndex + 1] ?? null;

            if ($nextApproval) {
                $this->kegiatanModel->updateApprovalStatus($nextApproval['approval_kegiatan_id'], 'Aktif', null, null);

                $nextExpectedRole = $approvalHierarchy[$activeIndex + 1] ?? 'Unknown';

                // Update Main Status based on Next Step
                $newStatusId = $kegiatan['status_id']; // Default to current
                if ($nextExpectedRole === 'Wadir2') {
                    $newStatusId = 7; // Review Wadir 2
                } elseif ($nextExpectedRole === 'Bendahara-Cair') {
                    $newStatusId = 8; // Proses Pencairan
                } elseif ($nextExpectedRole === 'Bendahara-LPJ') {
                    $newStatusId = 9; // Uang Muka Dicairkan
                }

                if ($newStatusId != $kegiatan['status_id']) {
                    $this->kegiatanModel->updateStatus($kegiatanId, $newStatusId);

                    // Log the automatic status change
                    $this->logStatusModel->create([
                        'kegiatan_id' => $kegiatanId,
                        'status_id_lama' => $kegiatan['status_id'],
                        'status_id_baru' => $newStatusId,
                        'actor_user_id' => $this->userData['user_id'],
                        'catatan' => 'Status diperbarui otomatis ke '.$this->getStatusName($newStatusId),
                    ]);
                }

                $nextApproverRoleName = $nextExpectedRole;
                if (in_array($nextApproverRoleName, ['Bendahara-Cair', 'Bendahara-LPJ'])) {
                    $nextApproverRoleName = 'Bendahara';
                }

                $role = $this->roleModel->findByName($nextApproverRoleName);
                if ($role) {
                    $nextApprovers = $this->userModel->findByRoleId($role['role_id']);
                    foreach ($nextApprovers as $approver) {
                        $this->notifikasiModel->create([
                            'penerima_user_id' => $approver['user_id'],
                            'pesan' => "Kegiatan \"{$kegiatan['nama_kegiatan']}\" membutuhkan persetujuan Anda.",
                            'link_tujuan' => '/verifikator/kegiatan/'.$kegiatanId,
                        ]);
                    }
                }

                $db->commit();

                $message = "Disetujui oleh {$expectedRole}. Menunggu persetujuan {$nextApproval['approval_level']}.";
                Response::success(null, $message);

            } else {
                if ($expectedRole === 'Bendahara-LPJ') {
                    $this->kegiatanModel->updateStatus($kegiatanId, 15); // 15 = Selesai
                    $this->notifikasiModel->create([
                        'penerima_user_id' => $kegiatan['pengusul_user_id'],
                        'pesan' => "LPJ untuk kegiatan \"{$kegiatan['nama_kegiatan']}\" telah disetujui. Kegiatan selesai.",
                        'link_tujuan' => '/pengusul/kegiatan/'.$kegiatanId,
                    ]);
                    $db->commit();
                    Response::success(null, 'LPJ disetujui. Kegiatan telah selesai.');
                } else {
                    $db->commit();
                    Response::success(null, 'Persetujuan akhir berhasil.');
                }
            }

        } catch (\Exception $e) {
            if ($db->inTransaction()) {
                $db->rollBack();
            }
            Response::error('Gagal memproses persetujuan: '.$e->getMessage(), 500);
        }
    }

    /**
     * Mark the disbursement process as complete and start the LPJ timer.
     *
     * POST /api/kegiatan/{id}/selesaikan-pencairan
     */
    public function selesaikanPencairan()
    {
        $db = $this->kegiatanModel->getDb();
        try {
            $db->beginTransaction();

            // 1. Get Input and Find Kegiatan
            $uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
            preg_match('/\/kegiatan\/(\d+)\/selesaikan-pencairan$/', $uri, $matches);
            $kegiatanId = $matches[1] ?? null;

            if (! $kegiatanId) {
                Response::error('Kegiatan ID tidak valid.', 400);
            }

            $kegiatan = $this->kegiatanModel->findById($kegiatanId);
            if (! $kegiatan) {
                Response::notFound('Kegiatan tidak ditemukan.');
            }

            // 2. Authorization: Only Bendahara can do this.
            if (! $this->hasRole('Bendahara') && ! $this->hasRole('Admin')) {
                Response::forbidden('Hanya Bendahara yang dapat menyelesaikan proses pencairan.');
            }

            // 3. Find Bendahara-Cair approval step
            $bendaharaCairApproval = $this->kegiatanApprovalModel->findByKegiatanIdAndLevel($kegiatanId, 'Bendahara-Cair');

            if (! $bendaharaCairApproval) {
                Response::error('Proses pencairan untuk kegiatan ini belum dimulai.', 400);
            }

            // 4. Update the Bendahara-Cair step to 'Disetujui'
            $this->kegiatanModel->updateApprovalStatus(
                $bendaharaCairApproval['approval_kegiatan_id'],
                'Disetujui', // Changed from Selesai to Disetujui
                $this->userData['user_id'],
                'Proses pencairan dana telah selesai.'
            );

            // 5. Activate the Bendahara-LPJ step
            $bendaharaLpjApproval = $this->kegiatanApprovalModel->findByKegiatanIdAndLevel($kegiatanId, 'Bendahara-LPJ');
            if ($bendaharaLpjApproval) {
                $this->kegiatanModel->updateApprovalStatus(
                    $bendaharaLpjApproval['approval_kegiatan_id'],
                    'Aktif', // Activate the LPJ step
                    null,
                    null
                );
            }

            // 6. Update main kegiatan status to 'LPJ'
            $this->kegiatanModel->updateStatus($kegiatanId, 11); // 11 = Menunggu LPJ

            // 7. Start the LPJ Timer
            $lpjTimerService = new LpjTimerService;
            $lpjTimerService->startLpjTimer($kegiatanId);

            // 8. Log status change
            $this->logStatusModel->create([
                'kegiatan_id' => $kegiatanId,
                'status_id_lama' => $kegiatan['status_id'],
                'status_id_baru' => 11, // Menunggu LPJ
                'actor_user_id' => $this->userData['user_id'],
                'catatan' => 'Proses pencairan selesai, tahap LPJ dimulai.',
            ]);

            // 9. Notify Pengusul
            $this->notifikasiModel->create([
                'penerima_user_id' => $kegiatan['pengusul_user_id'],
                'pesan' => "Pencairan untuk kegiatan \"{$kegiatan['nama_kegiatan']}\" telah selesai. Anda sekarang dapat mengunggah LPJ.",
                'link_tujuan' => '/pengusul/lpj/'.$kegiatanId,
            ]);

            // 10. Send Email to Pengusul
            $proposer = $this->userModel->findById($kegiatan['pengusul_user_id']);
            if ($proposer && ! empty($proposer['email'])) {
                $pencairanInfo = $this->pencairanDanaModel->getSisaDana($kegiatanId);
                $jumlahCair = $pencairanInfo['total_dicairkan'];

                $kegiatanDataForEmail = [
                    'nama_kegiatan' => $kegiatan['nama_kegiatan'],
                    'pengusul_nama' => $proposer['nama_lengkap'],
                    'pengusul_email' => $proposer['email'],
                ];
                $this->mailService->notifyFundsReleased($kegiatanId, $kegiatanDataForEmail, $jumlahCair);
            }

            $db->commit();
            Response::success(null, 'Proses pencairan berhasil diselesaikan dan tahap LPJ telah dimulai.');

        } catch (\Exception $e) {
            if ($db->inTransaction()) {
                $db->rollBack();
            }
            Response::error('Gagal menyelesaikan proses pencairan: '.$e->getMessage(), 500);
        }
    }

    /**
     * Duplicate kegiatan
     *
     * POST /api/kegiatan/{id}/duplicate
     */
    public function duplicate()
    {
        $db = $this->kegiatanModel->getDb();
        try {
            $db->beginTransaction();

            // Get kegiatan_id from URL
            $uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
            preg_match('/\/kegiatan\/(\d+)\/duplicate$/', $uri, $matches);
            $kegiatanId = $matches[1] ?? null;

            if (! $kegiatanId) {
                Response::error('Kegiatan ID tidak valid.', 400);
            }

            // Get original kegiatan
            $original = $this->kegiatanModel->getKegiatanForPDF($kegiatanId);
            if (! $original) {
                Response::notFound('Kegiatan tidak ditemukan.');
            }

            // Create new kegiatan
            $newData = [
                'nama_kegiatan' => $original['nama_kegiatan'].' (Copy)',
                'deskripsi_kegiatan' => $original['deskripsi_kegiatan'],
                'iku_id' => $original['iku_id'],
                'tanggal_mulai' => $original['tanggal_mulai'],
                'tanggal_selesai' => $original['tanggal_selesai'],
                'lokasi' => $original['lokasi'],
                'total_anggaran_diusulkan' => $original['total_anggaran_diusulkan'],
                'pengusul_user_id' => $this->userData['user_id'],
                'mata_anggaran_id' => $original['mata_anggaran_id'],
                'status_id' => 1, // Draft
            ];

            $newKegiatanId = $this->kegiatanModel->create($newData);

            // Copy anggaran items
            foreach ($original['anggaran_items'] as $item) {
                $this->anggaranModel->create([
                    'kegiatan_id' => $newKegiatanId,
                    'uraian' => $item['uraian'],
                    'volume' => $item['volume'],
                    'satuan_id' => $item['satuan_id'],
                    'harga_satuan' => $item['harga_satuan'],
                    'jumlah_diusulkan' => $item['jumlah_diusulkan'],
                    'catatan' => $item['catatan'],
                ]);
            }

            // Get duplicated kegiatan
            $newKegiatan = $this->kegiatanModel->findById($newKegiatanId);

            $db->commit();
            Response::created($newKegiatan, 'Kegiatan berhasil diduplikasi.');

        } catch (\Exception $e) {
            if ($db->inTransaction()) {
                $db->rollBack();
            }
            Response::error('Gagal duplikasi kegiatan: '.$e->getMessage(), 500);
        }
    }

    /**
     * Get status history
     *
     * GET /api/kegiatan/{id}/logs
     */
    public function logs()
    {
        try {
            // Get kegiatan_id from URL
            $uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
            preg_match('/\/kegiatan\/(\d+)\/logs$/', $uri, $matches);
            $kegiatanId = $matches[1] ?? null;

            if (! $kegiatanId) {
                Response::error('Kegiatan ID tidak valid.', 400);
            }

            // Get logs
            $logs = $this->logStatusModel->getByKegiatanId($kegiatanId);

            Response::success($logs, 'Log status berhasil diambil.');

        } catch (\Exception $e) {
            Response::error('Gagal mengambil log status: '.$e->getMessage(), 500);
        }
    }

    /**
     * Get PPK's notes for a specific kegiatan
     *
     * GET /api/kegiatan/{id}/catatan-ppk
     */
    public function getCatatanPPK()
    {
        try {
            // Get kegiatan_id from URL
            $uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
            preg_match('/\/kegiatan\/(\d+)\/catatan-ppk$/', $uri, $matches);
            $kegiatanId = $matches[1] ?? null;

            if (! $kegiatanId) {
                Response::error('Kegiatan ID tidak valid.', 400);
            }

            // Find the notes from PPK
            $catatan = $this->kegiatanApprovalModel->findCatatanByKegiatanIdAndLevel($kegiatanId, 'PPK');

            if (! $catatan) {
                Response::success(['catatan' => 'Tidak ada catatan dari PPK.'], 'Catatan PPK berhasil diambil.');

                return;
            }

            Response::success($catatan, 'Catatan PPK berhasil diambil.');

        } catch (\Exception $e) {
            Response::error('Gagal mengambil catatan PPK: '.$e->getMessage(), 500);
        }
    }

    /**
     * Get statistics
     *
     * GET /api/kegiatan/statistics/dashboard
     */
    public function statistics()
    {
        try {
            // Authorization: Admin, Verifikator, PPK, Bendahara
            if ($this->hasRole('Pengusul') && ! $this->hasRole('Admin')) {
                $userId = $this->userData['user_id'];
            } else {
                $userId = null;
            }

            $stats = $this->kegiatanModel->getStatistics($userId);

            Response::success($stats, 'Statistik berhasil diambil.');

        } catch (\Exception $e) {
            Response::error('Gagal mengambil statistik: '.$e->getMessage(), 500);
        }
    }

    /**
     * Get overdue activities for PPK.
     *
     * GET /api/kegiatan/overdue-ppk
     * Requires: AuthMiddleware, RoleMiddleware (PPK, Admin)
     */
    public function getOverdueActivities()
    {
        try {
            // Authorization: Only PPK or Admin can access this
            if (! $this->hasRole('PPK') && ! $this->hasRole('Admin')) {
                Response::forbidden('Anda tidak memiliki akses untuk melihat kegiatan overdue PPK.');
            }

            $overdueKegiatan = $this->kegiatanModel->getOverdueKegiatanForPpk();

            $overdueCount = count($overdueKegiatan);
            $kegiatanNames = array_map(fn ($k) => $k['nama_kegiatan'], $overdueKegiatan);

            Response::success([
                'count' => $overdueCount,
                'names' => $kegiatanNames,
                'kegiatan' => $overdueKegiatan, // Return full data with overdue_days
            ], 'Data kegiatan overdue PPK berhasil diambil.');

        } catch (\Exception $e) {
            Response::error('Gagal mengambil data kegiatan overdue PPK: '.$e->getMessage(), 500);
        }
    }

    /**
     * Get overdue activities for Wadir.
     *
     * GET /api/kegiatan/overdue-wadir
     * Requires: AuthMiddleware, RoleMiddleware (Wadir, Admin)
     */
    public function getOverdueActivitiesForWadir()
    {
        try {
            // Authorization: Only Wadir or Admin can access this
            if (! $this->hasRole('Wadir') && ! $this->hasRole('Admin')) {
                Response::forbidden('Anda tidak memiliki akses untuk melihat kegiatan overdue Wadir.');
            }

            $overdueKegiatan = $this->kegiatanModel->getOverdueKegiatanForWadir();

            $overdueCount = count($overdueKegiatan);
            $kegiatanNames = array_map(fn ($k) => $k['nama_kegiatan'], $overdueKegiatan);

            Response::success([
                'count' => $overdueCount,
                'names' => $kegiatanNames,
                'kegiatan' => $overdueKegiatan, // Return full data with overdue_days
            ], 'Data kegiatan overdue Wadir berhasil diambil.');

        } catch (\Exception $e) {
            Response::error('Gagal mengambil data kegiatan overdue Wadir: '.$e->getMessage(), 500);
        }
    }

    /**
     * Stream Surat Pengantar
     *
     * GET /api/kegiatan/{id}/surat-pengantar
     */
    public function streamSuratPengantar()
    {
        try {
            // Get kegiatan_id from URL
            $uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
            preg_match('/\/kegiatan\/(\d+)\/surat-pengantar$/', $uri, $matches);
            $kegiatanId = $matches[1] ?? null;

            if (! $kegiatanId) {
                Response::error('Kegiatan ID tidak valid.', 400);
            }

            // Check if kegiatan exists
            $kegiatan = $this->kegiatanModel->findById($kegiatanId);
            if (! $kegiatan) {
                Response::notFound('Kegiatan tidak ditemukan.');
            }

            // Authorization
            // Admin, PPK, Wadir, Bendahara can view
            // Pengusul can view if owner
            $allowedRoles = ['Admin', 'PPK', 'Wadir', 'Bendahara', 'Verifikator'];
            $hasAccess = false;
            foreach ($allowedRoles as $role) {
                if ($this->hasRole($role)) {
                    $hasAccess = true;
                    break;
                }
            }

            if (! $hasAccess) {
                if ($this->hasRole('Pengusul') && $kegiatan['pengusul_user_id'] == $this->userData['user_id']) {
                    $hasAccess = true;
                }
            }

            if (! $hasAccess) {
                Response::forbidden('Anda tidak memiliki akses untuk melihat surat pengantar ini.');
            }

            if (empty($kegiatan['surat_pengantar_path'])) {
                Response::notFound('Surat pengantar belum diupload.');
            }

            // Check if file exists on server
            // Strategy 1: Use DOCUMENT_ROOT + path (standard for public uploads)
            $filePath = $_SERVER['DOCUMENT_ROOT'].$kegiatan['surat_pengantar_path'];

            if (! file_exists($filePath)) {
                // Strategy 2: Use relative path from app/Controllers to project root (for storage outside public)
                // __DIR__ is app/Controllers. ../../ is project root.
                $filePath = __DIR__.'/../../'.ltrim($kegiatan['surat_pengantar_path'], '/');
            }

            if (! file_exists($filePath)) {
                Response::notFound('File tidak ditemukan di server.');
            }

            // Stream file
            $mimeType = mime_content_type($filePath) ?: 'application/pdf';

            header('Content-Type: '.$mimeType);
            header('Content-Disposition: inline; filename="Surat_Pengantar_'.basename($filePath).'"');
            header('Content-Length: '.filesize($filePath));
            header('Cache-Control: no-cache, must-revalidate');
            header('Expires: 0');

            readfile($filePath);
            exit;

        } catch (\Exception $e) {
            Response::error('Gagal menampilkan file: '.$e->getMessage(), 500);
        }
    }

    /**
     * Export to Excel
     *
     * GET /api/kegiatan/export/excel
     */
    public function exportExcel()
    {
        try {
            // Get filters
            $status = $_GET['status'] ?? null;

            // Authorization: Pengusul hanya export kegiatan sendiri
            $userId = null;
            if ($this->hasRole('Pengusul') && ! $this->hasRole('Admin')) {
                $userId = $this->userData['user_id'];
            }

            // Get kegiatan
            $kegiatan = $this->kegiatanModel->getAllForExport([
                'status_id' => $status,
                'user_id' => $userId,
            ]);

            // Generate Excel
            $this->generateExcel($kegiatan);

        } catch (\Exception $e) {
            Response::error('Gagal export data: '.$e->getMessage(), 500);
        }
    }

    /**
     * Helper: Check if user has role
     */
    private function hasRole($roleName)
    {
        return in_array($roleName, $this->userData['roles'] ?? []);
    }

    /**
     * Helper: Get status name by ID
     */
    private function getStatusName($statusId)
    {
        $statuses = [
            7 => 'Review Wadir 2',
            8 => 'Proses Pencairan',
            9 => 'Uang Muka Dicairkan',
        ];

        return $statuses[$statusId] ?? 'Status Baru';
    }

    /**
     * Helper: Generate Excel file
     */
    private function generateExcel($data)
    {
        // Set headers for Excel download
        header('Content-Type: application/vnd.ms-excel');
        header('Content-Disposition: attachment;filename="Kegiatan_'.date('YmdHis').'.xls"');
        header('Cache-Control: max-age=0');

        // Start output
        echo '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">';
        echo '<head><meta charset="UTF-8"></head><body>';
        echo '<table border="1">';
        echo '<thead>';
        echo '<tr>';
        echo '<th>No</th>';
        echo '<th>Nama Kegiatan</th>';
        echo '<th>Tanggal Mulai</th>';
        echo '<th>Tanggal Selesai</th>';
        echo '<th>Lokasi</th>';
        echo '<th>Pengusul</th>';
        echo '<th>Status</th>';
        echo '<th>Total Anggaran Diusulkan</th>';
        echo '<th>Total Anggaran Disetujui</th>';
        echo '</tr>';
        echo '</thead>';
        echo '<tbody>';

        $no = 1;
        foreach ($data as $row) {
            echo '<tr>';
            echo '<td>'.$no++.'</td>';
            echo '<td>'.htmlspecialchars($row['nama_kegiatan']).'</td>';
            echo '<td>'.$row['tanggal_mulai'].'</td>';
            echo '<td>'.$row['tanggal_selesai'].'</td>';
            echo '<td>'.htmlspecialchars($row['lokasi']).'</td>';
            echo '<td>'.htmlspecialchars($row['pengusul_nama']).'</td>';
            echo '<td>'.htmlspecialchars($row['nama_status']).'</td>';
            echo '<td>'.number_format($row['total_anggaran_diusulkan'], 0, ',', '.').'</td>';
            echo '<td>'.($row['total_anggaran_disetujui'] ? number_format($row['total_anggaran_disetujui'], 0, ',', '.') : '-').'</td>';
            echo '</tr>';
        }

        echo '</tbody>';
        echo '</table>';
        echo '</body></html>';
        exit;
    }
}

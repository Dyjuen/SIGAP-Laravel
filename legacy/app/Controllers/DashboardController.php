<?php

namespace App\Controllers;

use App\Core\Response;
use App\Middlewares\AuthMiddleware;
use App\Models\Kegiatan;
use App\Models\Panduan;
use App\Services\FlasherNotificationService;

 // Added

class DashboardController
{
    private $userData;

    private $flasherNotificationService; // Added

    public function __construct()
    {
        // Get authenticated user data for role-based access
        $this->userData = AuthMiddleware::getAuthUser();
        $this->flasherNotificationService = new FlasherNotificationService; // Added
    }

    /**
     * GET /dashboard/summary
     * Mengambil data rekap jumlah kegiatan.
     * Menggunakan kembali logika dari KegiatanController/KegiatanModel.
     */
    public function getSummary()
    {
        try {
            $kegiatanModel = new Kegiatan;

            // Pengusul hanya melihat statistik kegiatannya sendiri
            $userId = null;
            if (isset($this->userData['roles']) && in_array('Pengusul', $this->userData['roles']) && ! in_array('Admin', $this->userData['roles'])) {
                $userId = $this->userData['user_id'];
            }

            // Memanggil metode statistik yang sudah ada di model
            $stats = $kegiatanModel->getStatistics($userId);

            // Mapping hasil ke format yang diminta
            $summary = [
                'draft' => $stats['total_draft'] ?? 0,
                'diajukan' => $stats['total_review_verifikator'] ?? 0,
                'revisi' => $stats['total_revisi'] ?? 0,
            ];

            Response::success($summary, 'Data summary berhasil diambil.');

        } catch (\Exception $e) {
            Response::error('Gagal mengambil data summary: '.$e->getMessage(), 500);
        }
    }

    /**
     * GET /api/dashboard/flasher-notifications
     * Mengambil notifikasi flasher untuk peran PPK atau Wadir yang terlambat disetujui.
     * Tidak mengubah fungsi yang sudah ada.
     */
    public function getLoginFlasherNotifications()
    {
        try {
            $flasherMessages = [];
            // Only generate flasher notifications for PPK or Wadir roles
            if (isset($this->userData['roles']) && ($this->hasRole('PPK') || $this->hasRole('Wadir'))) {
                $userName = $this->userData['nama_lengkap'] ?? 'Pengguna'; // Get user's full name, fallback to 'Pengguna'
                $flasherMessages = $this->flasherNotificationService->getLoginFlasherNotifications($this->userData['user_id'], $userName);
            }

            Response::success($flasherMessages, 'Flasher notifications berhasil diambil.');

        } catch (\Exception $e) {
            Response::error('Gagal mengambil flasher notifications: '.$e->getMessage(), 500);
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
     * GET /dashboard/kegiatan
     * Mengambil data monitoring kegiatan khusus untuk dashboard.
     */
    public function getMonitoringKegiatan()
    {
        try {
            $kegiatanModel = new Kegiatan;

            $filters = [
                'search' => $_GET['search'] ?? null,
                'unit_pengusul' => $_GET['unit_pengusul'] ?? null,
                'status' => $_GET['status'] ?? null,
                'approval_level' => $_GET['approval_level'] ?? null,
                'filter_type' => $_GET['filter_type'] ?? null,
                'page' => isset($_GET['page']) ? (int) $_GET['page'] : 1,
                'per_page' => isset($_GET['per_page']) ? (int) $_GET['per_page'] : 10,
            ];

            // Pengusul hanya bisa lihat kegiatan sendiri
            if (isset($this->userData['roles']) && in_array('Pengusul', $this->userData['roles']) && ! in_array('Admin', $this->userData['roles'])) {
                $filters['unit_pengusul'] = $this->userData['user_id'];
            }

            $result = $kegiatanModel->getDashboardMonitoringKegiatan($filters);

            Response::success($result, 'Data monitoring kegiatan berhasil diambil.');

        } catch (\Exception $e) {
            Response::error('Gagal mengambil data kegiatan: '.$e->getMessage(), 500);
        }
    }

    /**
     * GET /dashboard/lpj
     * Mengambil data monitoring LPJ dengan filter dan search.
     */
    public function getLpj()
    {
        try {
            $kegiatanModel = new Kegiatan;

            $filters = [
                'search' => $_GET['search'] ?? null,
                'unit_pengusul' => $_GET['unit_pengusul'] ?? null,
                'status' => $_GET['status'] ?? null, // Can be used for status_lpj
                'filter_type' => $_GET['filter_type'] ?? null,
                'page' => isset($_GET['page']) ? (int) $_GET['page'] : 1,
                'per_page' => isset($_GET['per_page']) ? (int) $_GET['per_page'] : 10,
            ];

            // Pengusul hanya bisa lihat LPJ kegiatan sendiri
            if (isset($this->userData['roles']) && in_array('Pengusul', $this->userData['roles']) && ! in_array('Admin', $this->userData['roles'])) {
                $filters['unit_pengusul'] = $this->userData['user_id'];
            }

            $result = $kegiatanModel->getDashboardMonitoringLpj($filters);

            Response::success($result, 'Data monitoring LPJ berhasil diambil.');

        } catch (\Exception $e) {
            Response::error('Gagal mengambil data LPJ: '.$e->getMessage(), 500);
        }
    }

    /**
     * GET /dashboard/template
     * Mengambil daftar template dokumen.
     */
    public function getTemplates()
    {
        try {
            $panduanModel = new Panduan;
            $role_id = $this->userData['role_id'] ?? null;
            $userRoles = $this->userData['roles'] ?? [];

            if (in_array('Admin', $userRoles)) {
                $panduan = $panduanModel->findAll();
            } else {
                $panduan = $panduanModel->findByRole($role_id);
            }

            $templates = [];
            foreach ($panduan as $item) {
                $isVideo = false;
                // Logic detect video from PanduanController
                if (empty($item['tipe_media']) || is_null($item['tipe_media'])) {
                    if (! empty($item['path_media'])) {
                        if (filter_var($item['path_media'], FILTER_VALIDATE_URL) ||
                            strpos($item['path_media'], 'youtube.com') !== false ||
                            strpos($item['path_media'], 'youtu.be') !== false) {
                            $isVideo = true;
                        }
                    }
                } elseif ($item['tipe_media'] === 'video') {
                    $isVideo = true;
                }

                if (! $isVideo) {
                    $templates[] = [
                        'name' => $item['judul_panduan'],
                        'file_path' => $item['path_media'],
                    ];
                }
            }

            Response::success($templates, 'Data template berhasil diambil.');
        } catch (\Exception $e) {
            Response::error('Gagal mengambil data template: '.$e->getMessage(), 500);
        }
    }

    /**
     * GET /dashboard/video
     * Mengambil daftar video panduan.
     */
    public function getVideos()
    {
        try {
            $panduanModel = new Panduan;
            $role_id = $this->userData['role_id'] ?? null;
            $userRoles = $this->userData['roles'] ?? [];

            if (in_array('Admin', $userRoles)) {
                $panduan = $panduanModel->findAll();
            } else {
                $panduan = $panduanModel->findByRole($role_id);
            }

            $videos = [];
            foreach ($panduan as $item) {
                $isVideo = false;
                // Logic detect video from PanduanController
                if (empty($item['tipe_media']) || is_null($item['tipe_media'])) {
                    if (! empty($item['path_media'])) {
                        if (filter_var($item['path_media'], FILTER_VALIDATE_URL) ||
                            strpos($item['path_media'], 'youtube.com') !== false ||
                            strpos($item['path_media'], 'youtu.be') !== false) {
                            $isVideo = true;
                        }
                    }
                } elseif ($item['tipe_media'] === 'video') {
                    $isVideo = true;
                }

                if ($isVideo) {
                    $videos[] = [
                        'title' => $item['judul_panduan'],
                        'url' => $item['path_media'],
                        'thumbnail' => null, // Optional, could be extracted from YouTube URL
                    ];
                }
            }

            Response::success($videos, 'Data video panduan berhasil diambil.');
        } catch (\Exception $e) {
            Response::error('Gagal mengambil data video: '.$e->getMessage(), 500);
        }
    }
}

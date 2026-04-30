<?php

namespace App\Controllers;

use App\Core\Controller;
use App\Core\Database;
use App\Core\Response;
use App\Models\KAK;
use App\Models\Kegiatan;
use App\Models\Panduan;
use App\Models\PencairanDana;
use PDO;
use PDOException;

class WadirController extends Controller
{
    public function __construct()
    {
        parent::__construct();
    }

    public function getSummary()
    {
        try {
            $db = Database::getInstance()->getConnection();

            // 1. Total Pagu Anggaran
            $stmtPagu = $db->query('SELECT SUM(total_pagu) as total_pagu FROM m_mata_anggaran');
            $totalPagu = $stmtPagu->fetch(PDO::FETCH_ASSOC)['total_pagu'] ?? 0;

            // 2. Total Anggaran KAK Disetujui (status_id = 3)
            $stmtApproved = $db->query('
                SELECT SUM(tka.harga_satuan * tka.volume1 * COALESCE(tka.volume2, 1)) as total_disetujui 
                FROM t_kak_anggaran tka 
                JOIN t_kak tk ON tka.kak_id = tk.kak_id 
                WHERE tk.status_id = 3
            ');
            $totalDisetujui = $stmtApproved->fetch(PDO::FETCH_ASSOC)['total_disetujui'] ?? 0;

            // 3. Total Dana Dicairkan
            $stmtDisbursed = $db->query('SELECT SUM(jumlah_dicairkan) as total_dicairkan FROM t_pencairan_dana');
            $totalDicairkan = $stmtDisbursed->fetch(PDO::FETCH_ASSOC)['total_dicairkan'] ?? 0;

            // 4. Jumlah Kegiatan per Status
            $stmtKegiatan = $db->query('
                SELECT mks.nama_status, COUNT(k.kegiatan_id) as jumlah 
                FROM t_kegiatan k
                JOIN t_kak tk ON k.kak_id = tk.kak_id
                JOIN m_kegiatan_status mks ON tk.status_id = mks.status_id 
                GROUP BY mks.nama_status
            ');
            $kegiatanPerStatus = $stmtKegiatan->fetchAll(PDO::FETCH_ASSOC);

            $summary = [
                'keuangan' => [
                    'total_pagu_anggaran' => (float) $totalPagu,
                    'total_anggaran_disetujui' => (float) $totalDisetujui,
                    'total_dana_dicairkan' => (float) $totalDicairkan,
                    'sisa_pagu' => (float) $totalPagu - (float) $totalDisetujui,
                ],
                'kegiatan' => $kegiatanPerStatus,
            ];

            Response::json($summary);

        } catch (PDOException $e) {
            Response::error($e->getMessage(), 500);
        }
    }

    public function getAllKak()
    {
        $kakModel = new KAK;
        $data = $kakModel->findAll();
        Response::json($data);
    }

    public function getAllKegiatan()
    {
        $kegiatanModel = new Kegiatan;
        $data = $kegiatanModel->findAll();
        Response::json($data);
    }

    public function getAllPencairan()
    {
        $pencairanModel = new PencairanDana;
        $data = $pencairanModel->findAll();
        Response::json($data);
    }

    public function getVideos()
    {
        $panduanModel = new Panduan;
        $role_id = $this->user['role_id'] ?? null;
        $userRoles = $this->user['roles'] ?? [];

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
                    'thumbnail' => null,
                ];
            }
        }

        Response::success($videos, 'Data video panduan berhasil diambil.');
    }
}

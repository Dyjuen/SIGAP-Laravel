<?php

namespace App\Models;

use App\Core\Model;
use PDO;

class Kegiatan extends Model
{
    protected $table = 't_kegiatan';

    protected $primaryKey = 'kegiatan_id';

    public function getDashboardMonitoringKegiatan(array $filters)
    {
        $params = [];
        $baseSql = 'FROM v_dashboard_monitoring_kegiatan';

        $whereSql = ' WHERE 1=1';

        if (! empty($filters['status_id'])) {
            $whereSql .= ' AND status_id = ?';
            $params[] = $filters['status_id'];
        }
        if (! empty($filters['search'])) {
            $whereSql .= ' AND nama_kegiatan LIKE ?';
            $params[] = '%'.$filters['search'].'%';
        }
        if (! empty($filters['user_id'])) {
            $whereSql .= ' AND pengusul_user_id = ?';
            $params[] = $filters['user_id'];
        }
        if (! empty($filters['unit_pengusul'])) {
            $whereSql .= ' AND pengusul_user_id = ?';
            $params[] = $filters['unit_pengusul'];
        }

        // New filters for Bendahara Dashboard
        if (! empty($filters['approval_level'])) {
            $whereSql .= ' AND approval_level = ?';
            $params[] = $filters['approval_level'];
        }

        if (! empty($filters['filter_type'])) {
            if ($filters['filter_type'] === 'pencairan_menunggu') {
                $whereSql .= " AND approval_level = 'Bendahara-Cair' AND status_approval_aktif = 'Aktif'";
            } elseif ($filters['filter_type'] === 'pencairan_selesai') {
                $whereSql .= ' AND dana_dicairkan > 0';
            }
        }

        // Count total records
        $countSql = 'SELECT COUNT(DISTINCT kegiatan_id) '.$baseSql.$whereSql;
        $totalRecords = $this->query($countSql, $params)->fetchColumn();

        // Main query
        $mainSelect = 'SELECT kegiatan_id, nama_kegiatan, pengusul_nama, nama_status, status_id, status_saat_ini, status_approval_aktif, dana_dicairkan';

        $page = $filters['page'] ?? 1;
        $perPage = $filters['per_page'] ?? 10;
        $offset = ($page - 1) * $perPage;

        $finalParams = array_merge($params, [$perPage, $offset]);
        $paginationSql = ' ORDER BY kegiatan_created_at DESC LIMIT ? OFFSET ?';

        $sql = $mainSelect.' '.$baseSql.$whereSql.$paginationSql;

        $data = $this->query($sql, $finalParams)->fetchAll(PDO::FETCH_ASSOC);

        return [
            'data' => $data,
            'pagination' => [
                'total' => (int) $totalRecords,
                'per_page' => $perPage,
                'current_page' => $page,
                'last_page' => ceil($totalRecords / $perPage),
            ],
        ];
    }

    public function getDashboardMonitoringLpj(array $filters)
    {
        $params = [];
        $sql = "SELECT
                    k.kegiatan_id,
                    t.nama_kegiatan,
                    u.nama_lengkap as pengusul_nama,
                    k.pelaksana_manual,
                    k.tgl_batas_lpj,
                    CASE
                        WHEN k.lpj_submitted_at IS NULL THEN 'Menunggu Penyerahan'
                        WHEN lpj_digital_approval.status = 'Aktif' THEN 'Diajukan'
                        WHEN lpj_digital_approval.status = 'Revisi' THEN 'Direvisi'
                        WHEN lpj_fisik_approval.status = 'Revisi' THEN 'Direvisi'
                        WHEN lpj_digital_approval.status = 'Disetujui' AND lpj_fisik_approval.status = 'Aktif' THEN 'Setor Fisik'
                        WHEN lpj_digital_approval.status = 'Disetujui' AND lpj_fisik_approval.status = 'Disetujui' THEN 'Selesai'
                        ELSE 'Diajukan' -- If submitted but no other case matches, it's most likely in review.
                    END as status_lpj,
                    CASE
                        WHEN k.tgl_batas_lpj IS NOT NULL AND k.lpj_submitted_at IS NULL AND k.tgl_batas_lpj < NOW() THEN 'Terlambat'
                        ELSE 'Tepat Waktu'
                    END as status_ketepatan
                FROM t_kegiatan k
                JOIN t_kak t ON k.kak_id = t.kak_id
                JOIN m_users u ON t.pengusul_user_id = u.user_id
                JOIN m_kegiatan_status ks ON t.status_id = ks.status_id
                LEFT JOIN t_kegiatan_approval lpj_digital_approval ON k.kegiatan_id = lpj_digital_approval.kegiatan_id AND lpj_digital_approval.approval_level = 'Bendahara-LPJ'
                LEFT JOIN t_kegiatan_approval lpj_fisik_approval ON k.kegiatan_id = lpj_fisik_approval.kegiatan_id AND lpj_fisik_approval.approval_level = 'Bendahara-Setor'
                WHERE k.tgl_batas_lpj IS NOT NULL
                  AND (
                      lpj_digital_approval.status IN ('Aktif', 'Revisi', 'Disetujui') 
                      OR lpj_fisik_approval.status IN ('Aktif', 'Revisi', 'Disetujui')
                  )";

        if (! empty($filters['search'])) {
            $sql .= ' AND t.nama_kegiatan LIKE ?';
            $params[] = '%'.$filters['search'].'%';
        }
        if (! empty($filters['unit_pengusul'])) {
            $sql .= ' AND t.pengusul_user_id = ?';
            $params[] = $filters['unit_pengusul'];
        }

        // Add HAVING clause for status_lpj filtering
        $havingClause = '';
        if (! empty($filters['status'])) {
            if ($filters['status'] === 'Perlu Diverifikasi') {
                // Map 'Perlu Diverifikasi' to logical statuses
                $havingClause = " HAVING status_lpj IN ('Diajukan', 'Setor Fisik')";
            } else {
                $havingClause = ' HAVING status_lpj = ?';
                $params[] = $filters['status'];
            }
        }

        if (! empty($filters['filter_type']) && $filters['filter_type'] === 'perlu_verifikasi') {
            $havingClause = " HAVING status_lpj IN ('Diajukan', 'Setor Fisik')";
        }

        // Note: Counting records with HAVING is complex.
        // Simple count ignores HAVING. We need to wrap query or just count filtered results (less efficient but correct).
        // For pagination with HAVING, it's better to use a subquery for count.

        $sqlWithHaving = $sql.$havingClause;

        $countSql = "SELECT COUNT(*) FROM ({$sqlWithHaving}) as count_table";
        $totalRecords = $this->query($countSql, $params)->fetchColumn();

        $page = $filters['page'] ?? 1;
        $perPage = $filters['per_page'] ?? 10;
        $offset = ($page - 1) * $perPage;

        $sqlWithHaving .= ' ORDER BY k.tgl_batas_lpj DESC LIMIT ? OFFSET ?';

        $finalParams = array_merge($params, [$perPage, $offset]);

        $data = $this->query($sqlWithHaving, $finalParams)->fetchAll(PDO::FETCH_ASSOC);

        return [
            'data' => $data,
            'pagination' => [
                'total' => (int) $totalRecords,
                'per_page' => $perPage,
                'current_page' => $page,
                'last_page' => ceil($totalRecords / $perPage),
            ],
        ];
    }

    public function getAllWithFilters(array $filters)
    {
        $params = [];
        $baseSql = "FROM t_kegiatan k
                    JOIN t_kak t ON k.kak_id = t.kak_id
                    JOIN m_users u ON t.pengusul_user_id = u.user_id
                    LEFT JOIN m_kegiatan_status ks ON t.status_id = ks.status_id
                    LEFT JOIN t_kegiatan_approval ppk_approval ON k.kegiatan_id = ppk_approval.kegiatan_id AND ppk_approval.approval_level = 'PPK'";

        $whereSql = ' WHERE 1=1';

        if (! empty($filters['status_id'])) {
            $whereSql .= ' AND t.status_id = ?';
            $params[] = $filters['status_id'];
        }
        if (! empty($filters['search'])) {
            $whereSql .= ' AND t.nama_kegiatan LIKE ?';
            $params[] = '%'.$filters['search'].'%';
        }
        if (! empty($filters['user_id'])) {
            $whereSql .= ' AND t.pengusul_user_id = ?';
            $params[] = $filters['user_id'];
        }
        if (! empty($filters['tanggal_mulai'])) {
            $whereSql .= ' AND t.tanggal_mulai >= ?';
            $params[] = $filters['tanggal_mulai'];
        }
        if (! empty($filters['tanggal_selesai'])) {
            $whereSql .= ' AND t.tanggal_selesai <= ?';
            $params[] = $filters['tanggal_selesai'];
        }
        if (! empty($filters['unit_pengusul'])) {
            $whereSql .= ' AND t.pengusul_user_id = ?';
            $params[] = $filters['unit_pengusul'];
        }
        if (! empty($filters['kode_kegiatan'])) {
            $whereSql .= ' AND t.kode_kegiatan = ?';
            $params[] = $filters['kode_kegiatan'];
        }
        if (! empty($filters['kategori_kegiatan'])) {
            $whereSql .= ' AND t.tipe_kegiatan_id = ?';
            $params[] = $filters['kategori_kegiatan'];
        }
        if (! empty($filters['status'])) {
            $whereSql .= ' AND ks.nama_status = ?';
            $params[] = $filters['status'];
        }

        // Count total records
        $countSql = 'SELECT COUNT(DISTINCT k.kegiatan_id) '.$baseSql.$whereSql;
        $totalRecords = $this->query($countSql, $params)->fetchColumn();

        // Main query
        $mainSelect = 'SELECT 
                        k.kegiatan_id,
                        k.kak_id,
                        k.penanggung_jawab_manual,
                        k.pelaksana_manual,
                        k.tgl_batas_lpj,
                        k.lpj_submitted_at,
                        k.surat_pengantar_path,
                        t.nama_kegiatan,
                        t.tanggal_mulai,
                        t.tanggal_selesai,
                        t.lokasi,
                        t.created_at,
                        ppk_approval.created_at as tanggal_diajukan_ppk,
                        u.nama_lengkap as pengusul_nama,
                        ks.nama_status,
                        ks.status_id,
                        (SELECT COALESCE(SUM(pd.jumlah_dicairkan), 0) FROM t_pencairan_dana pd WHERE pd.kegiatan_id = k.kegiatan_id) as dana_dicairkan,
                        (SELECT MAX(pd.tanggal_pencairan) FROM t_pencairan_dana pd WHERE pd.kegiatan_id = k.kegiatan_id) as disbursement_date,
                        COALESCE(
                            (SELECT SUM(tka.jumlah_diusulkan) FROM t_kegiatan_anggaran tka WHERE tka.kegiatan_id = k.kegiatan_id),
                            (SELECT SUM(ta.jumlah_diusulkan) FROM t_kak_anggaran ta WHERE ta.kak_id = t.kak_id),
                            0
                        ) as total_anggaran_diusulkan';

        $page = $filters['page'] ?? 1;
        $perPage = $filters['per_page'] ?? 10;
        $offset = ($page - 1) * $perPage;

        $finalParams = array_merge($params, [$perPage, $offset]);
        $paginationSql = ' ORDER BY k.created_at DESC LIMIT ? OFFSET ?';

        $sql = $mainSelect.' '.$baseSql.$whereSql.$paginationSql;

        $data = $this->query($sql, $finalParams)->fetchAll(PDO::FETCH_ASSOC);

        // Augment data with full approval history
        $kegiatanIds = array_map(fn ($k) => $k['kegiatan_id'], $data);

        if (! empty($kegiatanIds)) {
            $placeholders = implode(',', array_fill(0, count($kegiatanIds), '?'));
            $sqlApprovals = "SELECT * FROM t_kegiatan_approval WHERE kegiatan_id IN ({$placeholders}) ORDER BY approval_kegiatan_id ASC";
            $allApprovals = $this->query($sqlApprovals, $kegiatanIds)->fetchAll(PDO::FETCH_ASSOC);

            $groupedApprovals = [];
            foreach ($allApprovals as $approval) {
                $groupedApprovals[$approval['kegiatan_id']][] = $approval;
            }

            foreach ($data as &$kegiatan) {
                $kegiatan['approvals'] = $groupedApprovals[$kegiatan['kegiatan_id']] ?? [];
                $kegiatan['current_approval'] = $this->findCurrentApproval($kegiatan['kegiatan_id']);
            }
        }

        return [
            'data' => $data,
            'pagination' => [
                'total' => (int) $totalRecords,
                'per_page' => $perPage,
                'current_page' => $page,
                'last_page' => ceil($totalRecords / $perPage),
            ],
        ];
    }

    public function getRiwayatWithFilters(array $filters)
    {
        $params = [];

        // Base SQL - ambil dari KAK yang sudah disetujui verifikator
        $baseSql = 'FROM t_kak kak
                LEFT JOIN t_kegiatan k ON kak.kak_id = k.kak_id
                JOIN m_users u ON kak.pengusul_user_id = u.user_id
                JOIN m_kegiatan_status ks ON kak.status_id = ks.status_id
                LEFT JOIN t_kegiatan_approval ka ON k.kegiatan_id = ka.kegiatan_id
                LEFT JOIN t_kak_approval tka ON kak.kak_id = tka.kak_id';

        // WHERE clause - hanya KAK yang sudah disetujui verifikator
        // Menggunakan tabel t_kak_approval sesuai instruksi
        $whereSql = " WHERE tka.status = 'Disetujui'";

        // Filter berdasarkan pengusul (untuk role Pengusul)
        if (! empty($filters['pengusul_user_id'])) {
            $whereSql .= ' AND kak.pengusul_user_id = ?';
            $params[] = $filters['pengusul_user_id'];
        }

        // Filter berdasarkan approver (untuk PPK, Wadir, Bendahara)
        if (! empty($filters['approver_user_id'])) {
            if (! empty($filters['approval_level']) && $filters['approval_level'] === 'Bendahara-Setor') {
                $whereSql .= " AND ka.approver_user_id = ? AND ka.status = 'Disetujui'";
            } else {
                $whereSql .= " AND ka.approver_user_id = ? AND ka.status = 'Disetujui'";
            }
            $params[] = $filters['approver_user_id'];

            // Filter approval level
            if (! empty($filters['approval_level'])) {
                if ($filters['approval_level'] === 'Bendahara') {
                    // Match semua level bendahara
                    $whereSql .= " AND ka.approval_level LIKE 'Bendahara%'";
                } else {
                    $whereSql .= ' AND ka.approval_level = ?';
                    $params[] = $filters['approval_level'];
                }
            }
        }

        // Filter for Verifikator based on username (verifikator1 -> tipe_kegiatan_id 1)
        if (! empty($filters['username']) && strpos($filters['username'], 'verifikator') === 0) {
            // extract number
            if (preg_match('/verifikator(\d+)$/', $filters['username'], $matches)) {
                $whereSql .= ' AND kak.tipe_kegiatan_id = ?';
                $params[] = $matches[1];
            }
        }

        // Filter search
        if (! empty($filters['search'])) {
            $whereSql .= ' AND kak.nama_kegiatan LIKE ?';
            $params[] = '%'.$filters['search'].'%';
        }

        // Filter tanggal
        if (! empty($filters['tanggal_mulai'])) {
            $whereSql .= ' AND kak.tanggal_mulai >= ?';
            $params[] = $filters['tanggal_mulai'];
        }
        if (! empty($filters['tanggal_selesai'])) {
            $whereSql .= ' AND kak.tanggal_selesai <= ?';
            $params[] = $filters['tanggal_selesai'];
        }

        // Group by untuk menghindari duplikat karena multiple approval
        $groupBy = ' GROUP BY kak.kak_id';

        try {
            // Count total records
            $countSql = 'SELECT COUNT(DISTINCT kak.kak_id) '.$baseSql.$whereSql;
            $totalRecords = $this->query($countSql, $params)->fetchColumn();

            // Main query
            $mainSelect = "SELECT 
                        kak.kak_id,
                        kak.nama_kegiatan,
                        kak.tanggal_mulai,
                        kak.tanggal_selesai,
                        kak.lokasi,
                        kak.created_at as tanggal_dibuat,
                        u.nama_lengkap as pengusul_nama,
                        ks.nama_status,
                        ks.status_id,
                        k.kegiatan_id,
                        k.created_at as tanggal_diajukan_kegiatan,
                        (SELECT SUM(ta.jumlah_diusulkan) 
                         FROM t_kak_anggaran ta 
                         WHERE ta.kak_id = kak.kak_id) as total_anggaran,
                        CASE 
                            WHEN k.kegiatan_id IS NOT NULL THEN 'Sudah Diajukan Kegiatan'
                            ELSE 'Belum Diajukan Kegiatan'
                        END as status_pengajuan_kegiatan,
                        MAX(tka.updated_at) as tanggal_disetujui_verifikator";

            // Pagination
            $page = $filters['page'] ?? 1;
            $perPage = $filters['per_page'] ?? 10;
            $offset = ($page - 1) * $perPage;

            $paginationSql = ' ORDER BY kak.created_at DESC LIMIT ? OFFSET ?';
            $finalParams = array_merge($params, [$perPage, $offset]);

            $sql = $mainSelect.' '.$baseSql.$whereSql.$groupBy.$paginationSql;

            $data = $this->query($sql, $finalParams)->fetchAll(PDO::FETCH_ASSOC);

            // Tambahkan info approval untuk setiap kegiatan (jika ada)
            foreach ($data as &$item) {
                if ($item['kegiatan_id']) {
                    $sqlApprovals = 'SELECT 
                                    ka.approval_level,
                                    ka.status,
                                    ka.approver_user_id,
                                    u.nama_lengkap as approver_nama,
                                    ka.created_at as tanggal_approval
                                FROM t_kegiatan_approval ka
                                LEFT JOIN m_users u ON ka.approver_user_id = u.user_id
                                WHERE ka.kegiatan_id = ?
                                ORDER BY ka.approval_kegiatan_id ASC';

                    $item['approval_history'] = $this->query($sqlApprovals, [$item['kegiatan_id']])->fetchAll(PDO::FETCH_ASSOC);
                } else {
                    $item['approval_history'] = [];
                }
            }

            return [
                'data' => $data,
                'pagination' => [
                    'total' => (int) $totalRecords,
                    'per_page' => $perPage,
                    'current_page' => $page,
                    'last_page' => ceil($totalRecords / $perPage),
                ],
            ];
        } catch (\Exception $e) {
            throw $e;
        }
    }

    public function getKegiatanForPDF($kegiatanId)
    {
        $sql = 'SELECT 
                    k.*, 
                    t.*, 
                    u.nama_lengkap as pengusul_nama, 
                    u.email as pengusul_email,
                    COALESCE(
                        (SELECT SUM(tka.jumlah_diusulkan) FROM t_kegiatan_anggaran tka WHERE tka.kegiatan_id = k.kegiatan_id),
                        (SELECT SUM(ta.jumlah_diusulkan) FROM t_kak_anggaran ta WHERE ta.kak_id = t.kak_id),
                        0
                    ) as total_anggaran_diusulkan
                FROM t_kegiatan k
                JOIN t_kak t ON k.kak_id = t.kak_id
                JOIN m_users u ON t.pengusul_user_id = u.user_id
                WHERE k.kegiatan_id = ?';

        $kegiatan = $this->query($sql, [$kegiatanId])->fetch(PDO::FETCH_ASSOC);
        if ($kegiatan) {
            // Check if t_kegiatan_anggaran has data
            $sqlCheck = 'SELECT COUNT(*) FROM t_kegiatan_anggaran WHERE kegiatan_id = ?';
            $hasKegiatanAnggaran = $this->query($sqlCheck, [$kegiatanId])->fetchColumn() > 0;

            if ($hasKegiatanAnggaran) {
                $sqlAnggaran = 'SELECT ka.*, kb.nama as nama_kategori
                                FROM t_kegiatan_anggaran ka
                                LEFT JOIN m_kategori_belanja kb ON ka.kategori_belanja_id = kb.kategori_belanja_id
                                WHERE ka.kegiatan_id = ?';
                $kegiatan['anggaran_items'] = $this->query($sqlAnggaran, [$kegiatanId])->fetchAll(PDO::FETCH_ASSOC);
            } else {
                $sqlAnggaran = 'SELECT ka.*, kb.nama as nama_kategori
                                FROM t_kak_anggaran ka
                                LEFT JOIN m_kategori_belanja kb ON ka.kategori_belanja_id = kb.kategori_belanja_id
                                WHERE ka.kak_id = ?';
                $kegiatan['anggaran_items'] = $this->query($sqlAnggaran, [$kegiatan['kak_id']])->fetchAll(PDO::FETCH_ASSOC);
            }

            // Fetch associated files for each budget item
            if (! empty($kegiatan['anggaran_items'])) {
                $lampiranModel = new KegiatanLampiran;
                foreach ($kegiatan['anggaran_items'] as &$item) { // Use reference to modify in place
                    $item['bukti'] = $lampiranModel->findAllBy('anggaran_id', $item['anggaran_id']);
                }
            }
        }

        return $kegiatan;
    }

    public function find($id)
    {
        $sql = "SELECT
                    k.*,
                    k.kak_id AS kegiatan_kak_id,
                    t.kak_id AS kak_table_kak_id,
                    t.pengusul_user_id AS kak_pengusul_user_id,
                    t.status_id,
                    t.nama_kegiatan,
                    (SELECT SUM(ta.jumlah_diusulkan) FROM t_kak_anggaran ta WHERE ta.kak_id = t.kak_id) as total_anggaran_disetujui,
                    (SELECT COALESCE(SUM(pd.jumlah_dicairkan), 0) FROM t_pencairan_dana pd WHERE pd.kegiatan_id = k.kegiatan_id) as dana_dicairkan
                FROM {$this->table} k
                LEFT JOIN t_kak t ON k.kak_id = t.kak_id
                WHERE k.{$this->primaryKey} = ?";

        return $this->query($sql, [$id])->fetch(PDO::FETCH_ASSOC);
    }

    public function findById($id)
    {
        $sql = "SELECT 
                    k.*, 
                    t.pengusul_user_id, 
                    t.status_id, 
                    t.nama_kegiatan,
                    COALESCE(
                        (SELECT SUM(tka.jumlah_diusulkan) FROM t_kegiatan_anggaran tka WHERE tka.kegiatan_id = k.kegiatan_id),
                        (SELECT SUM(ta.jumlah_diusulkan) FROM t_kak_anggaran ta WHERE ta.kak_id = t.kak_id),
                        0
                    ) as total_anggaran_disetujui,
                    (SELECT COALESCE(SUM(pd.jumlah_dicairkan), 0) FROM t_pencairan_dana pd WHERE pd.kegiatan_id = k.kegiatan_id) as dana_dicairkan
                FROM {$this->table} k
                JOIN t_kak t ON k.kak_id = t.kak_id
                WHERE k.{$this->primaryKey} = ?";

        return $this->query($sql, [$id])->fetch(PDO::FETCH_ASSOC);
    }

    public function updateStatus($kegiatanId, $statusId)
    {
        $sql = 'UPDATE t_kak SET status_id = ? WHERE kak_id = (SELECT kak_id FROM t_kegiatan WHERE kegiatan_id = ?)';

        return $this->query($sql, [$statusId, $kegiatanId]);
    }

    public function getStatistics($userId)
    {
        $sql = 'CALL sp_get_kak_statistics(?)';
        $params = [$userId];

        return $this->query($sql, $params)->fetch(PDO::FETCH_ASSOC);
    }

    public function getLpjWithFilters(array $filters)
    {
        $params = [];
        $sql = "SELECT
                    k.kegiatan_id,
                    t.nama_kegiatan,
                    u.nama_lengkap as pengusul_nama,
                    k.tgl_batas_lpj,
                    CASE
                        WHEN k.lpj_submitted_at IS NULL THEN 'Menunggu Penyerahan'
                        WHEN lpj_digital_approval.status = 'Aktif' THEN 'Diajukan'
                        WHEN lpj_digital_approval.status = 'Revisi' THEN 'Direvisi'
                        WHEN lpj_fisik_approval.status = 'Revisi' THEN 'Direvisi'
                        WHEN lpj_digital_approval.status = 'Disetujui' AND lpj_fisik_approval.status = 'Aktif' THEN 'Setor Fisik'
                        WHEN lpj_digital_approval.status = 'Disetujui' AND lpj_fisik_approval.status = 'Disetujui' THEN 'Selesai'
                        ELSE 'Diajukan' -- If submitted but no other case matches, it's most likely in review.
                    END as status_lpj,
                    CASE
                        WHEN k.tgl_batas_lpj IS NOT NULL AND k.lpj_submitted_at IS NULL AND k.tgl_batas_lpj < NOW() THEN 'Terlambat'
                        ELSE 'Tepat Waktu'
                    END as status_ketepatan
                FROM t_kegiatan k
                JOIN t_kak t ON k.kak_id = t.kak_id
                JOIN m_users u ON t.pengusul_user_id = u.user_id
                JOIN m_kegiatan_status ks ON t.status_id = ks.status_id
                LEFT JOIN t_kegiatan_approval lpj_digital_approval ON k.kegiatan_id = lpj_digital_approval.kegiatan_id AND lpj_digital_approval.approval_level = 'Bendahara-LPJ'
                LEFT JOIN t_kegiatan_approval lpj_fisik_approval ON k.kegiatan_id = lpj_fisik_approval.kegiatan_id AND lpj_fisik_approval.approval_level = 'Bendahara-Setor'
                WHERE k.tgl_batas_lpj IS NOT NULL
                  AND (
                      lpj_digital_approval.status IN ('Aktif', 'Revisi', 'Disetujui') 
                      OR lpj_fisik_approval.status IN ('Aktif', 'Revisi', 'Disetujui')
                  )";

        if (! empty($filters['search'])) {
            $sql .= ' AND t.nama_kegiatan LIKE ?';
            $params[] = '%'.$filters['search'].'%';
        }
        if (! empty($filters['unit_pengusul'])) {
            $sql .= ' AND t.pengusul_user_id = ?';
            $params[] = $filters['unit_pengusul'];
        }

        $countSql = "SELECT COUNT(*) FROM ({$sql}) as count_table";
        $totalRecords = $this->query($countSql, $params)->fetchColumn();

        $page = $filters['page'] ?? 1;
        $perPage = $filters['per_page'] ?? 10;
        $offset = ($page - 1) * $perPage;

        $sql .= ' ORDER BY k.tgl_batas_lpj DESC LIMIT ? OFFSET ?';

        $finalParams = array_merge($params, [$perPage, $offset]);

        $data = $this->query($sql, $finalParams)->fetchAll(PDO::FETCH_ASSOC);

        return [
            'data' => $data,
            'pagination' => [
                'total' => (int) $totalRecords,
                'per_page' => $perPage,
                'current_page' => $page,
                'last_page' => ceil($totalRecords / $perPage),
            ],
        ];
    }

    // ... sisa metode lainnya tetap sama

    public function findCurrentApproval(int $kegiatanId): ?array
    {
        $sql = "SELECT * FROM t_kegiatan_approval 
                WHERE kegiatan_id = :kegiatan_id AND status = 'Aktif'
                LIMIT 1";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['kegiatan_id' => $kegiatanId]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        return $result ?: null;
    }

    public function updateApprovalStatus(int $approvalId, string $status, ?int $userId, ?string $catatan): bool
    {
        $sql = 'UPDATE t_kegiatan_approval 
                SET status = :status, approver_user_id = :user_id, catatan = :catatan, updated_at = NOW()
                WHERE approval_kegiatan_id = :approval_id';

        $stmt = $this->db->prepare($sql);

        return $stmt->execute([
            'status' => $status,
            'user_id' => $userId,
            'catatan' => $catatan,
            'approval_id' => $approvalId,
        ]);
    }

    public function findNextApproval(int $kegiatanId, int $currentApprovalId): ?array
    {
        $sql = 'SELECT * FROM t_kegiatan_approval
                WHERE kegiatan_id = :kegiatan_id 
                AND approval_kegiatan_id > :current_approval_id
                ORDER BY approval_kegiatan_id ASC
                LIMIT 1';

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'kegiatan_id' => $kegiatanId,
            'current_approval_id' => $currentApprovalId,
        ]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        return $result ?: null;
    }

    public function updateApproval(int $kegiatanId, array $data): bool
    {
        $sql = 'INSERT INTO t_kegiatan_approval (kegiatan_id, approval_level, approver_user_id, status, catatan)
                VALUES (:kegiatan_id, :approval_level, :approver_user_id, :status, :catatan)';

        $stmt = $this->db->prepare($sql);

        return $stmt->execute([
            'kegiatan_id' => $kegiatanId,
            'approval_level' => $data['approval_level'],
            'approver_user_id' => $data['approver_user_id'],
            'status' => $data['status'],
            'catatan' => $data['catatan'],
        ]);
    }

    public function activateLpjApproval(int $kegiatanId): bool
    {
        $sql = "UPDATE t_kegiatan_approval 
                SET status = 'Aktif', updated_at = NOW()
                WHERE kegiatan_id = :kegiatan_id 
                AND approval_level = 'Bendahara-LPJ'";

        $stmt = $this->db->prepare($sql);

        return $stmt->execute(['kegiatan_id' => $kegiatanId]);
    }

    /**
     * Get overdue activities for PPK approval.
     * Overdue is defined as:
     * - approval_level is 'PPK'
     * - status is 'Aktif'
     * - updated_at is older than 3 days ago
     *
     * @return array A list of overdue kegiatan with their IDs and names.
     */
    public function getOverdueKegiatanForPpk(): array
    {
        $sql = "SELECT 
                    ka.kegiatan_id,
                    tkak.nama_kegiatan,
                    ka.updated_at,
                    DATEDIFF(NOW(), ka.updated_at) AS overdue_days
                FROM t_kegiatan_approval ka
                JOIN t_kegiatan tk ON ka.kegiatan_id = tk.kegiatan_id
                JOIN t_kak tkak ON tk.kak_id = tkak.kak_id
                WHERE ka.approval_level = 'PPK'
                AND ka.status = 'Aktif'
                AND ka.updated_at < NOW() - INTERVAL 3 DAY";

        return $this->query($sql)->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Get overdue activities for Wadir approval.
     * Overdue is defined as:
     * - approval_level is 'Wadir2'
     * - status is 'Aktif'
     * - updated_at is older than 3 days ago
     *
     * @return array A list of overdue kegiatan with their IDs, names, and overdue days.
     */
    public function getOverdueKegiatanForWadir(): array
    {
        $sql = "SELECT 
                    ka.kegiatan_id,
                    tkak.nama_kegiatan,
                    ka.updated_at,
                    DATEDIFF(NOW(), ka.updated_at) AS overdue_days
                FROM t_kegiatan_approval ka
                JOIN t_kegiatan tk ON ka.kegiatan_id = tk.kegiatan_id
                JOIN t_kak tkak ON tk.kak_id = tkak.kak_id
                WHERE ka.approval_level = 'Wadir2'
                AND ka.status = 'Aktif'
                AND ka.updated_at < NOW() - INTERVAL 3 DAY";

        return $this->query($sql)->fetchAll(PDO::FETCH_ASSOC);
    }
}

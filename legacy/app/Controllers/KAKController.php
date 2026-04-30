<?php

namespace App\Controllers;

use App\Core\Database;
use App\Core\JWT;
use App\Core\PDF;
use App\Core\Response;
use App\Middlewares\AuthMiddleware;
use App\Models\Iku;
use App\Models\KAK;
use App\Models\Notifikasi;
use App\Models\Role;
use App\Models\User;
use App\Services\MailService;
use App\Validators\KAKValidator;

class KAKController
{
    private $db;

    private $kakModel;

    private $notifikasiModel;

    private $userModel;

    private $roleModel;

    private $ikuModel;

    private $userData;

    private $mailService;

    public function __construct()
    {
        $this->db = Database::getInstance();
        $this->kakModel = new KAK;
        $this->notifikasiModel = new Notifikasi;
        $this->userModel = new User;
        $this->roleModel = new Role;
        $this->ikuModel = new Iku;
        $this->mailService = new MailService;

        // Don't require auth in constructor - let individual methods handle it
        // This allows download/preview to authenticate via query parameter
        try {
            $this->userData = AuthMiddleware::getAuthUser();
        } catch (\Exception $e) {
            // Auth will be checked in individual methods if needed
            $this->userData = null;
        }
    }

    public function getRefKategoriBelanja()
    {
        try {
            // Mengambil data kategori yang aktif dan diurutkan sesuai kolom 'urutan'
            $this->db->query('SELECT * FROM m_kategori_belanja WHERE is_active = 1 ORDER BY urutan ASC');
            $rows = $this->db->resultSet();

            Response::success($rows);
        } catch (\PDOException $e) {
            Response::error($e->getMessage());
        }
    }

    /**
     * Generate temporary download token (1 minute expiry)
     * POST /api/kak/{id}/generate-download-token
     */
    public function generateDownloadToken()
    {
        try {
            // Require authentication via middleware
            if (! $this->userData) {
                Response::error('Unauthorized', 401);

                return;
            }

            $uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
            preg_match('/\/kak\/(\d+)\/generate-download-token$/', $uri, $matches);
            $kakId = $matches[1] ?? null;

            if (! $kakId) {
                Response::error('KAK ID tidak valid.', 400);

                return;
            }

            // Verify KAK exists and user has access
            $kakData = $this->kakModel->getDataForKAK($kakId);
            if (! $kakData) {
                Response::notFound('Data KAK tidak ditemukan.');

                return;
            }

            // Generate random token (32 bytes = 64 hex characters)
            $tempToken = bin2hex(random_bytes(32));

            // Store in cache directory with 1 minute expiry
            $cacheDir = __DIR__.'/../../cache/download_tokens';
            if (! is_dir($cacheDir)) {
                if (! mkdir($cacheDir, 0755, true)) {
                    Response::error('Gagal membuat direktori cache.', 500);

                    return;
                }
            }

            $tokenData = [
                'kak_id' => (int) $kakId,
                'user_id' => (int) $this->userData['user_id'],
                'expires_at' => time() + 60, // 1 minute
                'created_at' => time(),
            ];

            $tokenFile = $cacheDir.'/'.$tempToken.'.json';
            $result = file_put_contents($tokenFile, json_encode($tokenData));

            if ($result === false) {
                Response::error('Gagal menyimpan token.', 500);

                return;
            }

            Response::success([
                'download_token' => $tempToken,
                'expires_in' => 60, // seconds
            ]);

        } catch (\Exception $e) {
            Response::error('Terjadi kesalahan: '.$e->getMessage(), 500);
        }
    }

    public function download()
    {
        try {
            // Get temporary download token from query parameter
            $tempToken = $_GET['t'] ?? null;

            if (! $tempToken) {
                Response::error('Token download tidak ditemukan.', 401);

                return;
            }

            // Validate temporary token
            $cacheDir = __DIR__.'/../../cache/download_tokens';
            $tokenFile = $cacheDir.'/'.$tempToken.'.json';

            if (! file_exists($tokenFile)) {
                Response::error('Token download tidak valid atau sudah kadaluarsa.', 401);

                return;
            }

            $tokenData = json_decode(file_get_contents($tokenFile), true);

            if (! $tokenData) {
                Response::error('Token data tidak valid.', 401);

                return;
            }

            // Check expiry
            if ($tokenData['expires_at'] < time()) {
                // Delete expired token
                @unlink($tokenFile);
                Response::error('Token download sudah kadaluarsa. Silakan generate ulang.', 401);

                return;
            }

            // Token valid, get KAK ID
            $kakId = $tokenData['kak_id'];

            // Delete token after use (one-time use)
            @unlink($tokenFile);

            // Get KAK data
            $kakData = $this->kakModel->getDataForKAK($kakId);

            if (! $kakData) {
                Response::notFound('Data KAK tidak ditemukan.');

                return;
            }

            // DEBUG: Log KAK data structure
            error_log('=== DEBUG KAK DOWNLOAD ===');
            error_log('KAK ID: '.$kakId);
            error_log('Nama Kegiatan: '.($kakData['nama_kegiatan'] ?? 'N/A'));
            error_log('Jumlah Anggaran: '.count($kakData['anggaran'] ?? []));
            if (! empty($kakData['anggaran'])) {
                error_log('Sample Anggaran Item: '.json_encode($kakData['anggaran'][0]));
            }
            error_log('Jumlah Manfaat: '.count($kakData['manfaat'] ?? []));
            error_log('Jumlah Target: '.count($kakData['target'] ?? []));
            error_log('=========================');

            // Generate and download PDF
            $html = $this->generateKAKHTML($kakData);
            $filename = $this->generateFilename($kakData);
            PDF::download($html, $filename);

        } catch (\Exception $e) {
            Response::error('Terjadi kesalahan: '.$e->getMessage(), 500);
        }
    }

    public function preview()
    {
        // Check temporary token from query parameter (same as download)
        $tempToken = $_GET['t'] ?? null;

        if ($tempToken) {
            // Validate temporary token
            $tokenFile = __DIR__."/../../cache/download_tokens/{$tempToken}.json";

            if (! file_exists($tokenFile)) {
                Response::error('Token tidak valid atau sudah kadaluarsa.', 401);

                return;
            }

            $tokenData = json_decode(file_get_contents($tokenFile), true);

            // Check if token expired (60 seconds)
            if ($tokenData['expires_at'] < time()) {
                unlink($tokenFile); // Delete expired token
                Response::error('Token sudah kadaluarsa.', 401);

                return;
            }

            // Token is valid, but DON'T delete it (so user can download after preview)
            // The token will expire after 60 seconds automatically

            // Extract kak_id from token data
            $kakId = $tokenData['kak_id'];

        } else {
            // Fallback to JWT token for backward compatibility
            $token = $_GET['token'] ?? null;

            if ($token) {
                // Validate JWT token manually from query parameter
                $jwt = new JWT;
                $payload = $jwt->decode($token);

                if ($payload === null) {
                    Response::error('Token tidak valid atau sudah kadaluarsa.', 401);

                    return;
                }

                // Token valid, set userData for potential use
                $this->userData = (array) $payload;

            } elseif (! $this->userData) {
                // No token from query param and no auth from header
                Response::error('Token tidak ditemukan. Silakan login terlebih dahulu.', 401);

                return;
            }

            // Extract kak_id from URI
            $uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
            preg_match('/\/kak\/(\d+)\/preview$/', $uri, $matches);
            $kakId = $matches[1] ?? null;
        }

        if (! $kakId) {
            Response::error('KAK ID tidak valid.', 400);

            return;
        }

        $kakData = $this->kakModel->getDataForKAK($kakId);

        if (! $kakData) {
            Response::notFound('Data KAK tidak ditemukan.');

            return;
        }

        $html = $this->generateKAKHTML($kakData);
        $filename = $this->generateFilename($kakData);

        // Use PDF::preview to render the PDF inline
        PDF::preview($html, $filename);
    }

    private function generateFilename($kakData)
    {
        $namaKegiatan = preg_replace('/[^a-zA-Z0-9\s]/', '', $kakData['nama_kegiatan']);
        $namaKegiatan = substr($namaKegiatan, 0, 50);
        $namaKegiatan = str_replace(' ', '-', $namaKegiatan);
        $date = date('Ymd');

        return "KAK-{$namaKegiatan}-{$date}.pdf";
    }

    private function generateKAKHTML($kakData)
    {
        $kegiatan = $kakData;
        ob_start();
        include __DIR__.'/../Views/pdf/kak-template.php';
        $html = ob_get_clean();

        return $html;
    }

    public function getData()
    {
        $uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        preg_match('/\/kak\/(\d+)\/data$/', $uri, $matches);
        $kakId = $matches[1] ?? null;

        if (! $kakId) {
            Response::error('KAK ID tidak valid.', 400);
        }

        $kakData = $this->kakModel->getDataForKAK($kakId);

        if (! $kakData) {
            Response::notFound('Data KAK tidak ditemukan.');
        }

        Response::success($kakData, 'Data KAK berhasil diambil.');
    }

    public function index()
    {
        try {
            $status = $_GET['status'] ?? null;
            $pengusulUserId = $_GET['pengusul_user_id'] ?? null;
            $search = $_GET['search'] ?? null;

            $sql = '
                SELECT 
                    t.*, 
                    u.nama_lengkap AS pengusul_nama,
                    s.nama_status,
                    COALESCE((
                        SELECT SUM(
                            (CASE WHEN COALESCE(a.volume1,0)=0 THEN 1 ELSE a.volume1 END)
                            *
                            (CASE WHEN COALESCE(a.volume2,0)=0 THEN 1 ELSE a.volume2 END)
                            * harga_satuan
                        ) FROM t_kak_anggaran a WHERE a.kak_id = t.kak_id
                    ),0) AS total_diusulkan
                FROM t_kak t
                LEFT JOIN m_users u ON u.user_id = t.pengusul_user_id
                LEFT JOIN m_kegiatan_status s ON s.status_id = t.status_id
                WHERE 1=1
            ';

            $params = [];

            if ($status) {
                $status_ids = explode(',', $status);
                // Use named placeholders for status (e.g., :status0, :status1)
                $status_placeholders = [];
                foreach ($status_ids as $k => $id) {
                    $key = ":status{$k}";
                    $status_placeholders[] = $key;
                    $params[$key] = $id;
                }
                $sql .= ' AND t.status_id IN ('.implode(',', $status_placeholders).')';
            }

            if ($pengusulUserId) {
                $sql .= ' AND t.pengusul_user_id = :pengusul_user_id';
                $params[':pengusul_user_id'] = $pengusulUserId;
            }

            if ($search) {
                $sql .= ' AND t.nama_kegiatan LIKE :search';
                $params[':search'] = "%{$search}%";
            }

            $sql .= ' ORDER BY t.kak_id DESC';

            $this->db->query($sql);

            foreach ($params as $key => $val) {
                $this->db->bind($key, $val);
            }

            $rows = $this->db->resultSet();

            Response::success($rows);
        } catch (\PDOException $e) {
            Response::error('Gagal mengambil data KAK: '.$e->getMessage());
        }
    }

    public function show($id)
    {
        try {
            $this->db->query('SELECT * FROM t_kak WHERE kak_id = :id');
            $this->db->bind(':id', $id);
            $kak = $this->db->single();

            if (! $kak) {
                Response::notFound('KAK tidak ditemukan.');
            }

            $childTables = [
                'manfaat' => 'SELECT * FROM t_kak_manfaat WHERE kak_id=:id',
                'tahapan' => 'SELECT * FROM t_kak_tahapan WHERE kak_id=:id ORDER BY urutan ASC',
                'indikator' => 'SELECT * FROM t_kak_indikator WHERE kak_id=:id',
                'target' => 'SELECT * FROM t_kak_target WHERE kak_id=:id',
                'iku' => 'SELECT tki.*, mi.kode_iku, mi.nama_iku, ms.nama_satuan 
                                                FROM t_kak_iku tki 
                                                LEFT JOIN m_iku mi ON tki.iku_id = mi.iku_id 
                                                LEFT JOIN m_satuan ms ON tki.satuan_id = ms.satuan_id
                                                WHERE tki.kak_id = :id',
                'anggaran' => '
                                SELECT 
                                    a.*, 
                                    s.nama_satuan,
                                    kb.nama AS nama_kategori_belanja,
                                    kb.kode AS kode_kategori
                                FROM t_kak_anggaran a
                                LEFT JOIN m_satuan s ON a.satuan_id = s.satuan_id
                                LEFT JOIN m_kategori_belanja kb ON kb.kategori_belanja_id = a.kategori_belanja_id
                                WHERE a.kak_id=:id
                            ',
            ];
            $data = [
                'kak' => $kak,
            ];

            foreach ($childTables as $key => $sql) {
                $this->db->query($sql);
                $this->db->bind(':id', $id);
                $data[$key] = $this->db->resultSet();
            }

            $totalDiajukan = 0;
            if (! empty($data['anggaran'])) {
                foreach ($data['anggaran'] as $item) {
                    $totalDiajukan += floatval($item['jumlah_diusulkan'] ?? 0);
                }
            }

            $data['kak']['total_diajukan'] = $totalDiajukan;

            $this->db->query('
                SELECT l.*, 
                s1.nama_status AS status_lama,
                s2.nama_status AS status_baru
                FROM t_kak_log_status l
                LEFT JOIN m_kegiatan_status s1 ON s1.status_id = l.status_id_lama
                LEFT JOIN m_kegiatan_status s2 ON s2.status_id = l.status_id_baru
                WHERE l.kak_id = :id
                ORDER BY l.timestamp ASC
            ');
            $this->db->bind(':id', $id);
            $data['log_status'] = $this->db->resultSet();

            $this->db->query('
                SELECT a.*, u.nama_lengkap AS approver_nama
                FROM t_kak_approval a
                LEFT JOIN m_users u ON u.user_id = a.approver_user_id
                WHERE a.kak_id = :id
            ');
            $this->db->bind(':id', $id);
            $data['approval'] = $this->db->resultSet();

            Response::success($data, 'Detail KAK berhasil diambil.');
        } catch (\PDOException $e) {
            Response::error('Gagal mengambil detail KAK: '.$e->getMessage(), 500);
        }
    }

    public function store()
    {
        ini_set('display_errors', 1);
        error_reporting(E_ALL);

        file_put_contents('debug_store.log', "STORE HIT\n", FILE_APPEND);
        file_put_contents('debug_store.log', print_r($_POST, true), FILE_APPEND);
        file_put_contents('debug_store.log', file_get_contents('php://input')."\n\n", FILE_APPEND);

        try {
            if (! $this->userData) {
                Response::unauthorized();
            }
            $pengusul = $this->userData['user_id'];

            $input = json_decode(file_get_contents('php://input'), true);
            if (! $input || ! isset($input['kak'])) {
                Response::badRequest('Format JSON tidak valid');
            }

            $validator = new KAKValidator;
            if (! $validator->validateKAKData($input)) {
                Response::validationError($validator->getErrors());
            }

            $k = $input['kak'];

            $this->db->beginTransaction();

            $sql = '
                INSERT INTO t_kak 
                (nama_kegiatan, tipe_kegiatan_id, deskripsi_kegiatan, sasaran_utama, catatan_sasaran_utama, metode_pelaksanaan, kurun_waktu_pelaksanaan,
                tanggal_mulai, tanggal_selesai, lokasi, pengusul_user_id, status_id)
                VALUES 
                (:nama, :tipe, :desk, :sasaran, :catatan_sasaran, :metode, :kurun, :mulai, :selesai, :lokasi, :user, 1)
            ';

            $this->db->query($sql);
            $this->db->bind(':nama', $k['nama_kegiatan']);
            $this->db->bind(':tipe', $k['tipe_kegiatan_id']);
            $this->db->bind(':desk', $k['deskripsi_kegiatan']);
            $this->db->bind(':sasaran', $k['sasaran_utama']);
            $this->db->bind(':catatan_sasaran', $k['catatan_sasaran_utama'] ?? null);
            $this->db->bind(':metode', $k['metode_pelaksanaan']);
            $this->db->bind(':kurun', $k['kurun_waktu_pelaksanaan']);
            $this->db->bind(':mulai', $k['tanggal_mulai']);
            $this->db->bind(':selesai', $k['tanggal_selesai']);
            $this->db->bind(':lokasi', $k['lokasi']);
            $this->db->bind(':user', $pengusul);
            $this->db->execute();

            $id = $this->db->lastInsertId();

            if (! empty($k['manfaat'])) {
                foreach ($k['manfaat'] as $m) {
                    $this->db->query('
                        INSERT INTO t_kak_manfaat
                        (kak_id, manfaat)
                        VALUES (:id, :m)
                    ');
                    $this->db->bind(':id', $id);
                    $this->db->bind(':m', $m); // Assuming $m is now just a string
                    $this->db->execute();
                }
            }

            if (! empty($k['tahapan_pelaksanaan'])) {
                foreach ($k['tahapan_pelaksanaan'] as $t) {
                    $this->db->query('
                        INSERT INTO t_kak_tahapan
                        (kak_id, nama_tahapan, urutan)
                        VALUES (:id, :nama, :urut)
                    ');
                    $this->db->bind(':id', $id);
                    $this->db->bind(':nama', $t['nama_tahapan']);
                    $this->db->bind(':urut', $t['urutan']);
                    $this->db->execute();
                }
            }

            if (! empty($k['indikator_kinerja'])) {
                foreach ($k['indikator_kinerja'] as $i) {
                    $persen = isset($i['persentase_target']) && $i['persentase_target'] !== '' ? $i['persentase_target'] : null;

                    $this->db->query('
                        INSERT INTO t_kak_target
                        (kak_id, bulan_indikator, deskripsi_target, persentase_target)
                        VALUES (:id, :bulan, :desk, :p)
                    ');
                    $this->db->bind(':id', $id);
                    $this->db->bind(':bulan', $i['bulan_indikator']);
                    $this->db->bind(':desk', $i['deskripsi_target']);
                    $this->db->bind(':p', $persen);
                    $this->db->execute();
                }
            }

            if (! empty($input['target_iku'])) {
                $processedIkus = [];
                foreach ($input['target_iku'] as $iku) {
                    if (! isset($iku['iku_id'])) {
                        $this->db->rollBack();
                        Response::badRequest('IKU ID tidak boleh kosong dalam target_iku.');
                    }

                    // Prevent duplicate IKU
                    if (in_array($iku['iku_id'], $processedIkus)) {
                        continue;
                    }
                    $processedIkus[] = $iku['iku_id'];

                    $existingIku = $this->ikuModel->find($iku['iku_id']);
                    if (! $existingIku) {
                        $this->db->rollBack();
                        Response::badRequest("IKU dengan ID '{$iku['iku_id']}' tidak ditemukan. Pastikan semua IKU ID valid.");
                    }

                    $target = isset($iku['target']) && $iku['target'] !== '' ? $iku['target'] : 0;
                    // Handle 0 or empty string as NULL for foreign key
                    $satuanId = isset($iku['satuan_id']) && $iku['satuan_id'] !== '' && $iku['satuan_id'] != 0 ? $iku['satuan_id'] : null;

                    $this->db->query('
                        INSERT INTO t_kak_iku
                        (kak_id, iku_id, target, satuan_id)
                        VALUES (:id, :iku, :t, :s)
                    ');
                    $this->db->bind(':id', $id);
                    $this->db->bind(':iku', $iku['iku_id']);
                    $this->db->bind(':t', $target);
                    $this->db->bind(':s', $satuanId);
                    $this->db->execute();
                }
            }

            if (! empty($input['rab'])) {
                foreach ($input['rab'] as $r) {
                    $v1 = isset($r['volume1']) && $r['volume1'] !== '' ? (float) $r['volume1'] : null;
                    $v2 = isset($r['volume2']) && $r['volume2'] !== '' ? (float) $r['volume2'] : null;
                    $v3 = isset($r['volume3']) && $r['volume3'] !== '' ? (float) $r['volume3'] : null;

                    $s1 = isset($r['satuan1_id']) && $r['satuan1_id'] !== '' && $r['satuan1_id'] != 0 ? $r['satuan1_id'] : null;
                    $s2 = isset($r['satuan2_id']) && $r['satuan2_id'] !== '' && $r['satuan2_id'] != 0 ? $r['satuan2_id'] : null;
                    $s3 = isset($r['satuan3_id']) && $r['satuan3_id'] !== '' && $r['satuan3_id'] != 0 ? $r['satuan3_id'] : null;

                    $harga = (float) ($r['harga_satuan'] ?? 0);
                    $jumlah = ($v1 ?? 1) * ($v2 ?? 1) * ($v3 ?? 1) * $harga;

                    $this->db->query('
                        INSERT INTO t_kak_anggaran
                        (kak_id, uraian, volume1, satuan1_id, volume2, satuan2_id, volume3, satuan3_id, harga_satuan, jumlah_diusulkan, kategori_belanja_id, catatan_verifikator)
                        VALUES (:id, :u, :v1, :s1, :v2, :s2, :v3, :s3, :h, :j, :kat, NULL)
                    ');
                    $this->db->bind(':id', $id);
                    $this->db->bind(':u', $r['uraian']);
                    $this->db->bind(':v1', $v1);
                    $this->db->bind(':s1', $s1);
                    $this->db->bind(':v2', $v2);
                    $this->db->bind(':s2', $s2);
                    $this->db->bind(':v3', $v3);
                    $this->db->bind(':s3', $s3);
                    $this->db->bind(':h', $harga);
                    $this->db->bind(':j', $jumlah);
                    $this->db->bind(':kat', $r['kategori_belanja_id']);
                    $this->db->execute();
                }
            }

            $this->db->commit();

            Response::created(['kak_id' => $id], 'Draft KAK berhasil dibuat.');
        } catch (\Exception $e) { // Catch general Exception
            if ($this->db->inTransaction()) {
                $this->db->rollBack();
            }
            // Log the detailed error message for debugging purposes (not directly sent to client)
            error_log('Gagal membuat draft KAK: '.$e->getMessage());
            Response::serverError('Gagal membuat draft KAK. Silakan coba lagi nanti.'); // Generic message for client
        }
    }

    public function update($id)
    {
        file_put_contents('debug_update.log', "UPDATE HIT for ID: $id\n", FILE_APPEND);
        try {
            if (! $this->userData) {
                Response::unauthorized();
            }
            $pengusul = $this->userData['user_id'];

            // Check if KAK exists and belongs to user
            $this->db->query('SELECT * FROM t_kak WHERE kak_id = :id AND pengusul_user_id = :user');
            $this->db->bind(':id', $id);
            $this->db->bind(':user', $pengusul);
            $existingKak = $this->db->single();

            if (! $existingKak) {
                Response::notFound('KAK tidak ditemukan atau Anda tidak memiliki akses.');
            }

            // Only allow update if status is Draft (1), Ditolak (4), or Revisi (5)
            if (! in_array($existingKak['status_id'], [1, 4, 5])) {
                Response::error('KAK hanya dapat diupdate jika statusnya Draft, Ditolak, atau Revisi.', 400);
            }

            $rawInput = file_get_contents('php://input');
            file_put_contents('debug_update.log', 'Raw Input: '.$rawInput."\n", FILE_APPEND);
            $input = json_decode($rawInput, true);

            if (! $input || ! isset($input['kak'])) {
                Response::badRequest('Format JSON tidak valid');
            }

            $validator = new KAKValidator;
            if (! $validator->validateKAKData($input)) {
                file_put_contents('debug_update.log', 'Validation Error: '.json_encode($validator->getErrors())."\n", FILE_APPEND);
                Response::validationError($validator->getErrors());
            }

            $k = $input['kak'];

            $this->db->beginTransaction();

            // Update main KAK table
            $sql = '
                UPDATE t_kak 
                SET nama_kegiatan = :nama,
                    tipe_kegiatan_id = :tipe,
                    deskripsi_kegiatan = :desk,
                    sasaran_utama = :sasaran,
                    catatan_sasaran_utama = :catatan_sasaran,
                    metode_pelaksanaan = :metode,
                    kurun_waktu_pelaksanaan = :kurun,
                    tanggal_mulai = :mulai,
                    tanggal_selesai = :selesai,
                    lokasi = :lokasi,
                    updated_at = NOW()
                WHERE kak_id = :id
            ';

            $this->db->query($sql);
            $this->db->bind(':nama', $k['nama_kegiatan']);
            $this->db->bind(':tipe', $k['tipe_kegiatan_id']);
            $this->db->bind(':desk', $k['deskripsi_kegiatan']);
            $this->db->bind(':sasaran', $k['sasaran_utama']);
            $this->db->bind(':catatan_sasaran', $k['catatan_sasaran_utama'] ?? null);
            $this->db->bind(':metode', $k['metode_pelaksanaan']);
            $this->db->bind(':kurun', $k['kurun_waktu_pelaksanaan']);
            $this->db->bind(':mulai', $k['tanggal_mulai']);
            $this->db->bind(':selesai', $k['tanggal_selesai']);
            $this->db->bind(':lokasi', $k['lokasi']);
            $this->db->bind(':id', $id);
            $this->db->execute();

            // Delete and re-insert child records
            $childTables = [
                't_kak_manfaat',
                't_kak_tahapan',
                't_kak_indikator',
                't_kak_iku',
                't_kak_target',
                't_kak_anggaran',
            ];

            foreach ($childTables as $table) {
                $this->db->query("DELETE FROM $table WHERE kak_id = :id");
                $this->db->bind(':id', $id);
                $this->db->execute();
            }

            // Re-insert data
            if (! empty($k['manfaat'])) {
                foreach ($k['manfaat'] as $m) {
                    $this->db->query('INSERT INTO t_kak_manfaat (kak_id, manfaat) VALUES (:id, :m)');
                    $this->db->bind(':id', $id);
                    $this->db->bind(':m', $m);
                    $this->db->execute();
                }
            }

            if (! empty($k['tahapan_pelaksanaan'])) {
                foreach ($k['tahapan_pelaksanaan'] as $t) {
                    $this->db->query('INSERT INTO t_kak_tahapan (kak_id, nama_tahapan, urutan) VALUES (:id, :nama, :urut)');
                    $this->db->bind(':id', $id);
                    $this->db->bind(':nama', $t['nama_tahapan']);
                    $this->db->bind(':urut', $t['urutan']);
                    $this->db->execute();
                }
            }

            if (! empty($k['indikator_kinerja'])) {
                foreach ($k['indikator_kinerja'] as $i) {
                    $persen = isset($i['persentase_target']) && $i['persentase_target'] !== '' ? $i['persentase_target'] : null;

                    $this->db->query('INSERT INTO t_kak_target (kak_id, bulan_indikator, deskripsi_target, persentase_target) VALUES (:id, :bulan, :desk, :p)');
                    $this->db->bind(':id', $id);
                    $this->db->bind(':bulan', $i['bulan_indikator']);
                    $this->db->bind(':desk', $i['deskripsi_target']);
                    $this->db->bind(':p', $persen);
                    $this->db->execute();
                }
            }

            if (! empty($input['target_iku'])) {
                $processedIkus = [];
                foreach ($input['target_iku'] as $iku) {
                    file_put_contents('debug_update.log', 'Processing IKU: '.json_encode($iku)."\n", FILE_APPEND);
                    // Prevent duplicate IKU
                    if (in_array($iku['iku_id'], $processedIkus)) {
                        continue;
                    }
                    $processedIkus[] = $iku['iku_id'];

                    $target = isset($iku['target']) && $iku['target'] !== '' ? $iku['target'] : 0;
                    // Handle 0 or empty string as NULL for foreign key
                    $satuanId = isset($iku['satuan_id']) && $iku['satuan_id'] !== '' && $iku['satuan_id'] != 0 ? $iku['satuan_id'] : null;

                    $this->db->query('INSERT INTO t_kak_iku (kak_id, iku_id, target, satuan_id) VALUES (:id, :iku, :t, :s)');
                    $this->db->bind(':id', $id);
                    $this->db->bind(':iku', $iku['iku_id']);
                    $this->db->bind(':t', $target);
                    $this->db->bind(':s', $satuanId);
                    $this->db->execute();
                }
            }

            if (! empty($input['rab'])) {
                foreach ($input['rab'] as $r) {
                    file_put_contents('debug_update.log', 'Processing RAB Item: '.json_encode($r)."\n", FILE_APPEND);
                    $v1 = isset($r['volume1']) && $r['volume1'] !== '' ? (float) $r['volume1'] : null;
                    $v2 = isset($r['volume2']) && $r['volume2'] !== '' ? (float) $r['volume2'] : null;
                    $v3 = isset($r['volume3']) && $r['volume3'] !== '' ? (float) $r['volume3'] : null;

                    $s1 = isset($r['satuan1_id']) && $r['satuan1_id'] !== '' && $r['satuan1_id'] != 0 ? $r['satuan1_id'] : null;
                    $s2 = isset($r['satuan2_id']) && $r['satuan2_id'] !== '' && $r['satuan2_id'] != 0 ? $r['satuan2_id'] : null;
                    $s3 = isset($r['satuan3_id']) && $r['satuan3_id'] !== '' && $r['satuan3_id'] != 0 ? $r['satuan3_id'] : null;

                    $harga = (float) ($r['harga_satuan'] ?? 0);
                    $jumlah = ($v1 ?? 1) * ($v2 ?? 1) * ($v3 ?? 1) * $harga;

                    $this->db->query('INSERT INTO t_kak_anggaran (kak_id, uraian, volume1, satuan1_id, volume2, satuan2_id, volume3, satuan3_id, harga_satuan, jumlah_diusulkan, kategori_belanja_id, catatan_verifikator) VALUES (:id, :u, :v1, :s1, :v2, :s2, :v3, :s3, :h, :j, :kat, NULL)');
                    $this->db->bind(':id', $id);
                    $this->db->bind(':u', $r['uraian']);
                    $this->db->bind(':v1', $v1);
                    $this->db->bind(':s1', $s1);
                    $this->db->bind(':v2', $v2);
                    $this->db->bind(':s2', $s2);
                    $this->db->bind(':v3', $v3);
                    $this->db->bind(':s3', $s3);
                    $this->db->bind(':h', $harga);
                    $this->db->bind(':j', $jumlah);
                    $this->db->bind(':kat', $r['kategori_belanja_id']);
                    $this->db->execute();
                }
            }

            $this->db->commit();

            Response::success(['kak_id' => $id], 'KAK berhasil diperbarui.');
        } catch (\Exception $e) {
            if ($this->db->inTransaction()) {
                $this->db->rollBack();
            }
            file_put_contents('debug_update.log', 'EXCEPTION: '.$e->getMessage()."\nTrace: ".$e->getTraceAsString()."\n", FILE_APPEND);
            error_log('Gagal memperbarui KAK: '.$e->getMessage());
            Response::serverError('Gagal memperbarui KAK: '.$e->getMessage().' in '.$e->getFile().':'.$e->getLine());
        }
    }

    public function submitForVerification($id)
    {
        try {
            if (! $this->userData) {
                Response::unauthorized();
            }

            $db = $this->db;

            $db->query('SELECT * FROM t_kak WHERE kak_id = :id');
            $db->bind(':id', $id);
            $data = $db->single();

            if (! $data) {
                Response::notFound('Data KAK tidak ditemukan.');
            }

            if ($data['pengusul_user_id'] != $this->userData['user_id']) {
                Response::forbidden('Anda tidak memiliki akses untuk submit KAK ini.');
            }

            if (! in_array($data['status_id'], [1, 5])) {
                Response::error('Hanya KAK berstatus Draft atau Revisi yang bisa disubmit.', 400);
            }

            $db->beginTransaction();

            $db->query('
                UPDATE t_kak SET status_id = 2,
                catatan_nama_kegiatan = NULL,
                catatan_deskripsi_kegiatan = NULL,
                catatan_sasaran_utama = NULL,
                catatan_metode_pelaksanaan = NULL,
                catatan_lokasi = NULL,
                catatan_tanggal = NULL,
                updated_at = NOW()
                WHERE kak_id = :id
            ');
            $db->bind(':id', $id);
            $db->execute();

            $db->query('
                INSERT INTO t_kak_log_status
                (kak_id, status_id_lama, status_id_baru, actor_user_id, catatan, timestamp)
                VALUES (:id, :lama, 2, :user, :ct, NOW())
            ');
            $db->bind(':id', $id);
            $db->bind(':lama', $data['status_id']);
            $db->bind(':user', $this->userData['user_id']);
            $db->bind(':ct', 'Pengusul melakukan submit KAK.');
            $db->execute();

            $db->query("
                INSERT INTO t_kak_approval
                (kak_id, approver_user_id, status, created_at)
                VALUES (:id, NULL, 'Menunggu', NOW())
            ");
            $db->bind(':id', $id);
            $db->execute();

            $db->commit();

            // Notify Verifikator
            $role = $this->roleModel->findByName('Verifikator');
            if ($role) {
                $verifikators = $this->userModel->findByRoleId($role['role_id']);
                foreach ($verifikators as $verifikator) {
                    $this->notifikasiModel->create([
                        'penerima_user_id' => $verifikator['user_id'],
                        'pesan' => "KAK baru \"{$data['nama_kegiatan']}\" telah disubmit dan membutuhkan verifikasi.",
                        'link_tujuan' => '/verifikator/kak/'.$id,
                    ]);
                }
            }

            // Notify Verifikator (Email)
            $pengusulData = $this->userModel->findById($data['pengusul_user_id']);
            $kakDataForEmail = [
                'nama_kegiatan' => $data['nama_kegiatan'],
                'pengusul_nama' => $pengusulData['nama_lengkap'] ?? 'N/A',
            ];
            $this->mailService->notifyKAKSubmitted($id, $kakDataForEmail);

            // Notify Verifikator (Email)
            $pengusulData = $this->userModel->findById($data['pengusul_user_id']);
            $kakDataForEmail = [
                'nama_kegiatan' => $data['nama_kegiatan'],
                'pengusul_nama' => $pengusulData['nama_lengkap'] ?? 'N/A',
            ];
            $this->mailService->notifyKAKSubmitted($id, $kakDataForEmail);

            Response::success(null, 'KAK berhasil disubmit untuk verifikasi.');
        } catch (\Exception $e) {
            if ($this->db->inTransaction()) {
                $this->db->rollBack();
            }
            Response::error('Gagal submit KAK: '.$e->getMessage(), 500);
        }
    }

    public function requestRevision($id)
    {
        try {
            if (! $this->userData) {
                Response::unauthorized();
            }

            $db = $this->db;

            $db->query('SELECT * FROM t_kak WHERE kak_id = :id');
            $db->bind(':id', $id);
            $data = $db->single();

            if (! $data) {
                Response::notFound('Data KAK tidak ditemukan.');
            }

            if (! in_array($data['status_id'], [2, 5])) {
                Response::error("Hanya KAK berstatus 'Dalam Review' atau 'Revisi' yang bisa direvisi.", 400);
            }

            $input = json_decode(file_get_contents('php://input'), true);
            if (! $input) {
                Response::badRequest('Input JSON tidak valid.');
            }

            $catatan = $input['catatan'] ?? '';

            $db->beginTransaction();

            if (! empty($input['catatan_kak'])) {
                foreach ($input['catatan_kak'] as $field => $note) {

                    // FIX: Remap inconsistent frontend field name
                    if ($field === 'gambaran_umum') {
                        $field = 'deskripsi_kegiatan';
                    } elseif ($field === 'kurun_waktu') {
                        $field = 'tanggal';
                    }

                    $col = 'catatan_'.$field;
                    $db->query("UPDATE t_kak SET $col = :n WHERE kak_id=:id");
                    $db->bind(':n', $note);
                    $db->bind(':id', $id);
                    $db->execute();
                }
            }

            if (! empty($input['anak'])) {
                foreach ($input['anak'] as $table => $rows) {
                    $pkMap = [
                        't_kak_manfaat' => 'manfaat_id',
                        't_kak_tahapan' => 'tahapan_id',
                        't_kak_target' => 'target_id',
                        't_kak_anggaran' => 'anggaran_id',
                        't_kak_iku' => 'iku_id',
                    ];

                    if (! isset($pkMap[$table])) {
                        continue;
                    }
                    $pkColumn = $pkMap[$table];

                    foreach ($rows as $r) {
                        $recordId = $r['id'];

                        if ($table === 't_kak_manfaat') {
                            // t_kak_manfaat only has catatan_manfaat now
                            $catatanManfaat = $r['catatan_manfaat'] ?? null;

                            $db->query("
                                UPDATE $table 
                                SET catatan_manfaat = :cm
                                WHERE $pkColumn = :pk
                            ");
                            $db->bind(':cm', $catatanManfaat);
                            $db->bind(':pk', $recordId);
                            $db->execute();
                        } else {
                            // Standard handling for all other tables
                            $db->query("
                                UPDATE $table SET catatan_verifikator = :c 
                                WHERE $pkColumn = :pk AND kak_id = :id
                            ");
                            $db->bind(':c', $r['catatan_verifikator']);
                            $db->bind(':pk', $recordId);
                            $db->bind(':id', $id);
                            $db->execute();
                        }
                    }
                }
            }

            $db->query('UPDATE t_kak SET status_id = 5 WHERE kak_id=:id');
            $db->bind(':id', $id);
            $db->execute();

            $db->query("
                INSERT INTO t_kak_log_status 
                (kak_id, status_id_lama, status_id_baru, actor_user_id, catatan, timestamp)
                VALUES (:id, 2, 5, :usr, 'Diminta revisi oleh verifikator.', NOW())
            ");
            $db->bind(':id', $id);
            $db->bind(':usr', $this->userData['user_id']);
            $db->execute();

            $db->query("
                INSERT INTO t_kak_approval
                (kak_id, approver_user_id, status, catatan, created_at)
                VALUES (:id, :usr, 'Revisi', NULL, NOW())
            ");
            $db->bind(':id', $id);
            $db->bind(':usr', $this->userData['user_id']);
            $db->execute();

            $db->commit();

            // Notify Pengusul
            $this->notifikasiModel->create([
                'penerima_user_id' => $data['pengusul_user_id'],
                'pesan' => "KAK Anda \"{$data['nama_kegiatan']}\" membutuhkan revisi.",
                'link_tujuan' => '/pengusul/kak/'.$id,
            ]);

            $proposer = $this->userModel->findById($data['pengusul_user_id']);
            if ($proposer && ! empty($proposer['email'])) {
                $kakDataForEmail = [
                    'nama_kegiatan' => $data['nama_kegiatan'],
                    'pengusul_nama' => $proposer['nama_lengkap'],
                    'pengusul_email' => $proposer['email'],
                ];
                $this->mailService->notifyKAKRevisionRequested($id, $kakDataForEmail, $catatan);
            }

            Response::success(null, 'KAK berhasil dikembalikan untuk revisi.');
        } catch (\Exception $e) {
            if ($db->inTransaction()) {
                $db->rollBack();
            }
            Response::error('Gagal meminta revisi KAK: '.$e->getMessage(), 500);
        }
    }

    public function resubmitAfterRevision($id)
    {
        try {
            if (! $this->userData) {
                Response::unauthorized();
            }

            $db = $this->db;

            $db->query('SELECT * FROM t_kak WHERE kak_id = :id');
            $db->bind(':id', $id);
            $data = $db->single();

            if (! $data) {
                Response::notFound('Data KAK tidak ditemukan.');
            }

            if ($data['pengusul_user_id'] != $this->userData['user_id']) {
                Response::forbidden('Anda tidak dapat mengedit KAK milik orang lain.');
            }

            if ($data['status_id'] != 5) {
                Response::error('KAK tidak dalam status revisi.', 400);
            }

            $input = json_decode(file_get_contents('php://input'), true);
            if (! $input) {
                Response::badRequest('Input JSON tidak valid.');
            }

            $db->beginTransaction();

            if (! empty($input['kak'])) {
                $allowed = [
                    'nama_kegiatan',
                    'tipe_kegiatan_id',
                    'deskripsi_kegiatan',
                    'sasaran_utama',
                    'metode_pelaksanaan',
                    'kurun_waktu_pelaksanaan',
                    'tanggal_mulai',
                    'tanggal_selesai',
                    'lokasi',
                ];

                foreach ($input['kak'] as $f => $v) {
                    if (! in_array($f, $allowed)) {
                        continue;
                    }

                    $colNote = 'catatan_'.$f;

                    $db->query("
                        UPDATE t_kak 
                        SET $f = :v, $colNote = NULL 
                        WHERE kak_id = :id
                    ");
                    $db->bind(':v', $v);
                    $db->bind(':id', $id);
                    $db->execute();
                }
            }

            if (! empty($input['anak'])) {

                $pkMap = [
                    't_kak_manfaat' => 'manfaat_id',
                    't_kak_tahapan' => 'tahapan_id',
                    't_kak_target' => 'target_id',
                    't_kak_anggaran' => 'anggaran_id',
                    't_kak_iku' => 'iku_id',
                ];

                foreach ($input['anak'] as $table => $rows) {
                    if (! isset($pkMap[$table])) {
                        continue;
                    }

                    $pk = $pkMap[$table];

                    foreach ($rows as $r) {

                        $idChild = $r['id'];
                        unset($r['id']);

                        // Clear catatan fields based on table type
                        if ($table === 't_kak_manfaat') {
                            // Manfaat only has catatan_manfaat
                            $r['catatan_manfaat'] = null;
                        } else {
                            // Other tables use catatan_verifikator
                            $r['catatan_verifikator'] = null;
                        }

                        $setParts = [];
                        foreach ($r as $k => $v) {
                            $setParts[] = "$k = :$k";
                        }
                        $sqlSet = implode(', ', $setParts);

                        $db->query("
                            UPDATE $table
                            SET $sqlSet
                            WHERE $pk = :pk AND kak_id = :tid
                        ");

                        $params = array_merge($r, [
                            'pk' => $idChild,
                            'tid' => $id,
                        ]);

                        foreach ($params as $key => $val) {
                            $db->bind(':'.$key, $val);
                        }

                        $db->execute();
                    }
                }
            }

            $db->query('UPDATE t_kak SET status_id = 2 WHERE kak_id=:id');
            $db->bind(':id', $id);
            $db->execute();

            $db->query("
                INSERT INTO t_kak_log_status
                (kak_id, status_id_lama, status_id_baru, actor_user_id, catatan, timestamp)
                VALUES (:id, 5, 2, :usr, 'Resubmit setelah revisi.', NOW())
            ");
            $db->bind(':id', $id);
            $db->bind(':usr', $this->userData['user_id']);
            $db->execute();

            $db->query("
                INSERT INTO t_kak_approval
                (kak_id, approver_user_id, status, created_at)
                VALUES (:id, :usr, 'Menunggu', NOW())
            ");
            $db->bind(':id', $id);
            $db->bind(':usr', $this->userData['user_id']);
            $db->execute();

            $db->commit();

            Response::success(null, 'KAK berhasil di-resubmit setelah revisi.');
        } catch (\Exception $e) {
            if ($this->db->inTransaction()) {
                $this->db->rollBack();
            }
            Response::error('Gagal resubmit KAK: '.$e->getMessage(), 500);
        }
    }

    public function approve($id)
    {
        try {
            if (! $this->userData) {
                Response::unauthorized();
            }

            $db = $this->db;

            $db->query('SELECT * FROM t_kak WHERE kak_id = :id');
            $db->bind(':id', $id);
            $data = $db->single();

            if (! $data) {
                Response::notFound('Data KAK tidak ditemukan.');
            }

            if ($data['status_id'] != 2) {
                Response::error("Hanya KAK berstatus 'Dalam Review' yang bisa disetujui.", 400);
            }

            if ($data['pengusul_user_id'] == $this->userData['user_id']) {
                Response::forbidden('Pengusul tidak dapat menyetujui KAK sendiri.');
            }

            $input = json_decode(file_get_contents('php://input'), true);
            $kodeAnggaran = $input['kode_anggaran'] ?? null;
            // Handle optional fields: convert empty strings to null
            $namaSumberDana = isset($input['nama_sumber_dana']) && $input['nama_sumber_dana'] !== '' ? $input['nama_sumber_dana'] : null;
            $tahunAnggaran = isset($input['tahun_anggaran']) && $input['tahun_anggaran'] !== '' ? $input['tahun_anggaran'] : null;
            $totalPagu = isset($input['total_pagu']) && $input['total_pagu'] !== '' ? $input['total_pagu'] : null;

            // Validasi: Kode Anggaran (MAK) wajib diisi
            if (empty($kodeAnggaran)) {
                Response::badRequest('Kode Anggaran (MAK) wajib diisi.');
            }

            $db->beginTransaction();

            $makId = null;

            if (! empty($kodeAnggaran)) {
                // Handle Mata Anggaran (Check existing or Create new)
                $db->query('SELECT mata_anggaran_id FROM m_mata_anggaran WHERE kode_anggaran = :kode');
                $db->bind(':kode', $kodeAnggaran);
                $existingMak = $db->single();

                if ($existingMak) {
                    $makId = $existingMak['mata_anggaran_id'];
                } else {
                    // Create new Mata Anggaran with provided values
                    $db->query('INSERT INTO m_mata_anggaran (kode_anggaran, nama_sumber_dana, tahun_anggaran, total_pagu) VALUES (:kode, :sumber, :tahun, :pagu)');
                    $db->bind(':kode', $kodeAnggaran);
                    $db->bind(':sumber', $namaSumberDana);
                    $db->bind(':tahun', $tahunAnggaran);
                    $db->bind(':pagu', $totalPagu);
                    $db->execute();
                    $makId = $db->lastInsertId();
                }
            }

            // Update KAK status and link to Mata Anggaran
            $db->query('UPDATE t_kak SET status_id = 3, mata_anggaran_id = :makId WHERE kak_id=:id');
            $db->bind(':makId', $makId);
            $db->bind(':id', $id);
            $db->execute();

            $db->query("
                INSERT INTO t_kak_log_status
                (kak_id, status_id_lama, status_id_baru, actor_user_id, catatan, timestamp)
                VALUES (:id, 2, 3, :usr, 'Disetujui oleh verifikator.', NOW())
            ");
            $db->bind(':id', $id);
            $db->bind(':usr', $this->userData['user_id']);
            $db->execute();

            $db->query("
                INSERT INTO t_kak_approval
                (kak_id, approver_user_id, status, created_at)
                VALUES (:id, :usr, 'Disetujui', NOW())
            ");
            $db->bind(':id', $id);
            $db->bind(':usr', $this->userData['user_id']);
            $db->execute();

            $fields = [
                'catatan_nama_kegiatan',
                'catatan_tipe_kegiatan',
                'catatan_deskripsi_kegiatan',
                'catatan_sasaran_utama',
                'catatan_metode_pelaksanaan',
                'catatan_lokasi',
            ];

            foreach ($fields as $f) {
                $db->query("UPDATE t_kak SET $f=NULL WHERE kak_id=:id");
                $db->bind(':id', $id);
                $db->execute();
            }

            $childTables = [
                't_kak_tahapan',
                't_kak_target',
                't_kak_anggaran',
                't_kak_iku',
            ];

            // Clear catatan_verifikator untuk tabel child biasa
            foreach ($childTables as $tbl) {
                $db->query("UPDATE $tbl SET catatan_verifikator=NULL WHERE kak_id=:id");
                $db->bind(':id', $id);
                $db->execute();
            }

            // Clear catatan untuk t_kak_manfaat (only catatan_manfaat now)
            $db->query('UPDATE t_kak_manfaat SET catatan_manfaat=NULL WHERE kak_id=:id');
            $db->bind(':id', $id);
            $db->execute();

            $db->commit();

            // Notify Pengusul
            $this->notifikasiModel->create([
                'penerima_user_id' => $data['pengusul_user_id'],
                'pesan' => "KAK Anda \"{$data['nama_kegiatan']}\" telah disetujui oleh verifikator.",
                'link_tujuan' => '/pengusul/kak/'.$id,
            ]);

            $emailSendStatus = 'Email not sent (proposer email missing or user not found).';
            $mailService = new MailService;
            $proposer = $this->userModel->findById($data['pengusul_user_id']);

            if ($proposer && $proposer['email']) {
                $sendResult = $mailService->sendKakApprovedVerifikatorEmail(
                    $proposer['email'],
                    $proposer['nama_lengkap'],
                    $data['nama_kegiatan'],
                    $id
                );

                if (is_string($sendResult)) { // If it's a string, it's an error message
                    $emailSendStatus = "Gagal mengirim email approval KAK: {$sendResult}";
                } else { // It's true (success)
                    $emailSendStatus = "Email approval KAK berhasil dikirim ke {$proposer['email']}.";
                }
            }

            Response::success(null, 'KAK berhasil disetujui. '.$emailSendStatus);
        } catch (\Exception $e) {
            if ($this->db->inTransaction()) {
                $this->db->rollBack();
            }
            Response::error('Gagal menyetujui KAK: '.$e->getMessage(), 500);
        }
    }

    public function reject($id)
    {
        try {
            if (! $this->userData) {
                Response::unauthorized();
            }

            $db = $this->db;

            $db->query('SELECT * FROM t_kak WHERE kak_id = :id');
            $db->bind(':id', $id);
            $data = $db->single();

            if (! $data) {
                Response::notFound('Data KAK tidak ditemukan.');
            }

            if ($data['status_id'] != 2) {
                Response::error("Hanya KAK berstatus 'Dalam Review' yang bisa ditolak.", 400);
            }

            if ($data['pengusul_user_id'] == $this->userData['user_id']) {
                Response::forbidden('Pengusul tidak dapat menolak KAK sendiri.');
            }

            $input = json_decode(file_get_contents('php://input'), true);
            $catatan = $input['catatan'] ?? null;

            if (empty($catatan)) {
                Response::badRequest('Catatan penolakan wajib diisi.');
            }

            $db->beginTransaction();

            $db->query('UPDATE t_kak SET status_id=4 WHERE kak_id=:id');
            $db->bind(':id', $id);
            $db->execute();

            $db->query('
                INSERT INTO t_kak_log_status
                (kak_id, status_id_lama, status_id_baru, actor_user_id, catatan, timestamp)
                VALUES (:id, 2, 4, :usr, :ct, NOW())
            ');
            $db->bind(':id', $id);
            $db->bind(':usr', $this->userData['user_id']);
            $db->bind(':ct', $catatan);
            $db->execute();

            $db->query("
                INSERT INTO t_kak_approval
                (kak_id, approver_user_id, status, catatan, created_at)
                VALUES (:id, :usr, 'Selesai', :ct, NOW())
            ");
            $this->db->bind(':id', $id);
            $this->db->bind(':usr', $this->userData['user_id']);
            $this->db->bind(':ct', $catatan);
            $this->db->execute();

            if (! empty($input['catatan_kak'])) {
                foreach ($input['catatan_kak'] as $kol => $val) {
                    $col = "catatan_{$kol}";
                    $db->query("UPDATE t_kak SET $col = :v WHERE kak_id=:id");
                    $db->bind(':v', $val);
                    $db->bind(':id', $id);
                    $db->execute();
                }
            }

            if (! empty($input['anak'])) {
                $pkMap = [
                    't_kak_manfaat' => 'manfaat_id',
                    't_kak_tahapan' => 'tahapan_id',
                    't_kak_target' => 'target_id',
                    't_kak_anggaran' => 'anggaran_id',
                    't_kak_iku' => 'iku_id',
                ];

                foreach ($input['anak'] as $table => $rows) {
                    if (! isset($pkMap[$table])) {
                        continue;
                    }

                    $pk = $pkMap[$table];

                    foreach ($rows as $r) {
                        if (empty($r['id'])) {
                            continue;
                        }

                        $db->query("
                            UPDATE $table 
                            SET catatan_verifikator = :ct
                            WHERE $pk = :cid
                        ");
                        $db->bind(':ct', $r['catatan_verifikator'] ?? null);
                        $db->bind(':cid', $r['id']);
                        $db->execute();
                    }
                }
            }

            $db->commit();

            // Notify Pengusul
            $this->notifikasiModel->create([
                'penerima_user_id' => $data['pengusul_user_id'],
                'pesan' => "KAK Anda \"{$data['nama_kegiatan']}\" ditolak. ".($catatan ? "Catatan: {$catatan}" : ''),
                'link_tujuan' => '/pengusul/kak/'.$id,
            ]);

            $proposer = $this->userModel->findById($data['pengusul_user_id']);
            if ($proposer && ! empty($proposer['email'])) {
                $kakDataForEmail = [
                    'nama_kegiatan' => $data['nama_kegiatan'],
                    'pengusul_nama' => $proposer['nama_lengkap'],
                    'pengusul_email' => $proposer['email'],
                ];
                $this->mailService->notifyKAKRejected($id, $kakDataForEmail, $catatan);
            }

            Response::success(null, 'KAK berhasil ditolak dan proses dihentikan.');
        } catch (\Exception $e) {
            if ($this->db->inTransaction()) {
                $this->db->rollBack();
            }
            Response::error('Gagal menolak KAK: '.$e->getMessage(), 500);
        }
    }

    /**
     * Get overdue KAKs for Verifikator.
     *
     * GET /api/kak/overdue-verifikator
     * Requires: AuthMiddleware, RoleMiddleware (Verifikator, Admin)
     */
    public function getOverdueKakActivities()
    {
        try {
            // Authorization: Only Verifikator or Admin can access this
            if (! $this->hasRole('Verifikator') && ! $this->hasRole('Admin')) {
                Response::forbidden('Anda tidak memiliki akses untuk melihat KAK overdue verifikator.');
            }

            $overdueKak = $this->kakModel->getOverdueKakForVerifikator();

            $overdueCount = count($overdueKak);
            $kakNames = array_map(fn ($k) => $k['nama_kak'], $overdueKak);

            Response::success([
                'count' => $overdueCount,
                'names' => $kakNames,
                'kaks' => $overdueKak, // Return full data with overdue_days
            ], 'Data KAK overdue verifikator berhasil diambil.');

        } catch (\Exception $e) {
            Response::error('Gagal mengambil data KAK overdue verifikator: '.$e->getMessage(), 500);
        }
    }

    public function delete($id)
    {
        try {
            if (! $this->userData) {
                Response::unauthorized();
            }

            $db = $this->db;

            $db->query('SELECT * FROM t_kak WHERE kak_id = :id');
            $db->bind(':id', $id);
            $data = $db->single();

            if (! $data) {
                Response::notFound('Data KAK tidak ditemukan.');
            }

            if ($data['pengusul_user_id'] != $this->userData['user_id']) {
                Response::forbidden('Anda tidak memiliki akses untuk menghapus KAK ini.');
            }

            // Only allow delete if status is Draft (1) or Ditolak (4)
            if (! in_array($data['status_id'], [1, 4])) {
                Response::error('Hanya KAK berstatus Draft atau Ditolak yang bisa dihapus.', 400);
            }

            $db->beginTransaction();

            $childTables = [
                't_kak_manfaat',
                't_kak_tahapan',
                't_kak_indikator',
                't_kak_iku',
                't_kak_target',
                't_kak_anggaran',
                't_kak_log_status',
                't_kak_approval',
            ];

            foreach ($childTables as $table) {
                $db->query("DELETE FROM $table WHERE kak_id = :id");
                $this->db->bind(':id', $id);
                $this->db->execute();
            }

            $db->query('DELETE FROM t_kak WHERE kak_id = :id');
            $db->bind(':id', $id);
            $db->execute();

            $db->commit();

            Response::success(null, 'KAK berhasil dihapus.');
        } catch (\Exception $e) {
            if ($this->db->inTransaction()) {
                $this->db->rollBack();
            }
            Response::error('Gagal menghapus KAK: '.$e->getMessage(), 500);
        }
    }

    /**
     * Helper: Check if user has role
     */
    private function hasRole($roleName)
    {
        return in_array($roleName, $this->userData['roles'] ?? []);
    }
}

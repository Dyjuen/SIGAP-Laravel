<?php

namespace App\Models;

use App\Core\Model;
use PDO;

class PencairanDana extends Model
{
    protected $table = 't_pencairan_dana';

    protected $primaryKey = 'pencairan_id';

    /**
     * Mencatat transaksi pencairan dana baru oleh bendahara.
     *
     * @param  array  $data  Data transaksi pencairan.
     * @return int ID dari data yang baru dimasukkan.
     */
    public function logTransaksi(array $data): int
    {
        $sql = "INSERT INTO {$this->table} 
                (kegiatan_id, jumlah_dicairkan, keterangan, created_by, tanggal_pencairan)
                VALUES 
                (:kegiatan_id, :jumlah_dicairkan, :keterangan, :created_by, CURDATE())";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':kegiatan_id' => $data['kegiatan_id'],
            ':jumlah_dicairkan' => $data['jumlah_dicairkan'],
            ':keterangan' => $data['keterangan'],
            ':created_by' => $data['created_by'],
        ]);

        return (int) $this->db->lastInsertId();
    }

    /**
     * Mengambil semua histori pencairan dana untuk sebuah kegiatan.
     *
     * @param  int  $kegiatanId  ID kegiatan.
     * @return array Daftar histori pencairan.
     */
    public function getByKegiatanId(int $kegiatanId): array
    {
        $sql = "SELECT * FROM {$this->table} WHERE kegiatan_id = :kegiatan_id ORDER BY tanggal_pencairan DESC, created_at DESC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['kegiatan_id' => $kegiatanId]);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Menghitung sisa dana yang belum dicairkan untuk sebuah kegiatan.
     *
     * @param  int  $kegiatanId  ID kegiatan.
     * @return array Ringkasan dana.
     */
    public function getSisaDana(int $kegiatanId): array
    {
        // Get kak_id from kegiatan_id
        $stmt = $this->db->prepare('SELECT kak_id FROM t_kegiatan WHERE kegiatan_id = :kegiatan_id');
        $stmt->execute(['kegiatan_id' => $kegiatanId]);
        $kegiatan = $stmt->fetch(PDO::FETCH_ASSOC);

        if (! $kegiatan) {
            return ['total_anggaran' => 0, 'total_dicairkan' => 0, 'sisa_dana' => 0];
        }
        $kakId = $kegiatan['kak_id'];

        // 1. Get Total Anggaran from t_kak_anggaran
        $sqlAnggaran = 'SELECT COALESCE(SUM(jumlah_diusulkan), 0) as total_anggaran
                        FROM t_kak_anggaran
                        WHERE kak_id = :kak_id';

        $stmtAnggaran = $this->db->prepare($sqlAnggaran);
        $stmtAnggaran->execute(['kak_id' => $kakId]);
        $resultAnggaran = $stmtAnggaran->fetch(PDO::FETCH_ASSOC);
        $totalAnggaran = (float) ($resultAnggaran['total_anggaran'] ?? 0);

        // 2. Get Total Dana Dicairkan from t_pencairan_dana
        $sqlDicairkan = 'SELECT COALESCE(SUM(jumlah_dicairkan), 0) as total_dicairkan
                         FROM t_pencairan_dana
                         WHERE kegiatan_id = :kegiatan_id';

        $stmtDicairkan = $this->db->prepare($sqlDicairkan);
        $stmtDicairkan->execute(['kegiatan_id' => $kegiatanId]);
        $resultDicairkan = $stmtDicairkan->fetch(PDO::FETCH_ASSOC);
        $totalDicairkan = (float) ($resultDicairkan['total_dicairkan'] ?? 0);

        // 3. Calculate Sisa Dana
        $sisaDana = $totalAnggaran - $totalDicairkan;

        return [
            'total_anggaran_disetujui' => $totalAnggaran,
            'total_dicairkan' => $totalDicairkan,
            'sisa_dana' => $sisaDana,
        ];
    }
}

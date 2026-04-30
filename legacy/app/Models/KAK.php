<?php

namespace App\Models;

use App\Core\Model;

class KAK extends Model
{
    protected $table = 't_kak';

    protected $primaryKey = 'kak_id';

    /**
     * Fungsi kustom untuk mengambil data berdasarkan user_id
     */
    public function findByUser($user_id)
    {
        // query() adalah method dari Core/Model.php
        $sql = "SELECT * FROM {$this->table} WHERE user_id = ? ORDER BY kak_id ASC";

        return $this->query($sql, [$user_id])->fetchAll(\PDO::FETCH_ASSOC);
    }

    /**
     * Fungsi kustom untuk mengambil data berdasarkan status_id
     */
    public function findByStatus($status_id)
    {
        $sql = "SELECT * FROM {$this->table} WHERE status_id = ? ORDER BY kak_id ASC";

        return $this->query($sql, [$status_id])->fetchAll(\PDO::FETCH_ASSOC);
    }

    /**
     * Mengambil semua data yang diperlukan untuk membuat PDF KAK dari kak_id.
     * Data ini diformat agar kompatibel dengan kak-template.php.
     */
    public function getDataForKAK($kakId)
    {
        // 1. Ambil data utama dari t_kak dengan joins lengkap
        $sql = 'SELECT 
                            t.*,
                            u.nama_lengkap AS pengusul_nama,
                            COALESCE(tkg.penanggung_jawab_manual, u.nama_lengkap) AS pengusul_nama,
                            ks.nama_status,
                            tk.nama_tipe AS nama_tipe_kegiatan,
                            ma.kode_anggaran,
                            ma.nama_sumber_dana
                        FROM t_kak t
                        LEFT JOIN m_users u ON t.pengusul_user_id = u.user_id
                        LEFT JOIN t_kegiatan tkg ON t.kak_id = tkg.kak_id
                        LEFT JOIN m_kegiatan_status ks ON t.status_id = ks.status_id
                        LEFT JOIN m_tipe_kegiatan tk ON t.tipe_kegiatan_id = tk.tipe_kegiatan_id
                        LEFT JOIN m_mata_anggaran ma ON t.mata_anggaran_id = ma.mata_anggaran_id
                        WHERE t.kak_id = ?';

        $kak = $this->query($sql, [$kakId])->fetch(\PDO::FETCH_ASSOC);

        if (! $kak) {
            return false;
        }

        // 2. Ambil data dari tabel anak
        $childTables = [
            'manfaat' => 'SELECT * FROM t_kak_manfaat WHERE kak_id = ? ORDER BY manfaat_id ASC',
            'tahapan' => 'SELECT * FROM t_kak_tahapan WHERE kak_id = ? ORDER BY urutan ASC',
            'indikator' => 'SELECT * FROM t_kak_indikator WHERE kak_id = ? ORDER BY indikator_id ASC',
            'target' => 'SELECT * FROM t_kak_target WHERE kak_id = ? ORDER BY target_id ASC',
            'iku' => 'SELECT 
                                        tki.*, 
                                        mi.kode_iku, 
                                        mi.nama_iku,
                                        ms.nama_satuan
                                    FROM t_kak_iku tki 
                                    LEFT JOIN m_iku mi ON tki.iku_id = mi.iku_id 
                                    LEFT JOIN m_satuan ms ON tki.satuan_id = ms.satuan_id
                                    WHERE tki.kak_id = ?
                                    ORDER BY tki.iku_id ASC',
            'anggaran' => 'SELECT 
                                        tka.*,
                                        kb.nama AS nama_kategori,
                                        s1.nama_satuan AS nama_satuan1,
                                        s2.nama_satuan AS nama_satuan2,
                                        s3.nama_satuan AS nama_satuan3
                                    FROM t_kak_anggaran tka
                                    LEFT JOIN m_kategori_belanja kb ON tka.kategori_belanja_id = kb.kategori_belanja_id
                                    LEFT JOIN m_satuan s1 ON tka.satuan1_id = s1.satuan_id
                                    LEFT JOIN m_satuan s2 ON tka.satuan2_id = s2.satuan_id
                                    LEFT JOIN m_satuan s3 ON tka.satuan3_id = s3.satuan_id
                                    WHERE tka.kak_id = ?
                                    ORDER BY kb.kategori_belanja_id ASC, tka.anggaran_id ASC',
            'lampiran' => 'SELECT 
                                        tkl.*
                                    FROM t_kegiatan_lampiran tkl
                                    INNER JOIN t_kak_anggaran tka ON tkl.anggaran_id = tka.anggaran_id
                                    WHERE tka.kak_id = ?
                                    ORDER BY tkl.created_at ASC',
        ];

        foreach ($childTables as $key => $childSql) {
            $kak[$key] = $this->query($childSql, [$kakId])->fetchAll(\PDO::FETCH_ASSOC);
        }

        // Kembalikan data gabungan
        return $kak;
    }

    /**
     * Get overdue KAKs for Verifikator approval.
     * Overdue is defined as:
     * - kak.status_id is 2 (Review Verifikator)
     * - updated_at is older than 3 days ago
     *
     * @return array A list of overdue KAKs with their IDs, names, pengusul, status, and overdue days.
     */
    public function getOverdueKakForVerifikator(): array
    {
        $sql = 'SELECT
                    kak.kak_id,
                    kak.nama_kegiatan AS nama_kak,
                    kak.updated_at,
                    DATEDIFF(NOW(), kak.updated_at) AS overdue_days,
                    u.nama_lengkap AS pengusul_nama,
                    ks.nama_status
                FROM t_kak kak
                JOIN m_users u ON kak.pengusul_user_id = u.user_id
                JOIN m_kegiatan_status ks ON kak.status_id = ks.status_id
                WHERE kak.status_id = 2 -- 2 = Review Verifikator
                AND kak.updated_at < NOW() - INTERVAL 3 DAY';

        return $this->query($sql)->fetchAll(\PDO::FETCH_ASSOC);
    }
}

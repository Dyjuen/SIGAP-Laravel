<?php

namespace App\Models;

use App\Core\Model;
use PDO;

class KAKAnggaran extends Model
{
    protected $table = 't_kak_anggaran';

    protected $primaryKey = 'anggaran_id';

    /**
     * Fungsi kustom untuk mengambil data berdasarkan kak_id
     * Kita gunakan method 'findAllBy' dari Core/Model.php
     */
    public function findByKak($kak_id)
    {
        return $this->findAllBy('kak_id', $kak_id);
    }

    /**
     * Mengambil item anggaran beserta nama kategorinya untuk suatu KAK.
     */
    public function getAnggaranWithKategoriByKakId($kak_id)
    {
        $sql = "SELECT ka.*, kb.nama as nama_kategori_belanja
                FROM {$this->table} ka
                LEFT JOIN m_kategori_belanja kb ON ka.kategori_belanja_id = kb.kategori_belanja_id
                WHERE ka.kak_id = ?";

        return $this->query($sql, [$kak_id])->fetchAll(PDO::FETCH_ASSOC);
    }
}

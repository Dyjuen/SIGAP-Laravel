<?php

namespace App\Models;

use App\Core\Model;

class KAKIku extends Model
{
    protected $table = 't_kak_iku';

    /**
     * Cari semua target IKU berdasarkan ID KAK.
     */
    public function findByKak($kak_id)
    {
        return $this->query("SELECT * FROM {$this->table} WHERE kak_id = ?", [$kak_id]);
    }
}

<?php

namespace App\Models;

use App\Core\Model;

class KAKTahapan extends Model
{
    protected $table = 't_kak_tahapan';

    protected $primaryKey = 'tahapan_id';

    public function findByKak($kak_id)
    {
        return $this->findAllBy('kak_id', $kak_id);
    }
}

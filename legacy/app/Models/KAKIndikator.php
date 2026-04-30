<?php

namespace App\Models;

use App\Core\Model;

class KAKIndikator extends Model
{
    protected $table = 't_kak_indikator';

    protected $primaryKey = 'indikator_id';

    public function findByKak($kak_id)
    {
        return $this->findAllBy('kak_id', $kak_id);
    }
}

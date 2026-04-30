<?php

namespace App\Models;

use App\Core\Model;

class KAKTarget extends Model
{
    protected $table = 't_kak_target';

    protected $primaryKey = 'target_id';

    public function findByKak($kak_id)
    {
        return $this->findAllBy('kak_id', $kak_id);
    }
}

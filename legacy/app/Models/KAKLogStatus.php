<?php

namespace App\Models;

use App\Core\Model;

class KAKLogStatus extends Model
{
    protected $table = 't_kak_log_status';

    protected $primaryKey = 'log_id';

    public function findByKak($kak_id)
    {
        return $this->findAllBy('kak_id', $kak_id);
    }
}

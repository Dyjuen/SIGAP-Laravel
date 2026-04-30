<?php

namespace App\Models;

use App\Core\Model;

class KAKManfaat extends Model
{
    protected $table = 't_kak_manfaat';

    protected $primaryKey = 'manfaat_id';

    public function findByKak($kak_id)
    {
        return $this->findAllBy('kak_id', $kak_id);
    }
}

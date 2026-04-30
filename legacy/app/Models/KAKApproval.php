<?php

namespace App\Models;

use App\Core\Model;

class KAKApproval extends Model
{
    protected $table = 't_kak_approval';

    protected $primaryKey = 'approval_telaah_id';

    public function findByKak($kak_id)
    {
        return $this->findAllBy('kak_id', $kak_id);
    }
}

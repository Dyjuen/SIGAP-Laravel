<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KAKApproval extends Model
{
    protected $table = 't_kak_approval';

    protected $primaryKey = 'approval_telaah_id';

    protected $guarded = ['approval_telaah_id'];

    public function kak()
    {
        return $this->belongsTo(KAK::class, 'kak_id');
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approver_user_id');
    }
}

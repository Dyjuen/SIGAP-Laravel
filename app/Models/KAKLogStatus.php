<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KAKLogStatus extends Model
{
    protected $table = 't_kak_log_status';

    protected $primaryKey = 'log_id';

    protected $guarded = ['log_id'];

    public $timestamps = false;

    public function kak()
    {
        return $this->belongsTo(KAK::class, 'kak_id');
    }

    public function oldStatus()
    {
        return $this->belongsTo(KegiatanStatus::class, 'status_id_lama');
    }

    public function newStatus()
    {
        return $this->belongsTo(KegiatanStatus::class, 'status_id_baru');
    }

    public function actor()
    {
        return $this->belongsTo(User::class, 'actor_user_id');
    }
}

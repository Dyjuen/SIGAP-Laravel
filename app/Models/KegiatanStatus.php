<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KegiatanStatus extends Model
{
    protected $table = 'm_kegiatan_status';

    protected $primaryKey = 'status_id';

    protected $guarded = ['status_id'];

    public $timestamps = false;
}

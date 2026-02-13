<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KegiatanLogStatus extends Model
{
    protected $table = 't_kegiatan_log_status';

    protected $primaryKey = 'log_id';

    protected $guarded = ['log_id'];

    public $timestamps = false;
}

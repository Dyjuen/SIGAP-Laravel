<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KegiatanLampiran extends Model
{
    protected $table = 't_kegiatan_lampiran';

    protected $primaryKey = 'lampiran_id';

    protected $guarded = ['lampiran_id'];

    public $timestamps = false;
}

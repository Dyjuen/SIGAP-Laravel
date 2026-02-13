<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TipeKegiatan extends Model
{
    protected $table = 'm_tipe_kegiatan';

    protected $primaryKey = 'tipe_kegiatan_id';

    protected $guarded = ['tipe_kegiatan_id'];

    public $timestamps = false;
}

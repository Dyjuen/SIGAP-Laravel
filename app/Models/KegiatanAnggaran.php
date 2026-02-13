<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KegiatanAnggaran extends Model
{
    protected $table = 't_kegiatan_anggaran';

    protected $primaryKey = 'anggaran_id';

    protected $guarded = ['anggaran_id'];

    public $timestamps = false;
}

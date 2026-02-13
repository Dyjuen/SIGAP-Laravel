<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Kegiatan extends Model
{
    protected $table = 't_kegiatan';

    protected $primaryKey = 'kegiatan_id';

    protected $guarded = ['kegiatan_id'];
}

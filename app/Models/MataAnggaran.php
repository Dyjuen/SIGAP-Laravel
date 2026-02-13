<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MataAnggaran extends Model
{
    protected $table = 'm_mata_anggaran';

    protected $primaryKey = 'mata_anggaran_id';

    protected $guarded = ['mata_anggaran_id'];

    public $timestamps = false;
}

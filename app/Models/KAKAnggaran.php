<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KAKAnggaran extends Model
{
    protected $table = 't_kak_anggaran';

    protected $primaryKey = 'anggaran_id';

    protected $guarded = ['anggaran_id'];

    public $timestamps = false;
}

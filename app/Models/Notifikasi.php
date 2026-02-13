<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Notifikasi extends Model
{
    protected $table = 't_notifikasi';

    protected $primaryKey = 'notifikasi_id';

    protected $guarded = ['notifikasi_id'];

    public $timestamps = false;
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KAKManfaat extends Model
{
    protected $table = 't_kak_manfaat';

    protected $primaryKey = 'manfaat_id';

    protected $guarded = ['manfaat_id'];

    public $timestamps = false;
}

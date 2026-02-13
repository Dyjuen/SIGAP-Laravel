<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KAK extends Model
{
    protected $table = 't_kak';

    protected $primaryKey = 'kak_id';

    protected $guarded = ['kak_id'];
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KAKIku extends Model
{
    protected $table = 't_kak_iku';

    protected $primaryKey = ['kak_id', 'iku_id'];

    public $incrementing = false;

    protected $guarded = [];

    public $timestamps = false;
}

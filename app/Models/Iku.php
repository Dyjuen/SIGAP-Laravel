<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Iku extends Model
{
    protected $table = 'm_iku';

    protected $primaryKey = 'iku_id';

    protected $guarded = ['iku_id'];

    public $timestamps = false;
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PencairanDana extends Model
{
    protected $table = 't_pencairan_dana';

    protected $primaryKey = 'pencairan_id';

    protected $guarded = ['pencairan_id'];

    public $timestamps = false;
}

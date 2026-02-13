<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Satuan extends Model
{
    protected $table = 'm_satuan';

    protected $primaryKey = 'satuan_id';

    protected $guarded = ['satuan_id'];

    public $timestamps = false;
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Panduan extends Model
{
    protected $table = 'm_panduan';

    protected $primaryKey = 'panduan_id';

    protected $guarded = ['panduan_id'];

    public $timestamps = false;
}

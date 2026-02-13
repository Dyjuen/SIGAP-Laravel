<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KategoriBelanja extends Model
{
    protected $table = 'm_kategori_belanja';

    protected $primaryKey = 'kategori_belanja_id';

    protected $guarded = ['kategori_belanja_id'];
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Satuan extends Model
{
    /** @use HasFactory<\Database\Factories\SatuanFactory> */
    use HasFactory, SoftDeletes;

    protected $table = 'm_satuan';

    protected $primaryKey = 'satuan_id';

    protected $fillable = [
        'nama_satuan',
    ];

    public $timestamps = false;
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Iku extends Model
{
    /** @use HasFactory<\Database\Factories\IkuFactory> */
    use HasFactory, SoftDeletes;

    protected $table = 'm_iku';

    protected $primaryKey = 'iku_id';

    protected $fillable = [
        'kode_iku',
        'nama_iku',
    ];

    public $timestamps = false;
}

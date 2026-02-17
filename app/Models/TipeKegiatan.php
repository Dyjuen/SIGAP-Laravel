<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TipeKegiatan extends Model
{
    /** @use HasFactory<\Database\Factories\TipeKegiatanFactory> */
    use HasFactory;

    protected $table = 'm_tipe_kegiatan';

    protected $primaryKey = 'tipe_kegiatan_id';

    protected $fillable = [
        'nama_tipe',
    ];

    public $timestamps = false;
}

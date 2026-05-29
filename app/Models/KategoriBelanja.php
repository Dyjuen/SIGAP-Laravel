<?php

namespace App\Models;

use Database\Factories\KategoriBelanjaFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class KategoriBelanja extends Model
{
    /** @use HasFactory<KategoriBelanjaFactory> */
    use HasFactory;

    protected $table = 'm_kategori_belanja';

    protected $primaryKey = 'kategori_belanja_id';

    protected $fillable = [
        'kode',
        'nama',
        'keterangan',
        'urutan',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];
}

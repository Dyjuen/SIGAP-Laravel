<?php

namespace App\Models;

use Database\Factories\KategoriBelanjaFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class KategoriBelanja extends Model
{
    /** @use HasFactory<KategoriBelanjaFactory> */
    use HasFactory, SoftDeletes;

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

    protected $appends = ['id'];

    public function getIdAttribute()
    {
        return $this->getKey();
    }
}

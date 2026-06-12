<?php

namespace App\Models;

use Database\Factories\TipeKegiatanFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TipeKegiatan extends Model
{
    /** @use HasFactory<TipeKegiatanFactory> */
    use HasFactory;

    protected $table = 'm_tipe_kegiatan';

    protected $primaryKey = 'tipe_kegiatan_id';

    protected $fillable = [
        'nama_tipe',
    ];

    protected $appends = ['id'];

    public $timestamps = false;

    public function getIdAttribute()
    {
        return $this->getKey();
    }
}

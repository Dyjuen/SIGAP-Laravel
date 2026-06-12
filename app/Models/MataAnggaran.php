<?php

namespace App\Models;

use Database\Factories\MataAnggaranFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class MataAnggaran extends Model
{
    /** @use HasFactory<MataAnggaranFactory> */
    use HasFactory, SoftDeletes;

    protected $table = 'm_mata_anggaran';

    protected $primaryKey = 'mata_anggaran_id';

    protected $fillable = [
        'kode_anggaran',
        'nama_sumber_dana',
        'tahun_anggaran',
        'total_pagu',
    ];

    protected $appends = ['id'];

    public $timestamps = false;

    public function getIdAttribute()
    {
        return $this->getKey();
    }
}

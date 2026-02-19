<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KAKAnggaran extends Model
{
    protected $table = 't_kak_anggaran';

    protected $primaryKey = 'anggaran_id';

    protected $guarded = ['anggaran_id'];

    public $timestamps = false;

    public function kak()
    {
        return $this->belongsTo(KAK::class, 'kak_id');
    }

    public function kategoriBelanja()
    {
        return $this->belongsTo(KategoriBelanja::class, 'kategori_belanja_id');
    }

    public function satuan1()
    {
        return $this->belongsTo(Satuan::class, 'satuan1_id');
    }

    public function satuan2()
    {
        return $this->belongsTo(Satuan::class, 'satuan2_id');
    }

    public function satuan3()
    {
        return $this->belongsTo(Satuan::class, 'satuan3_id');
    }
}

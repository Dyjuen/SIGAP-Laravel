<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KAKIku extends Model
{
    protected $table = 't_kak_iku';

    // Composite PK requires extra handling in specific cases, but for relationships it works
    protected $primaryKey = ['kak_id', 'iku_id'];

    public $incrementing = false;

    protected $guarded = [];

    public $timestamps = false;

    public function kak()
    {
        return $this->belongsTo(KAK::class, 'kak_id');
    }

    public function iku()
    {
        return $this->belongsTo(Iku::class, 'iku_id');
    }

    public function satuan()
    {
        return $this->belongsTo(Satuan::class, 'satuan_id');
    }
}

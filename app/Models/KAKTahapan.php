<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KAKTahapan extends Model
{
    protected $table = 't_kak_tahapan';

    protected $primaryKey = 'tahapan_id';

    protected $guarded = ['tahapan_id'];

    public $timestamps = false;

    public function kak()
    {
        return $this->belongsTo(KAK::class, 'kak_id');
    }
}

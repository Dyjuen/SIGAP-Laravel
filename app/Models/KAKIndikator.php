<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KAKIndikator extends Model
{
    protected $table = 't_kak_indikator';

    protected $primaryKey = 'indikator_id';

    protected $guarded = ['indikator_id'];

    public $timestamps = false;
}

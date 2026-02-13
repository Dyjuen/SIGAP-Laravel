<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KAKTarget extends Model
{
    protected $table = 't_kak_target';

    protected $primaryKey = 'target_id';

    protected $guarded = ['target_id'];

    public $timestamps = false;
}

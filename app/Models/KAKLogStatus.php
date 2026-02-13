<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KAKLogStatus extends Model
{
    protected $table = 't_kak_log_status';

    protected $primaryKey = 'log_id';

    protected $guarded = ['log_id'];

    public $timestamps = false;
}

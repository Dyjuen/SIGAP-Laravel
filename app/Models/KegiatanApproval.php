<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KegiatanApproval extends Model
{
    protected $table = 't_kegiatan_approval';

    protected $primaryKey = 'approval_kegiatan_id';

    protected $guarded = ['approval_kegiatan_id'];
}

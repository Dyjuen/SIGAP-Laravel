<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PencairanDana extends Model
{
    protected $table = 't_pencairan_dana';

    protected $primaryKey = 'pencairan_id';

    protected $guarded = ['pencairan_id'];

    public $timestamps = false;

    protected $casts = [
        'tanggal_pencairan' => 'date',
        'jumlah_dicairkan' => 'decimal:2',
    ];

    public function kegiatan()
    {
        return $this->belongsTo(Kegiatan::class, 'kegiatan_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by', 'user_id');
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Kegiatan extends Model
{
    protected $table = 't_kegiatan';

    protected $primaryKey = 'kegiatan_id';

    protected $guarded = ['kegiatan_id'];

    protected $casts = [
        'tanggal_mulai_final' => 'date',
        'tanggal_selesai_final' => 'date',
        'tgl_batas_lpj' => 'datetime',
        'lpj_submitted_at' => 'datetime',
        'spk_kesesuaian_waktu' => 'integer',
        'spk_ketepatan_anggaran' => 'integer',
        'spk_kesesuaian_output' => 'integer',
        'spk_ketepatan_lpj' => 'integer',
    ];

    public function kak()
    {
        return $this->belongsTo(KAK::class, 'kak_id');
    }

    public function approvals()
    {
        return $this->hasMany(KegiatanApproval::class, 'kegiatan_id');
    }

    public function logs()
    {
        return $this->hasMany(KegiatanLogStatus::class, 'kegiatan_id');
    }

    public function activeApproval()
    {
        return $this->hasOne(KegiatanApproval::class, 'kegiatan_id')->where('status', 'Aktif');
    }

    public function pencairanDana()
    {
        return $this->hasMany(PencairanDana::class, 'kegiatan_id');
    }
}

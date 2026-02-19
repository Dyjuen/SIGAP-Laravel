<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class KAK extends Model
{
    use HasFactory;

    protected $table = 't_kak';

    protected $primaryKey = 'kak_id';

    protected $guarded = ['kak_id'];

    protected $casts = [
        'tanggal_mulai' => 'date',
        'tanggal_selesai' => 'date',
    ];

    // Reference Relationships
    public function tipeKegiatan()
    {
        return $this->belongsTo(TipeKegiatan::class, 'tipe_kegiatan_id');
    }

    public function pengusul()
    {
        return $this->belongsTo(User::class, 'pengusul_user_id');
    }

    public function mataAnggaran()
    {
        return $this->belongsTo(MataAnggaran::class, 'mata_anggaran_id');
    }

    public function status()
    {
        return $this->belongsTo(KegiatanStatus::class, 'status_id');
    }

    // Child Relationships
    public function manfaat()
    {
        return $this->hasMany(KAKManfaat::class, 'kak_id');
    }

    public function tahapan()
    {
        return $this->hasMany(KAKTahapan::class, 'kak_id');
    }

    public function targets() // indikator_kinerja mapped to t_kak_target
    {
        return $this->hasMany(KAKTarget::class, 'kak_id');
    }

    public function ikus() // target_iku mapped to t_kak_iku
    {
        return $this->hasMany(KAKIku::class, 'kak_id');
    }

    public function anggaran() // rab mapped to t_kak_anggaran
    {
        return $this->hasMany(KAKAnggaran::class, 'kak_id');
    }

    // Log & History
    public function logStatuses()
    {
        return $this->hasMany(KAKLogStatus::class, 'kak_id');
    }

    public function approvals()
    {
        return $this->hasMany(KAKApproval::class, 'kak_id');
    }
}

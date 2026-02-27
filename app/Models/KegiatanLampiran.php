<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class KegiatanLampiran extends Model
{
    /** @use HasFactory<\Database\Factories\KegiatanLampiranFactory> */
    use HasFactory;

    protected $table = 't_kegiatan_lampiran';

    protected $primaryKey = 'lampiran_id';

    protected $guarded = ['lampiran_id'];

    // Timestamps are managed by database/manual
    public $timestamps = false;

    protected $casts = [
        'created_at' => 'datetime',
        'catatan_tanggal' => 'datetime',
        'approval_tanggal' => 'datetime',
        'updated_at' => 'datetime',
        'revisi_ke' => 'integer',
    ];

    /**
     * Relationships
     */
    public function uploader()
    {
        return $this->belongsTo(User::class, 'uploader_user_id', 'user_id');
    }

    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewer_user_id', 'user_id');
    }

    public function anggaran()
    {
        return $this->belongsTo(KAKAnggaran::class, 'anggaran_id', 'anggaran_id');
    }

    public function parent()
    {
        return $this->belongsTo(KegiatanLampiran::class, 'parent_lampiran_id', 'lampiran_id');
    }

    public function children()
    {
        return $this->hasMany(KegiatanLampiran::class, 'parent_lampiran_id', 'lampiran_id');
    }

    /**
     * Get the full history tree (recursive ancestors)
     */
    public function getHistoryAttribute()
    {
        $history = collect();
        $current = $this;

        while ($current->parent) {
            $history->push($current->parent);
            $current = $current->parent;
        }

        return $history->reverse();
    }
}

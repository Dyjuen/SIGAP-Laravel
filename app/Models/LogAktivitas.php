<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LogAktivitas extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'v_log_aktivitas';

    /**
     * The primary key for the model.
     *
     * @var string
     */
    protected $primaryKey = 'log_id';

    /**
     * The "type" of the primary key ID.
     *
     * @var string
     */
    protected $keyType = 'string';

    /**
     * Indicates if the IDs are auto-incrementing.
     *
     * @var bool
     */
    public $incrementing = false;

    /**
     * Indicates if the model should be timestamped.
     *
     * @var bool
     */
    public $timestamps = false; // View doesn't support direct timestamp updates by default and we just read

    protected $casts = [
        'created_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id')->withTrashed();
    }

    public function kak(): BelongsTo
    {
        return $this->belongsTo(KAK::class, 'kak_id');
    }

    public function kegiatan(): BelongsTo
    {
        return $this->belongsTo(Kegiatan::class, 'kegiatan_id');
    }

    public function oldStatus(): BelongsTo
    {
        return $this->belongsTo(KegiatanStatus::class, 'old_status');
    }

    public function newStatus(): BelongsTo
    {
        return $this->belongsTo(KegiatanStatus::class, 'new_status');
    }

    public function getLogDescriptionAttribute(): string
    {
        if ($this->log_type === 'KAK_STATUS') {
            return sprintf(
                'Mengubah status KAK "%s" dari "%s" menjadi "%s"',
                $this->kak->nama_kegiatan ?? '-',
                $this->oldStatus->nama_status ?? '-',
                $this->newStatus->nama_status ?? '-'
            );
        }

        if ($this->log_type === 'KEGIATAN_STATUS') {
            return sprintf(
                'Mengubah status Kegiatan "%s" dari "%s" menjadi "%s"',
                $this->kegiatan->kak->nama_kegiatan ?? '-',
                $this->oldStatus->nama_status ?? '-',
                $this->newStatus->nama_status ?? '-'
            );
        }

        if ($this->log_type === 'KAK_APPROVAL') {
            return sprintf(
                'Memberikan status approval "%s" pada KAK "%s"',
                $this->approval_status,
                $this->kak->nama_kegiatan ?? '-'
            );
        }

        if ($this->log_type === 'KEGIATAN_APPROVAL') {
            return sprintf(
                'Memberikan status approval "%s" pada Kegiatan "%s" (Level: %s)',
                $this->approval_status,
                $this->kegiatan->kak->nama_kegiatan ?? '-',
                $this->approval_level
            );
        }

        return 'Unknown Activity';
    }

    public function getContextTitleAttribute(): string
    {
        if ($this->kak) {
            return $this->kak->nama_kegiatan ?? '-';
        }
        if ($this->kegiatan && $this->kegiatan->kak) {
            return $this->kegiatan->kak->nama_kegiatan ?? '-';
        }

        return '-';
    }

    public function scopeFilter($query, array $filters)
    {
        if (! empty($filters['start_date'])) {
            $query->whereDate('created_at', '>=', $filters['start_date']);
        }
        if (! empty($filters['end_date'])) {
            $query->whereDate('created_at', '<=', $filters['end_date']);
        }
        if (! empty($filters['role'])) {
            $query->whereHas('user.role', function ($q) use ($filters) {
                $q->where('nama_role', $filters['role']);
            });
        }
        if (! empty($filters['log_type'])) {
            $query->where('log_type', $filters['log_type']);
        }

        return $query;
    }
}

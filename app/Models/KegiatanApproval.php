<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KegiatanApproval extends Model
{
    protected $table = 't_kegiatan_approval';

    protected $primaryKey = 'approval_kegiatan_id';

    protected $guarded = ['approval_kegiatan_id'];

    protected $casts = [
        'activated_at' => 'datetime',
        'approved_at' => 'datetime',
        'revised_at' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();

        static::saving(function ($model) {
            if ($model->isDirty('status') || ! $model->exists) {
                $status = $model->status;
                if ($status === 'Aktif') {
                    if (is_null($model->activated_at)) {
                        $model->activated_at = now();
                    }
                } elseif ($status === 'Disetujui') {
                    if (is_null($model->approved_at)) {
                        $model->approved_at = now();
                    }
                } elseif ($status === 'Revisi') {
                    if (is_null($model->revised_at)) {
                        $model->revised_at = now();
                    }
                }
            }
        });
    }

    public function kegiatan()
    {
        return $this->belongsTo(Kegiatan::class, 'kegiatan_id');
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approver_user_id');
    }
}

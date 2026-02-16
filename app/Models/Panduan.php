<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Panduan extends Model
{
    protected $table = 'm_panduan';

    protected $primaryKey = 'panduan_id';

    protected $fillable = [
        'judul_panduan',
        'tipe_media',
        'path_media',
        'target_role_id',
    ];

    public $timestamps = false;

    public function role()
    {
        return $this->belongsTo(Role::class, 'target_role_id', 'role_id');
    }

    public function scopeForRole($query, $roleId)
    {
        return $query->where('target_role_id', $roleId);
    }
}

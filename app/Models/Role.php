<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    public const ADMIN = 1;
    public const VERIFIKATOR = 2;
    public const PENGUSUL = 3;
    public const PPK = 4;
    public const WADIR = 5;
    public const BENDAHARA = 6;
    public const REKTORAT = 7;

    protected $table = 'm_roles';

    protected $primaryKey = 'role_id';

    protected $guarded = ['role_id'];

    public $timestamps = false;

    public function users()
    {
        return $this->hasMany(User::class, 'role_id', 'role_id');
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    protected $table = 'm_roles';

    protected $primaryKey = 'role_id';

    protected $guarded = ['role_id'];

    public $timestamps = false;

    public function users()
    {
        return $this->hasMany(User::class, 'role_id', 'role_id');
    }
}

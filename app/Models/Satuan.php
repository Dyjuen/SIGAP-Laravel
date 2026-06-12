<?php

namespace App\Models;

use Database\Factories\SatuanFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Satuan extends Model
{
    /** @use HasFactory<SatuanFactory> */
    use HasFactory, SoftDeletes;

    protected $table = 'm_satuan';

    protected $primaryKey = 'satuan_id';

    protected $fillable = [
        'nama_satuan',
    ];

    protected $appends = ['id'];

    public $timestamps = false;

    public function getIdAttribute()
    {
        return $this->getKey();
    }
}

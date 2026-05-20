<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SpkConfig extends Model
{
    use HasFactory;

    protected $table = 'm_spk_config';

    protected $fillable = [
        'weight_waktu',
        'weight_anggaran',
        'weight_output',
        'weight_lpj',
        'waktu_min',
        'waktu_max',
        'anggaran_min',
        'anggaran_max',
        'output_min',
        'output_max',
        'lpj_min',
        'lpj_max',
        'lpj_penalty_per_day',
    ];

    protected $casts = [
        'weight_waktu' => 'float',
        'weight_anggaran' => 'float',
        'weight_output' => 'float',
        'weight_lpj' => 'float',
        'waktu_min' => 'integer',
        'waktu_max' => 'integer',
        'anggaran_min' => 'integer',
        'anggaran_max' => 'integer',
        'output_min' => 'integer',
        'output_max' => 'integer',
        'lpj_min' => 'integer',
        'lpj_max' => 'integer',
        'lpj_penalty_per_day' => 'integer',
    ];

    /**
     * Get the active SPK configuration, creating a default one if none exists.
     * This provides a self-healing mechanism so there is always a configuration row.
     */
    public static function getActive(): self
    {
        return self::firstOrCreate(
            ['id' => 1],
            [
                'weight_waktu' => 25.00,
                'weight_anggaran' => 25.00,
                'weight_output' => 25.00,
                'weight_lpj' => 25.00,
                'waktu_min' => 50,
                'waktu_max' => 100,
                'anggaran_min' => 50,
                'anggaran_max' => 100,
                'output_min' => 0,
                'output_max' => 100,
                'lpj_min' => 50,
                'lpj_max' => 100,
                'lpj_penalty_per_day' => 5,
            ]
        );
    }
}

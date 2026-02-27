<?php

namespace Database\Factories;

use App\Models\KAK;
use App\Models\KAKAnggaran;
use App\Models\KategoriBelanja;
use App\Models\Satuan;
use Illuminate\Database\Eloquent\Factories\Factory;

class KAKAnggaranFactory extends Factory
{
    protected $model = KAKAnggaran::class;

    public function definition(): array
    {
        return [
            'kak_id' => KAK::factory(),
            'kategori_belanja_id' => KategoriBelanja::first()?->kategori_belanja_id ?? 1,
            'uraian' => $this->faker->sentence(),
            'volume1' => $this->faker->numberBetween(1, 10),
            'satuan1_id' => Satuan::first()?->satuan_id ?? 1,
            'harga_satuan' => $this->faker->numberBetween(100000, 1000000),
            'jumlah_diusulkan' => function (array $attributes) {
                return $attributes['volume1'] * $attributes['harga_satuan'];
            },
        ];
    }
}

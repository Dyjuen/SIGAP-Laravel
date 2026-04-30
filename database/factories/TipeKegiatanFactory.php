<?php

namespace Database\Factories;

use App\Models\TipeKegiatan;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<TipeKegiatan>
 */
class TipeKegiatanFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'nama_tipe' => $this->faker->randomElement(['Utama', 'Pendukung', 'Lainnya']),
        ];
    }
}

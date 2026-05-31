<?php

namespace Database\Factories;

use App\Models\KAK;
use App\Models\Kegiatan;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Kegiatan>
 */
class KegiatanFactory extends Factory
{
    protected $model = Kegiatan::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'kak_id' => KAK::factory(),
            'penanggung_jawab_manual' => $this->faker->name,
            'pelaksana_manual' => $this->faker->name,
            'surat_pengantar_path' => null,
            'lpj_submitted_at' => null,
        ];
    }
}

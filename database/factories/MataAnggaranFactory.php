<?php

namespace Database\Factories;

use App\Models\MataAnggaran;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<MataAnggaran>
 */
class MataAnggaranFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'kode_anggaran' => $this->faker->numerify('###.###.##.####'),
            'nama_sumber_dana' => $this->faker->randomElement(['DIPA', 'PNBP', 'Sponsor']),
            'tahun_anggaran' => (int) $this->faker->year(),
            'total_pagu' => $this->faker->numberBetween(1000000, 100000000),
        ];
    }
}

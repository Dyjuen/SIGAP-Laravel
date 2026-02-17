<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\MataAnggaran>
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

<?php

namespace Database\Factories;

use App\Models\KategoriBelanja;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<KategoriBelanja>
 */
class KategoriBelanjaFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'kode' => $this->faker->unique()->numerify('KB-##'),
            'nama' => $this->faker->words(2, true),
            'keterangan' => $this->faker->sentence(),
            'urutan' => $this->faker->randomDigitNotNull(),
            'is_active' => true,
        ];
    }
}

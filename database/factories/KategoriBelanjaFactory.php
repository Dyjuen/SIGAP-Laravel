<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\KategoriBelanja>
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

<?php

namespace Database\Factories;

use App\Models\Iku;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Iku>
 */
class IkuFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'kode_iku' => 'IKU-'.$this->faker->unique()->numberBetween(1, 9999),
            'nama_iku' => $this->faker->sentence(3),
        ];
    }
}

<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Iku>
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

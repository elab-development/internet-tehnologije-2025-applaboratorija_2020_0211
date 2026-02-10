<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Equipment>
 */
class EquipmentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => $this->faker->word(),
            'manufacturer' => $this->faker->company(),
            'model_number' => strtoupper($this->faker->bothify('MDL-###')),
            'location' => $this->faker->randomElement(['Lab A', 'Lab B', 'Storage']),
            'status' => $this->faker->randomElement(['available', 'reserved', 'maintenance']),
        ];
    }
}

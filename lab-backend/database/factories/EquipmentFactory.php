<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class EquipmentFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name'         => fake()->words(3, true),
            'manufacturer' => fake()->company(),
            'model_number' => strtoupper(fake()->bothify('??-####')),
            'location'     => 'Lab ' . fake()->numerify('##'),
            'status'       => 'available',
        ];
    }

    public function inUse(): static
    {
        return $this->state(fn() => ['status' => 'in-use']);
    }
}

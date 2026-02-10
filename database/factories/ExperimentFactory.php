<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Experiment>
 */
class ExperimentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => $this->faker->sentence(2),
            'protocol' => $this->faker->paragraph(),
            'date_performed' => $this->faker->date(),
            'status' => $this->faker->randomElement(['pending', 'running', 'completed']),
            'project_id' => Project::factory(),
            'user_id' => User::factory(),
        ];
    }
}

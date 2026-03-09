<?php

namespace Database\Factories;

use App\Models\Project;
use Illuminate\Database\Eloquent\Factories\Factory;

class ExperimentFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name'           => fake()->sentence(3),
            'protocol'       => fake()->paragraph(),
            'date_performed' => fake()->date(),
            'status'         => fake()->randomElement(['completed', 'in_progress']),
            'project_id'     => Project::factory(),
        ];
    }

    public function completed(): static
    {
        return $this->state(fn() => ['status' => 'completed']);
    }

    public function inProgress(): static
    {
        return $this->state(fn() => ['status' => 'in_progress']);
    }
}

<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProjectFactory extends Factory
{
    public function definition(): array
    {
        $categories = ['IT', 'Medicine', 'Biology', 'Physics', 'Chemistry', 'Data Science'];

        return [
            'title'       => fake()->sentence(4),
            'code'        => 'PRJ-' . fake()->unique()->numerify('####'),
            'description' => fake()->paragraph(),
            'budget'      => fake()->randomFloat(2, 5000, 200000),
            'category'    => fake()->randomElement($categories),
            'status'      => fake()->randomElement(['planning', 'active', 'completed']),
            'start_date'  => fake()->dateTimeBetween('-1 year', 'now'),
            'end_date'    => fake()->dateTimeBetween('now', '+2 years'),
            'lead_id'     => User::factory()->researcher(),
        ];
    }

    /** Projekat sa statusom 'active' */
    public function active(): static
    {
        return $this->state(fn() => ['status' => 'active']);
    }

    /** Projekat sa određenim vlasnikom */
    public function ownedBy(int $userId): static
    {
        return $this->state(fn() => ['lead_id' => $userId]);
    }
}

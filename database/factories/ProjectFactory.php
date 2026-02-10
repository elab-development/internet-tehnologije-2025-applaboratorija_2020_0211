<?php

namespace Database\Factories;
use Illuminate\Support\Str;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Project>
 */
class ProjectFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'title' => $this->faker->sentence(3),
            'code' => 'PRJ-' . strtoupper(Str::random(8)),

            'description' => $this->faker->paragraph(),
            'budget' => $this->faker->numberBetween(10000, 500000),
            'start_date' => now()->subMonths(rand(1, 12)),
            'end_date' => now()->addMonths(rand(3, 24)),
            'status' => $this->faker->randomElement(['planned', 'active', 'completed']),
            'lead_user_id' => User::factory(),
            'document_path' => 'projects/documents/project_' . Str::random(10) . '.pdf',


        ];
    }
}

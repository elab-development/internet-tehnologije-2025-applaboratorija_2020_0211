<?php

namespace Database\Factories;

use App\Models\Equipment;
use App\Models\Project;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Reservation>
 */
class ReservationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'start_time' => now()->addDays(rand(1, 5)),
            'end_time' => now()->addDays(rand(6, 10)),
            'purpose' => $this->faker->sentence(),
            'status' => $this->faker->randomElement(['pending', 'approved', 'rejected']),
            'user_id' => User::factory(),
            'project_id' => Project::factory(),
            'equipment_id' => Equipment::factory(),


        ];
    }
}

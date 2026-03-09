<?php

namespace Database\Factories;

use App\Models\Equipment;
use App\Models\Project;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ReservationFactory extends Factory
{
    public function definition(): array
    {
        $start = fake()->dateTimeBetween('+1 day', '+30 days');
        $end   = (clone $start)->modify('+4 hours');

        return [
            'start_time'   => $start,
            'end_time'     => $end,
            'purpose'      => fake()->sentence(),
            'status'       => 'pending',
            'equipment_id' => Equipment::factory(),
            'project_id'   => Project::factory(),
            'user_id'      => User::factory()->researcher(),
        ];
    }
}

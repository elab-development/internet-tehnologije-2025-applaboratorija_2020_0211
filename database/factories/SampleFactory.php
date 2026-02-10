<?php

namespace Database\Factories;
use App\Models\Experiment;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Sample>
 */
class SampleFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'code' => strtoupper(
                $this->faker->unique()->bothify('SMP-#####')
            ),            'type' => $this->faker->randomElement(['blood', 'tissue', 'dna']),
            'source' => $this->faker->word(),
            'location' => $this->faker->word(),
            'metadata' => [
                'volume' => $this->faker->numberBetween(1, 100) . 'ml',
                'temperature' => $this->faker->randomElement(['-20C', '-80C']),
            ],
            'experiment_id' => Experiment::factory(),
        ];
    }
}

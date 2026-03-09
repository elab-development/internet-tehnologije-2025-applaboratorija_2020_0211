<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name'              => fake()->name(),
            'email'             => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password'          => Hash::make('password'),
            'remember_token'    => Str::random(10),
            'role'              => 'user',   // default uloga
            'is_active'         => true,
        ];
    }

    // ─── State metode za specifične uloge ────────────────────────

    /** Kreira Admin korisnika */
    public function admin(): static
    {
        return $this->state(fn() => ['role' => 'admin']);
    }

    /** Kreira Researcher korisnika */
    public function researcher(): static
    {
        return $this->state(fn() => ['role' => 'researcher']);
    }

    /** Kreira neaktivnog korisnika */
    public function inactive(): static
    {
        return $this->state(fn() => ['is_active' => false]);
    }
}

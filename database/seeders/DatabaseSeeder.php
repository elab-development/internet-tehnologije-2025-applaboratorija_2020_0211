<?php

namespace Database\Seeders;

use App\Models\Favorite;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

use App\Models\Equipment;
use App\Models\Experiment;
use App\Models\Project;
use App\Models\Reservation;
use App\Models\Role;
use App\Models\Sample;
use Illuminate\Support\Facades\Hash;



class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $adminRole = Role::firstOrCreate(['name' => 'admin']);
        $researcherRole = Role::firstOrCreate(['name' => 'researcher']);
        $userRole = Role::firstOrCreate(['name' => 'user']);
        $admin = User::factory()->create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
            'role_id' => $adminRole->id,
        ]);
        $users=User::factory(20)->create();
        $leaders = User::whereHas('role', function ($q) {
            $q->whereIn('name', ['admin', 'researcher']);
        })->get();
        $projects = Project::factory(30)->create([
            'lead_user_id' => $leaders->random()->id,
        ]);
        $projects->each(function ($project) use ($users) {
            $project->members()->attach(
                $users->random(rand(2, 5))->pluck('id'),
                ['date_joined' => now()]
            );
        });
        Experiment::factory(40)
            ->has(Sample::factory(10))
            ->create();

        $reservation = Reservation::factory(100)->create();

        $equipment = Equipment::factory(20)->create();
        Favorite::factory(40)->create();


    }
}

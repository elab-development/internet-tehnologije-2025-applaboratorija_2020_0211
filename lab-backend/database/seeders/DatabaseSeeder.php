<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Project;
use App\Models\Experiment;
use App\Models\Sample;
use App\Models\Equipment;
use App\Models\Reservation;
use App\Models\Favorite;
use App\Models\Report;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Create admin user
        $admin = User::create([
            'name'     => 'Admin Korisnik',
            'email'    => 'admin@researchhub.local',
            'password' => Hash::make('password'),
            'role'     => 'admin',
            'is_active' => true,
        ]);

        // Create researcher users
        $researcher1 = User::create([
            'name'     => 'Prof. Dr. Marko Marković',
            'email'    => 'marko.markovic@researchhub.local',
            'password' => Hash::make('password'),
            'role'     => 'researcher',
            'is_active' => true,
        ]);

        $researcher2 = User::create([
            'name'     => 'Dr. Ana Anić',
            'email'    => 'ana.anic@researchhub.local',
            'password' => Hash::make('password'),
            'role'     => 'researcher',
            'is_active' => true,
        ]);

        // Create regular users
        $user1 = User::create([
            'name'     => 'Petar Petrović',
            'email'    => 'petar.petrovic@researchhub.local',
            'password' => Hash::make('password'),
            'role'     => 'user',
            'is_active' => true,
        ]);

        $user2 = User::create([
            'name'     => 'Jelena Jovanović',
            'email'    => 'jelena.jovanovic@researchhub.local',
            'password' => Hash::make('password'),
            'role'     => 'user',
            'is_active' => true,
        ]);

        // Create projects
        $project1 = Project::create([
            'title'       => 'Istraživanje nano-čestića',
            'code'        => 'NANO-2025-001',
            'description' => 'Istraživanje svojstava i primene nano-čestića u medicini.',
            'budget'      => 150000.00,
            'category'    => 'research',
            'status'      => 'active',
            'start_date'  => now()->subMonths(3),
            'end_date'    => now()->addMonths(9),
            'lead_id'     => $researcher1->id,
        ]);

        $project2 = Project::create([
            'title'       => 'Razvoj biološkog senzora',
            'code'        => 'BIO-SENSOR-2025',
            'description' => 'Razvoj novog tipa biološkog senzora za detektovanje patogena.',
            'budget'      => 200000.00,
            'category'    => 'development',
            'status'      => 'planning',
            'start_date'  => now()->addMonths(1),
            'end_date'    => now()->addMonths(13),
            'lead_id'     => $researcher2->id,
        ]);

        $project3 = Project::create([
            'title'       => 'Testiranje polimera',
            'code'        => 'POLYMER-TEST-2025',
            'description' => 'Testiranje mehaničkih svojstava novih polimera.',
            'budget'      => 75000.00,
            'category'    => 'testing',
            'status'      => 'completed',
            'start_date'  => now()->subMonths(12),
            'end_date'    => now()->subMonths(2),
            'lead_id'     => $researcher1->id,
        ]);

        // Add members to projects
        $project1->members()->attach([$researcher1->id => ['date_joined' => now()], $user1->id => ['date_joined' => now()], $user2->id => ['date_joined' => now()]]);
        $project2->members()->attach([$researcher2->id => ['date_joined' => now()], $user1->id => ['date_joined' => now()]]);
        $project3->members()->attach([$researcher1->id => ['date_joined' => now()], $user2->id => ['date_joined' => now()]]);

        // Create experiments
        $exp1 = Experiment::create([
            'name'           => 'Sinteza nano-čestića - pokus 1',
            'protocol'       => 'Korišćen sol-gel metod sa preciznom temperaturnom kontrolom.',
            'date_performed' => now()->subMonths(2),
            'status'         => 'completed',
            'project_id'     => $project1->id,
        ]);

        $exp2 = Experiment::create([
            'name'           => 'Karakterizacija svojstava nano-čestića',
            'protocol'       => 'SEM, TEM i spektroskopska analiza.',
            'date_performed' => now()->subMonth(),
            'status'         => 'completed',
            'project_id'     => $project1->id,
        ]);

        $exp3 = Experiment::create([
            'name'           => 'Preliminarni testovi biološkog senzora',
            'protocol'       => 'In vitro testovi sa poznatim antigenima.',
            'date_performed' => now(),
            'status'         => 'in_progress',
            'project_id'     => $project2->id,
        ]);

        // Create samples
        Sample::create([
            'code'           => 'NANO-001-A',
            'type'           => 'TiO2 nano-čestice',
            'source'         => 'Sol-gel sinteza',
            'location'       => 'Lab 101 - Frižider A',
            'metadata'       => json_encode(['diameter' => '20 nm', 'concentration' => '100 mg/ml']),
            'experiment_id'  => $exp1->id,
        ]);

        Sample::create([
            'code'           => 'NANO-002-B',
            'type'           => 'Au nano-čestice',
            'source'         => 'Sol-gel sinteza',
            'location'       => 'Lab 101 - Frižider B',
            'metadata'       => json_encode(['diameter' => '50 nm', 'concentration' => '50 mg/ml']),
            'experiment_id'  => $exp1->id,
        ]);

        Sample::create([
            'code'           => 'BIO-001-A',
            'type'           => 'Proteinski ekstract',
            'source'         => 'E. coli kultura',
            'location'       => 'Lab 203 - Frižider A',
            'metadata'       => json_encode(['concentration' => '5 mg/ml', 'purity' => '95%']),
            'experiment_id'  => $exp3->id,
        ]);

        // Create equipment
        $eq1 = Equipment::create([
            'name'           => 'Rastresna Elektronska Mikroskopija (SEM)',
            'manufacturer'   => 'JEOL',
            'model_number'   => 'JSM-7600F',
            'location'       => 'Lab 301',
            'status'         => 'available',
        ]);

        $eq2 = Equipment::create([
            'name'           => 'Transmisiona Elektronska Mikroskopija (TEM)',
            'manufacturer'   => 'FEI',
            'model_number'   => 'Tecnai F20',
            'location'       => 'Lab 302',
            'status'         => 'in_use',
        ]);

        $eq3 = Equipment::create([
            'name'           => 'HPLC sistem',
            'manufacturer'   => 'Agilent',
            'model_number'   => '1260 Infinity',
            'location'       => 'Lab 103',
            'status'         => 'available',
        ]);

        $eq4 = Equipment::create([
            'name'           => 'UV-Vis spektrofotometar',
            'manufacturer'   => 'PerkinElmer',
            'model_number'   => 'Lambda 35',
            'location'       => 'Lab 104',
            'status'         => 'maintenance',
        ]);

        // Create reservations
        Reservation::create([
            'start_time'    => now()->addDays(1)->setHour(9)->setMinute(0),
            'end_time'      => now()->addDays(1)->setHour(12)->setMinute(0),
            'purpose'       => 'Analiza nano-čestića pod SEM-om',
            'status'        => 'approved',
            'equipment_id'  => $eq1->id,
            'project_id'    => $project1->id,
            'user_id'       => $user1->id,
        ]);

        Reservation::create([
            'start_time'    => now()->addDays(3)->setHour(14)->setMinute(0),
            'end_time'      => now()->addDays(3)->setHour(16)->setMinute(0),
            'purpose'       => 'HPLC analiza uzoraka',
            'status'        => 'pending',
            'equipment_id'  => $eq3->id,
            'project_id'    => $project2->id,
            'user_id'       => $researcher2->id,
        ]);

        Reservation::create([
            'start_time'    => now()->addDays(5)->setHour(10)->setMinute(0),
            'end_time'      => now()->addDays(5)->setHour(11)->setMinute(30),
            'purpose'       => 'UV-Vis merenja',
            'status'        => 'rejected',
            'equipment_id'  => $eq4->id,
            'project_id'    => $project1->id,
            'user_id'       => $user2->id,
        ]);

        // Create favorites
        Favorite::create([
            'user_id'    => $user1->id,
            'project_id' => $project1->id,
        ]);

        Favorite::create([
            'user_id'    => $user1->id,
            'project_id' => $project2->id,
        ]);

        Favorite::create([
            'user_id'    => $user2->id,
            'project_id' => $project1->id,
        ]);

        // Create reports
        Report::create([
            'description' => 'Napredak na istraživanju nano-čestića. Sintetizovane su tri nove vrste nano-čestića sa različitim veličinama. Rezultati su zadovoljavajući i u skladu sa očekivanjima.',
            'status'      => 'submitted',
            'user_id'     => $researcher1->id,
            'project_id'  => $project1->id,
        ]);

        Report::create([
            'description' => 'Preliminarni rezultati testiranja biološkog senzora pokazuju obečavajuće rezultate. Potrebni su dodatni eksperimenti za potvrdu specifičnosti.',
            'status'      => 'reviewed',
            'user_id'     => $researcher2->id,
            'project_id'  => $project2->id,
        ]);

        Report::create([
            'description' => 'Završeni testovi mehaničkih svojstava polimera. Svi rezultati su dokumentovani i uključeni u završni izveštaj.',
            'status'      => 'approved',
            'user_id'     => $researcher1->id,
            'project_id'  => $project3->id,
        ]);
    }
}

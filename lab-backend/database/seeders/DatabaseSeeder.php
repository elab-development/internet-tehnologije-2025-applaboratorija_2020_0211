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
        $admin = User::firstOrCreate(
            ['email' => 'admin@researchhub.local'],
            [
                'name'      => 'Admin Korisnik',
                'password'  => Hash::make('password'),
                'role'      => 'admin',
                'is_active' => true,
            ]
        );

        // Create researcher users
        $researcher1 = User::firstOrCreate(
            ['email' => 'marko.markovic@researchhub.local'],
            [
                'name'      => 'Prof. Dr. Marko Marković',
                'password'  => Hash::make('password'),
                'role'      => 'researcher',
                'is_active' => true,
            ]
        );

        $researcher2 = User::firstOrCreate(
            ['email' => 'ana.anic@researchhub.local'],
            [
                'name'      => 'Dr. Ana Anić',
                'password'  => Hash::make('password'),
                'role'      => 'researcher',
                'is_active' => true,
            ]
        );

        // Create regular users
        $user1 = User::firstOrCreate(
            ['email' => 'petar.petrovic@researchhub.local'],
            [
                'name'      => 'Petar Petrović',
                'password'  => Hash::make('password'),
                'role'      => 'user',
                'is_active' => true,
            ]
        );

        $user2 = User::firstOrCreate(
            ['email' => 'jelena.jovanovic@researchhub.local'],
            [
                'name'      => 'Jelena Jovanović',
                'password'  => Hash::make('password'),
                'role'      => 'user',
                'is_active' => true,
            ]
        );

        // Create projects
        $project1 = Project::firstOrCreate(
            ['code' => 'NANO-2025-001'],
            [
                'title'         => 'Istraživanje nano-čestića',
                'description'   => 'Istraživanje svojstava i primene nano-čestića u medicini.',
                'budget'        => 150000.00,
                'category'      => 'research',
                'status'        => 'active',
                'start_date'    => now()->subMonths(3),
                'end_date'      => now()->addMonths(9),
                'lead_id'       => $researcher1->id,
                'document_path' => 'projects/nano-cestice-istrazivanje.pdf',
            ]
        );

        $project2 = Project::firstOrCreate(
            ['code' => 'BIO-SENSOR-2025'],
            [
                'title'         => 'Razvoj biološkog senzora',
                'description'   => 'Razvoj novog tipa biološkog senzora za detektovanje patogena.',
                'budget'        => 200000.00,
                'category'      => 'development',
                'status'        => 'planning',
                'start_date'    => now()->addMonths(1),
                'end_date'      => now()->addMonths(13),
                'lead_id'       => $researcher2->id,
                'document_path' => 'projects/bio-senzor-razvoj.pdf',
            ]
        );

        $project3 = Project::firstOrCreate(
            ['code' => 'POLYMER-TEST-2025'],
            [
                'title'         => 'Testiranje polimera',
                'description'   => 'Testiranje mehaničkih svojstava novih polimera.',
                'budget'        => 75000.00,
                'category'      => 'testing',
                'status'        => 'completed',
                'start_date'    => now()->subMonths(12),
                'end_date'      => now()->subMonths(2),
                'lead_id'       => $researcher1->id,
                'document_path' => 'projects/polimeri-testiranje.pdf',
            ]
        );

        // Add members to projects (syncWithoutDetaching avoids duplicate key errors on re-seed)
        $project1->members()->syncWithoutDetaching([$researcher1->id => ['date_joined' => now()], $user1->id => ['date_joined' => now()], $user2->id => ['date_joined' => now()]]);
        $project2->members()->syncWithoutDetaching([$researcher2->id => ['date_joined' => now()], $user1->id => ['date_joined' => now()]]);
        $project3->members()->syncWithoutDetaching([$researcher1->id => ['date_joined' => now()], $user2->id => ['date_joined' => now()]]);

        // Create experiments
        $exp1 = Experiment::firstOrCreate(
            ['name' => 'Sinteza nano-čestića - pokus 1', 'project_id' => $project1->id],
            [
                'protocol'       => 'Korišćen sol-gel metod sa preciznom temperaturnom kontrolom.',
                'date_performed' => now()->subMonths(2),
                'status'         => 'completed',
            ]
        );

        $exp2 = Experiment::firstOrCreate(
            ['name' => 'Karakterizacija svojstava nano-čestića', 'project_id' => $project1->id],
            [
                'protocol'       => 'SEM, TEM i spektroskopska analiza.',
                'date_performed' => now()->subMonth(),
                'status'         => 'completed',
            ]
        );

        $exp3 = Experiment::firstOrCreate(
            ['name' => 'Preliminarni testovi biološkog senzora', 'project_id' => $project2->id],
            [
                'protocol'       => 'In vitro testovi sa poznatim antigenima.',
                'date_performed' => now(),
                'status'         => 'in_progress',
            ]
        );

        // Create samples
        Sample::firstOrCreate(
            ['code' => 'NANO-001-A'],
            [
                'type'          => 'TiO2 nano-čestice',
                'source'        => 'Sol-gel sinteza',
                'location'      => 'Lab 101 - Frižider A',
                'metadata'      => json_encode(['diameter' => '20 nm', 'concentration' => '100 mg/ml']),
                'experiment_id' => $exp1->id,
            ]
        );

        Sample::firstOrCreate(
            ['code' => 'NANO-002-B'],
            [
                'type'          => 'Au nano-čestice',
                'source'        => 'Sol-gel sinteza',
                'location'      => 'Lab 101 - Frižider B',
                'metadata'      => json_encode(['diameter' => '50 nm', 'concentration' => '50 mg/ml']),
                'experiment_id' => $exp1->id,
            ]
        );

        Sample::firstOrCreate(
            ['code' => 'BIO-001-A'],
            [
                'type'          => 'Proteinski ekstract',
                'source'        => 'E. coli kultura',
                'location'      => 'Lab 203 - Frižider A',
                'metadata'      => json_encode(['concentration' => '5 mg/ml', 'purity' => '95%']),
                'experiment_id' => $exp3->id,
            ]
        );

        // Create equipment
        $eq1 = Equipment::firstOrCreate(
            ['model_number' => 'JSM-7600F'],
            [
                'name'         => 'Rastresna Elektronska Mikroskopija (SEM)',
                'manufacturer' => 'JEOL',
                'location'     => 'Lab 301',
                'status'       => 'available',
            ]
        );

        $eq2 = Equipment::firstOrCreate(
            ['model_number' => 'Tecnai F20'],
            [
                'name'         => 'Transmisiona Elektronska Mikroskopija (TEM)',
                'manufacturer' => 'FEI',
                'location'     => 'Lab 302',
                'status'       => 'in_use',
            ]
        );

        $eq3 = Equipment::firstOrCreate(
            ['model_number' => '1260 Infinity'],
            [
                'name'         => 'HPLC sistem',
                'manufacturer' => 'Agilent',
                'location'     => 'Lab 103',
                'status'       => 'available',
            ]
        );

        $eq4 = Equipment::firstOrCreate(
            ['model_number' => 'Lambda 35'],
            [
                'name'         => 'UV-Vis spektrofotometar',
                'manufacturer' => 'PerkinElmer',
                'location'     => 'Lab 104',
                'status'       => 'maintenance',
            ]
        );

        // Create reservations
        Reservation::firstOrCreate(
            ['equipment_id' => $eq1->id, 'user_id' => $user1->id, 'purpose' => 'Analiza nano-čestića pod SEM-om'],
            [
                'start_time'   => now()->addDays(1)->setHour(9)->setMinute(0),
                'end_time'     => now()->addDays(1)->setHour(12)->setMinute(0),
                'status'       => 'approved',
                'project_id'   => $project1->id,
            ]
        );

        Reservation::firstOrCreate(
            ['equipment_id' => $eq3->id, 'user_id' => $researcher2->id, 'purpose' => 'HPLC analiza uzoraka'],
            [
                'start_time'   => now()->addDays(3)->setHour(14)->setMinute(0),
                'end_time'     => now()->addDays(3)->setHour(16)->setMinute(0),
                'status'       => 'pending',
                'project_id'   => $project2->id,
            ]
        );

        Reservation::firstOrCreate(
            ['equipment_id' => $eq4->id, 'user_id' => $user2->id, 'purpose' => 'UV-Vis merenja'],
            [
                'start_time'   => now()->addDays(5)->setHour(10)->setMinute(0),
                'end_time'     => now()->addDays(5)->setHour(11)->setMinute(30),
                'status'       => 'rejected',
                'project_id'   => $project1->id,
            ]
        );

        // Create favorites
        Favorite::firstOrCreate(['user_id' => $user1->id, 'project_id' => $project1->id]);
        Favorite::firstOrCreate(['user_id' => $user1->id, 'project_id' => $project2->id]);
        Favorite::firstOrCreate(['user_id' => $user2->id, 'project_id' => $project1->id]);

        // Create reports
        Report::firstOrCreate(
            ['user_id' => $researcher1->id, 'project_id' => $project1->id],
            [
                'description' => 'Napredak na istraživanju nano-čestića. Sintetizovane su tri nove vrste nano-čestića sa različitim veličinama. Rezultati su zadovoljavajući i u skladu sa očekivanjima.',
                'status'      => 'submitted',
            ]
        );

        Report::firstOrCreate(
            ['user_id' => $researcher2->id, 'project_id' => $project2->id],
            [
                'description' => 'Preliminarni rezultati testiranja biološkog senzora pokazuju obečavajuće rezultate. Potrebni su dodatni eksperimenti za potvrdu specifičnosti.',
                'status'      => 'reviewed',
            ]
        );

        Report::firstOrCreate(
            ['user_id' => $researcher1->id, 'project_id' => $project3->id],
            [
                'description' => 'Završeni testovi mehaničkih svojstava polimera. Svi rezultati su dokumentovani i uključeni u završni izveštaj.',
                'status'      => 'approved',
            ]
        );
    }
}

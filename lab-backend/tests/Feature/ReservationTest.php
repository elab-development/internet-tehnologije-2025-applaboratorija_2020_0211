<?php

namespace Tests\Feature;

use App\Models\Equipment;
use App\Models\Project;
use App\Models\Reservation;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

/**
 * Testovi za rezervacije opreme
 * Pokriva: SK27, SK28, konflikt rezervacija
 */
class ReservationTest extends TestCase
{
    use RefreshDatabase;

    private User $researcher;
    private Equipment $equipment;
    private Project $project;

    protected function setUp(): void
    {
        parent::setUp();

        $this->researcher = User::factory()->researcher()->create();
        $this->equipment  = Equipment::factory()->create(['status' => 'available']);
        $this->project    = Project::factory()->create([
            'lead_id' => $this->researcher->id,
        ]);

        Sanctum::actingAs($this->researcher);
    }

    // ─── KREIRANJE REZERVACIJE ───────────────────────────────────

    /** @test */
    public function test_researcher_can_create_reservation(): void
    {
        $response = $this->postJson('/api/reservations', [
            'equipment_id' => $this->equipment->id,
            'project_id'   => $this->project->id,
            'start_time'   => now()->addDay()->format('Y-m-d H:i:s'),
            'end_time'     => now()->addDay()->addHours(4)->format('Y-m-d H:i:s'),
            'purpose'      => 'PCR analiza uzoraka',
        ]);

        $response->assertStatus(201)
                 ->assertJsonStructure([
                     'data' => ['id', 'start_time', 'end_time', 'equipment', 'project'],
                 ]);

        $this->assertDatabaseHas('reservations', [
            'equipment_id' => $this->equipment->id,
            'user_id'      => $this->researcher->id,
        ]);
    }

    /**
     * @test
     * SK27 – Sistem sprečava preklapanje rezervacija
     */
    public function test_overlapping_reservation_returns_422(): void
    {
        // Kreirati prvu rezervaciju
        Reservation::factory()->create([
            'equipment_id' => $this->equipment->id,
            'project_id'   => $this->project->id,
            'user_id'      => $this->researcher->id,
            'start_time'   => now()->addDay()->setHour(9)->setMinute(0),
            'end_time'     => now()->addDay()->setHour(17)->setMinute(0),
            'status'       => 'pending',
        ]);

        // Pokušaj da se kreira preuzimajuća rezervacija (9-17 vs 12-20 = konflikt)
        $response = $this->postJson('/api/reservations', [
            'equipment_id' => $this->equipment->id,
            'project_id'   => $this->project->id,
            'start_time'   => now()->addDay()->setHour(12)->setMinute(0)->format('Y-m-d H:i:s'),
            'end_time'     => now()->addDay()->setHour(20)->setMinute(0)->format('Y-m-d H:i:s'),
            'purpose'      => 'Pokušaj konflikta',
        ]);

        $response->assertStatus(422)
                 ->assertJsonPath('message', 'Oprema je zarezervirana u tom vremenu.');
    }

    /** @test */
    public function test_non_overlapping_reservation_is_allowed(): void
    {
        // Kreirati prvu rezervaciju 9-12
        Reservation::factory()->create([
            'equipment_id' => $this->equipment->id,
            'project_id'   => $this->project->id,
            'user_id'      => $this->researcher->id,
            'start_time'   => now()->addDay()->setHour(9)->setMinute(0),
            'end_time'     => now()->addDay()->setHour(12)->setMinute(0),
            'status'       => 'pending',
        ]);

        // Kreirati drugu rezervaciju 14-17 (bez konflikta)
        $response = $this->postJson('/api/reservations', [
            'equipment_id' => $this->equipment->id,
            'project_id'   => $this->project->id,
            'start_time'   => now()->addDay()->setHour(14)->setMinute(0)->format('Y-m-d H:i:s'),
            'end_time'     => now()->addDay()->setHour(17)->setMinute(0)->format('Y-m-d H:i:s'),
            'purpose'      => 'Bez konflikta',
        ]);

        $response->assertStatus(201);
    }

    // ─── OTKAZIVANJE REZERVACIJE ─────────────────────────────────

    /** @test */
    public function test_researcher_can_cancel_own_reservation(): void
    {
        $reservation = Reservation::factory()->create([
            'equipment_id' => $this->equipment->id,
            'project_id'   => $this->project->id,
            'user_id'      => $this->researcher->id,
            'start_time'   => now()->addDay(),
            'end_time'     => now()->addDay()->addHours(4),
        ]);

        $response = $this->deleteJson("/api/reservations/{$reservation->id}");

        $response->assertStatus(200);
        $this->assertDatabaseMissing('reservations', ['id' => $reservation->id]);
    }

    /**
     * @test
     * BEZBEDNOST: IDOR – ne može otkazati tuđu rezervaciju
     */
    public function test_researcher_cannot_cancel_others_reservation(): void
    {
        $otherResearcher = User::factory()->researcher()->create();

        $reservation = Reservation::factory()->create([
            'equipment_id' => $this->equipment->id,
            'project_id'   => $this->project->id,
            'user_id'      => $otherResearcher->id, // tuđa rezervacija
            'start_time'   => now()->addDay(),
            'end_time'     => now()->addDay()->addHours(4),
        ]);

        $response = $this->deleteJson("/api/reservations/{$reservation->id}");

        $response->assertStatus(403);
        $this->assertDatabaseHas('reservations', ['id' => $reservation->id]);
    }

    /** @test */
    public function test_reservation_requires_future_start_time(): void
    {
        $response = $this->postJson('/api/reservations', [
            'equipment_id' => $this->equipment->id,
            'project_id'   => $this->project->id,
            'start_time'   => now()->subDay()->format('Y-m-d H:i:s'), // prošlost
            'end_time'     => now()->addDay()->format('Y-m-d H:i:s'),
            'purpose'      => 'Test prošlost',
        ]);

        $response->assertStatus(422);
    }
}

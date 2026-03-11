<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

/**
 * Testovi za upravljanje projektima
 * Pokriva: CRUD, IDOR zaštita, pretraga, filtriranje
 */
class ProjectTest extends TestCase
{
    use RefreshDatabase;

    // ─── KREIRANJE PROJEKTA ──────────────────────────────────────

    /** @test */
    public function test_researcher_can_create_project(): void
    {
        $researcher = User::factory()->researcher()->create();
        Sanctum::actingAs($researcher);

        $response = $this->postJson('/api/projects', [
            'title'       => 'Moj istraživački projekat',
            'code'        => 'PRJ-TEST-001',
            'description' => 'Opis projekta',
            'budget'      => 50000,
            'category'    => 'IT',
            'status'      => 'active',
            'start_date'  => '2025-01-01',
            'end_date'    => '2026-01-01',
        ]);

        $response->assertStatus(201)
                 ->assertJsonPath('data.title', 'Moj istraživački projekat')
                 ->assertJsonPath('data.leader.id', $researcher->id);

        $this->assertDatabaseHas('projects', [
            'title'   => 'Moj istraživački projekat',
            'lead_id' => $researcher->id,
        ]);
    }

    /** @test */
    public function test_regular_user_cannot_create_project(): void
    {
        $user = User::factory()->create(['role' => 'user']);
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/projects', [
            'title' => 'Neautorizovan projekat',
            'code'  => 'PRJ-BAD-001',
        ]);

        // User dobija 403 – nema pravo
        $response->assertStatus(403);
        $this->assertDatabaseMissing('projects', ['title' => 'Neautorizovan projekat']);
    }

    /** @test */
    public function test_project_creation_requires_unique_code(): void
    {
        $researcher = User::factory()->researcher()->create();
        Project::factory()->create(['code' => 'DUPLIKAT-001', 'lead_id' => $researcher->id]);

        Sanctum::actingAs($researcher);

        $response = $this->postJson('/api/projects', [
            'title'  => 'Novi projekat',
            'code'   => 'DUPLIKAT-001', // već postoji
            'status' => 'active',
        ]);

        $response->assertStatus(422);
    }

    /** @test */
    public function test_researcher_can_upload_pdf_to_project(): void
    {
        Storage::fake('public');

        $researcher = User::factory()->researcher()->create();
        Sanctum::actingAs($researcher);

        $file = UploadedFile::fake()->create('paper.pdf', 500, 'application/pdf');

        $response = $this->postJson('/api/projects', [
            'title'       => 'Projekat sa PDF-om',
            'code'        => 'PRJ-PDF-001',
            'description' => 'Opis projekta sa PDF dokumentom',
            'budget'      => 10000,
            'category'    => 'IT',
            'status'      => 'active',
            'start_date'  => '2025-01-01',
            'end_date'    => '2026-01-01',
            'document'    => $file,
        ]);

        $response->assertStatus(201);

        // Proveri da je fajl sačuvan
        $documentPath = $response->json('data.document_url');
        $this->assertNotNull($documentPath);
    }

    // ─── IDOR ZAŠTITA ────────────────────────────────────────────

    /**
     * @test
     * BEZBEDNOST: IDOR – researcher ne može menjati tuđi projekat
     */
    public function test_researcher_cannot_update_others_project(): void
    {
        $owner     = User::factory()->researcher()->create();
        $attacker  = User::factory()->researcher()->create();
        $project   = Project::factory()->create(['lead_id' => $owner->id]);

        // Napadač se prijavljuje i pokušava da izmeni tuđi projekat
        Sanctum::actingAs($attacker);

        $response = $this->putJson("/api/projects/{$project->id}", [
            'title' => 'Hakovan naslov',
        ]);

        $response->assertStatus(403);

        // Projekat nije promenjen
        $this->assertDatabaseMissing('projects', ['title' => 'Hakovan naslov']);
        $this->assertDatabaseHas('projects', ['id' => $project->id, 'title' => $project->title]);
    }

    /** @test */
    public function test_admin_can_update_any_project(): void
    {
        $owner   = User::factory()->researcher()->create();
        $admin   = User::factory()->admin()->create();
        $project = Project::factory()->create(['lead_id' => $owner->id]);

        Sanctum::actingAs($admin);

        $response = $this->putJson("/api/projects/{$project->id}", [
            'title' => 'Admin izmena',
        ]);

        $response->assertStatus(200)
                 ->assertJsonPath('data.title', 'Admin izmena');
    }

    /**
     * @test
     * BEZBEDNOST: IDOR – researcher ne može brisati tuđi projekat
     */
    public function test_researcher_cannot_delete_others_project(): void
    {
        $owner    = User::factory()->researcher()->create();
        $attacker = User::factory()->researcher()->create();
        $project  = Project::factory()->create(['lead_id' => $owner->id]);

        Sanctum::actingAs($attacker);

        $response = $this->deleteJson("/api/projects/{$project->id}");

        $response->assertStatus(403);

        // Projekat još uvek postoji
        $this->assertDatabaseHas('projects', ['id' => $project->id]);
    }

    /** @test */
    public function test_researcher_can_delete_own_project(): void
    {
        $researcher = User::factory()->researcher()->create();
        $project    = Project::factory()->create(['lead_id' => $researcher->id]);

        Sanctum::actingAs($researcher);

        $response = $this->deleteJson("/api/projects/{$project->id}");

        $response->assertStatus(200);
        $this->assertDatabaseMissing('projects', ['id' => $project->id]);
    }

    // ─── PRETRAGA I FILTRIRANJE ──────────────────────────────────

    /** @test */
    public function test_search_returns_matching_projects(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        // Kreirati projekat koji odgovara pretrazi
        Project::factory()->create([
            'title'   => 'Veštačka inteligencija u medicini',
            'lead_id' => User::factory()->researcher()->create()->id,
        ]);

        // Kreirati projekat koji NE odgovara
        Project::factory()->create([
            'title'   => 'Hemija polimera',
            'lead_id' => User::factory()->researcher()->create()->id,
        ]);

        $response = $this->getJson('/api/projects/search?q=inteligencija');

        $response->assertStatus(200);

        $data = $response->json('data');
        $this->assertCount(1, $data);
        $this->assertStringContainsString('inteligencija', strtolower($data[0]['title']));
    }

    /** @test */
    public function test_filter_by_category_returns_correct_projects(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $lead = User::factory()->researcher()->create();

        Project::factory()->create(['category' => 'IT',       'title' => 'IT Projekat jedan', 'lead_id' => $lead->id]);
        Project::factory()->create(['category' => 'IT',       'title' => 'IT Projekat dva',   'lead_id' => $lead->id]);
        Project::factory()->create(['category' => 'Medicine', 'title' => 'Medicine projekat', 'lead_id' => $lead->id]);

        $response = $this->getJson('/api/projects/search?q=IT+Projekat');

        $response->assertStatus(200);

        $data = $response->json('data');
        $this->assertNotEmpty($data);
        foreach ($data as $project) {
            $this->assertEquals('IT', $project['category']);
        }
    }

    /** @test */
    public function test_search_returns_empty_when_no_match(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        Project::factory()->create([
            'title'   => 'Nešto sasvim drugo',
            'lead_id' => User::factory()->researcher()->create()->id,
        ]);

        $response = $this->getJson('/api/projects/search?q=kvantni_teleport_xyz');

        $response->assertStatus(200)
                 ->assertJsonPath('data', []);
    }

    // ─── ROLE-BASED PRISTUP ──────────────────────────────────────

    /** @test */
    public function test_unauthenticated_user_cannot_access_projects(): void
    {
        $response = $this->getJson('/api/projects');

        $response->assertStatus(401);
    }
}

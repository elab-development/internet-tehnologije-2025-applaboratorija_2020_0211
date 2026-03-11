<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\RateLimiter;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

/**
 * Testovi bezbednosnih mera
 * Pokriva: Rate Limiting, IDOR, Role enforcement, XSS sanitizacija
 */
class SecurityTest extends TestCase
{
    use RefreshDatabase;

    // ─── RATE LIMITING ───────────────────────────────────────────

    /**
     * @test
     * BEZBEDNOST: Brute Force zaštita – login rate limiter
     */
    public function test_login_rate_limiter_blocks_after_limit(): void
    {
        // Resetuj rate limiter pre testa
        RateLimiter::clear('login');

        User::factory()->create(['email' => 'victim@test.com']);

        // Pošalji 10 neuspelih pokušaja (limit je 10/min)
        for ($i = 0; $i < 10; $i++) {
            $this->postJson('/api/login', [
                'email'    => 'victim@test.com',
                'password' => 'wrong_password_' . $i,
            ]);
        }

        // 11. zahtev treba da bude blokiran
        $response = $this->postJson('/api/login', [
            'email'    => 'victim@test.com',
            'password' => 'wrong_password_again',
        ]);

        $response->assertStatus(429); // Too Many Requests
    }

    // ─── ROLE ENFORCEMENT ────────────────────────────────────────

    /**
     * @test
     * BEZBEDNOST: Korisnik sa 'user' ulogom ne može pristupiti admin rutama
     */
    public function test_user_cannot_access_admin_routes(): void
    {
        $user = User::factory()->create(['role' => 'user']);
        Sanctum::actingAs($user);

        $response = $this->getJson('/api/users');

        $response->assertStatus(403);
    }

    /**
     * @test
     * BEZBEDNOST: Researcher ne može pristupiti admin rutama
     */
    public function test_researcher_cannot_access_admin_user_management(): void
    {
        $researcher = User::factory()->researcher()->create();
        Sanctum::actingAs($researcher);

        // Researcher ne može listati korisnike
        $this->getJson('/api/users')->assertStatus(403);

        // Researcher ne može brisati korisnike
        $someUser = User::factory()->create();
        $this->deleteJson("/api/users/{$someUser->id}")->assertStatus(403);
    }

    /**
     * @test
     * BEZBEDNOST: Neautentifikovan zahtev uvek dobija 401
     */
    public function test_all_protected_routes_require_authentication(): void
    {
        $protectedRoutes = [
            ['GET',  '/api/me'],
            ['GET',  '/api/projects'],
            ['GET',  '/api/equipment'],
            ['GET',  '/api/favorites'],
            ['POST', '/api/logout'],
        ];

        foreach ($protectedRoutes as [$method, $url]) {
            $response = $this->json($method, $url);
            $this->assertEquals(
                401,
                $response->status(),
                "Ruta {$method} {$url} treba da vraća 401 za neautentifikovanog korisnika"
            );
        }
    }

    // ─── XSS SANITIZACIJA ────────────────────────────────────────

    /**
     * @test
     * BEZBEDNOST: XSS – maliciozni HTML se sanitizuje pre čuvanja
     */
    public function test_xss_script_tags_are_stripped_from_input(): void
    {
        $researcher = User::factory()->researcher()->create();
        Sanctum::actingAs($researcher);

        $maliciousTitle = '<script>alert("XSS")</script>Legitimni naslov';

        $response = $this->postJson('/api/projects', [
            'title'       => $maliciousTitle,
            'code'        => 'PRJ-XSS-001',
            'description' => 'Legitiman opis projekta',
            'budget'      => 10000,
            'category'    => 'IT',
            'status'      => 'active',
            'start_date'  => '2025-01-01',
            'end_date'    => '2026-01-01',
        ]);

        $response->assertStatus(201);

        // Script tag treba da bude uklonjen (strip_tags uklanja tagove, ne sadržaj)
        $savedTitle = $response->json('data.title');
        $this->assertStringNotContainsString('<script>', $savedTitle);
        $this->assertStringNotContainsString('</script>', $savedTitle);
        $this->assertStringContainsString('Legitimni naslov', $savedTitle);
    }

    /**
     * @test
     * BEZBEDNOST: XSS – img onerror napad se blokira
     */
    public function test_xss_img_onerror_is_stripped(): void
    {
        $researcher = User::factory()->researcher()->create();
        Sanctum::actingAs($researcher);

        $maliciousDesc = '<img src=x onerror=alert(1)>Legitiman opis projekta';

        $response = $this->postJson('/api/projects', [
            'title'       => 'Test XSS projekat',
            'code'        => 'PRJ-XSS-002',
            'description' => $maliciousDesc,
            'budget'      => 10000,
            'category'    => 'IT',
            'status'      => 'active',
            'start_date'  => '2025-01-01',
            'end_date'    => '2026-01-01',
        ]);

        $response->assertStatus(201);

        $savedDescription = $response->json('data.description');
        $this->assertStringNotContainsString('<img', $savedDescription);
        $this->assertStringNotContainsString('onerror', $savedDescription);
    }

    // ─── IDOR DODATNI TESTOVI ────────────────────────────────────

    /**
     * @test
     * BEZBEDNOST: IDOR – korisnik ne može videti tuđe favorite
     * (favoriti se filtriraju po user_id u kontroleru)
     */
    public function test_user_only_sees_own_favorites(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();

        $researcher = User::factory()->researcher()->create();

        // Kreirati projekte
        $project1 = \App\Models\Project::factory()->create(['lead_id' => $researcher->id]);
        $project2 = \App\Models\Project::factory()->create(['lead_id' => $researcher->id]);

        // User1 sačuva project1, User2 sačuva project2
        \App\Models\Favorite::create(['user_id' => $user1->id, 'project_id' => $project1->id]);
        \App\Models\Favorite::create(['user_id' => $user2->id, 'project_id' => $project2->id]);

        // User1 se prijavljuje i gleda svoje favorite
        Sanctum::actingAs($user1);
        $response = $this->getJson('/api/favorites');

        $response->assertStatus(200);

        $favoriteIds = collect($response->json('favorites'))
            ->pluck('project.id')
            ->toArray();

        // User1 vidi samo project1, ne i project2 (User2-ov favorit)
        $this->assertContains($project1->id, $favoriteIds);
        $this->assertNotContains($project2->id, $favoriteIds);
    }
}

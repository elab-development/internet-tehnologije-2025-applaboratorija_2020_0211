<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

/**
 * Testovi autentifikacije (SK1, SK2)
 * Pokriva: register, login, logout, /me endpoint
 */
class AuthTest extends TestCase
{
    use RefreshDatabase;

    // ─── REGISTER ────────────────────────────────────────────────

    /** @test */
    public function test_user_can_register_as_user(): void
    {
        $response = $this->postJson('/api/register', [
            'name'     => 'Stefan Nikolić',
            'email'    => 'stefan@test.com',
            'password' => 'password123',
            'role'     => 'user',
        ]);

        $response->assertStatus(201)
                 ->assertJsonStructure([
                     'token',
                     'user' => ['id', 'name', 'email', 'role'],
                 ])
                 ->assertJsonPath('user.role', 'user')
                 ->assertJsonPath('user.email', 'stefan@test.com');

        // Proveri da je korisnik zaista kreiran u bazi
        $this->assertDatabaseHas('users', [
            'email' => 'stefan@test.com',
            'role'  => 'user',
        ]);
    }

    /** @test */
    public function test_user_can_register_as_researcher(): void
    {
        $response = $this->postJson('/api/register', [
            'name'     => 'Marija Ivanović',
            'email'    => 'marija@test.com',
            'password' => 'password123',
            'role'     => 'researcher',
        ]);

        $response->assertStatus(201)
                 ->assertJsonPath('user.role', 'researcher');
    }

    /** @test */
    public function test_registration_fails_with_duplicate_email(): void
    {
        // Kreirati korisnika sa emailom
        User::factory()->create(['email' => 'duplicate@test.com']);

        $response = $this->postJson('/api/register', [
            'name'     => 'Drugi Korisnik',
            'email'    => 'duplicate@test.com',
            'password' => 'password123',
            'role'     => 'user',
        ]);

        $response->assertStatus(422); // Validation error
    }

    /** @test */
    public function test_registration_fails_with_short_password(): void
    {
        $response = $this->postJson('/api/register', [
            'name'     => 'Test',
            'email'    => 'test@test.com',
            'password' => '123',  // prekratka lozinka
            'role'     => 'user',
        ]);

        $response->assertStatus(422);
    }

    /** @test */
    public function test_registration_rejects_admin_role(): void
    {
        // Admin rola ne sme biti dostupna kroz registraciju
        $response = $this->postJson('/api/register', [
            'name'     => 'Fake Admin',
            'email'    => 'fake@test.com',
            'password' => 'password123',
            'role'     => 'admin',  // zabranjeno
        ]);

        $response->assertStatus(422);
    }

    // ─── LOGIN ───────────────────────────────────────────────────

    /** @test */
    public function test_user_can_login_with_valid_credentials(): void
    {
        $user = User::factory()->create([
            'email'    => 'login@test.com',
            'password' => bcrypt('password123'),
            'role'     => 'researcher',
        ]);

        $response = $this->postJson('/api/login', [
            'email'    => 'login@test.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'token',
                     'user' => ['id', 'name', 'email', 'role'],
                 ]);

        // Token nije prazan string
        $this->assertNotEmpty($response->json('token'));
    }

    /** @test */
    public function test_login_fails_with_wrong_password(): void
    {
        User::factory()->create([
            'email'    => 'wrong@test.com',
            'password' => bcrypt('correct_password'),
        ]);

        $response = $this->postJson('/api/login', [
            'email'    => 'wrong@test.com',
            'password' => 'wrong_password',
        ]);

        $response->assertStatus(401)
                 ->assertJsonPath('message', 'Pogrešan email ili lozinka.');
    }

    /** @test */
    public function test_inactive_user_cannot_login(): void
    {
        User::factory()->inactive()->create([
            'email'    => 'inactive@test.com',
            'password' => bcrypt('password123'),
        ]);

        $response = $this->postJson('/api/login', [
            'email'    => 'inactive@test.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(403);
    }

    // ─── LOGOUT ──────────────────────────────────────────────────

    /** @test */
    public function test_authenticated_user_can_logout(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/logout');

        $response->assertStatus(200)
                 ->assertJsonPath('message', 'Uspešno odjavljen.');
    }

    /** @test */
    public function test_unauthenticated_user_cannot_logout(): void
    {
        $response = $this->postJson('/api/logout');

        $response->assertStatus(401);
    }

    // ─── ME ──────────────────────────────────────────────────────

    /** @test */
    public function test_me_endpoint_returns_current_user(): void
    {
        $user = User::factory()->create(['role' => 'researcher']);
        Sanctum::actingAs($user);

        $response = $this->getJson('/api/me');

        $response->assertStatus(200)
                 ->assertJsonPath('user.id', $user->id)
                 ->assertJsonPath('user.email', $user->email)
                 ->assertJsonPath('user.role', 'researcher');

        // Lozinka ne sme biti u odgovoru
        $this->assertArrayNotHasKey('password', $response->json('user'));
    }

    /** @test */
    public function test_me_endpoint_requires_authentication(): void
    {
        $response = $this->getJson('/api/me');

        $response->assertStatus(401);
    }
}

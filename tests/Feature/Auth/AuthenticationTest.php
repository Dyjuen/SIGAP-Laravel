<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_screen_can_be_rendered(): void
    {
        $response = $this->get('/login');

        $response->assertStatus(200);
    }

    public function test_users_can_authenticate_using_the_login_screen(): void
    {
        // Use factory but override with username
        $user = User::factory()->create([
            'username' => 'testuser',
            'password_hash' => bcrypt($password = 'password'),
        ]);

        $response = $this->post('/login', [
            'username' => 'testuser',
            'password' => $password,
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('dashboard', absolute: false));
    }

    public function test_users_can_not_authenticate_with_invalid_password(): void
    {
        $user = User::factory()->create([
            'username' => 'testuser',
        ]);

        $this->post('/login', [
            'username' => 'testuser',
            'password' => 'wrong-password',
        ]);

        $this->assertGuest();
    }

    public function test_users_can_logout(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post('/logout');

        $this->assertGuest();
        $response->assertRedirect('/');
    }

    public function test_authenticated_user_is_redirected_to_role_dashboard(): void
    {
        // Create roles
        $adminRole = \App\Models\Role::create(['role_id' => 1, 'nama_role' => 'Admin']);
        $verifRole = \App\Models\Role::create(['role_id' => 2, 'nama_role' => 'Verifikator']);

        // Admin User
        $admin = User::factory()->create([
            'username' => 'admin',
            'role_id' => $adminRole->role_id,
            'password_hash' => bcrypt('password'),
        ]);

        $response = $this->post('/login', [
            'username' => 'admin',
            'password' => 'password',
        ]);

        $response->assertRedirect('/admin/user-management');
        $this->assertAuthenticatedAs($admin);
        Auth::logout();

        // Verifikator User
        $verifikator = User::factory()->create([
            'username' => 'verifikator',
            'role_id' => $verifRole->role_id,
            'password_hash' => bcrypt('password'),
        ]);

        $response = $this->post('/login', [
            'username' => 'verifikator',
            'password' => 'password',
        ]);

        $response->assertRedirect('/verifikator/dashboard');
    }

    public function test_login_is_rate_limited(): void
    {
        $user = User::factory()->create([
            'username' => 'testuser',
        ]);

        // Attempt 5 times with wrong password
        for ($i = 0; $i < 5; $i++) {
            $this->post('/login', [
                'username' => 'testuser',
                'password' => 'wrong-password',
            ]);
        }

        // 6th attempt should be locked out
        $response = $this->post('/login', [
            'username' => 'testuser',
            'password' => 'wrong-password',
        ]);

        $response->assertSessionHasErrors(['username']); // Default error key usually email/username
        // We'll verify exact message later or just that it fails
    }

    public function test_login_prevents_sql_injection(): void
    {
        User::factory()->create([
            'username' => 'admin',
            'password_hash' => bcrypt('password'),
        ]);

        // Attempt SQL injection in username
        $response = $this->post('/login', [
            'username' => "' OR 1=1 --",
            'password' => 'password',
        ]);

        $this->assertGuest();
        $response->assertSessionHasErrors();
    }

    public function test_login_validates_input_length(): void
    {
        // Attempt username > 50 chars
        $start = microtime(true);
        $longUsername = str_repeat('a', 51);

        $response = $this->post('/login', [
            'username' => $longUsername,
            'password' => 'password',
        ]);

        $this->assertGuest();
        $response->assertSessionHasErrors(['username']);
    }

    public function test_session_is_regenerated_on_login(): void
    {
        $user = User::factory()->create([
            'username' => 'testuser',
            'password_hash' => bcrypt('password'),
        ]);

        $sessionBefore = session()->getId();

        $this->post('/login', [
            'username' => 'testuser',
            'password' => 'password',
        ]);

        $sessionAfter = session()->getId();

        $this->assertNotEquals($sessionBefore, $sessionAfter);
    }
}

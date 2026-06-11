<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Log;
use Tests\TestCase;

class AuditTrailTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_event_is_logged(): void
    {
        Log::shouldReceive('info')
            ->once()
            ->withArgs(function ($message, $context) {
                return str_contains($message, '[AUTH_AUDIT] Login Sukses') &&
                       isset($context['user_id']) &&
                       $context['username'] === 'audituser';
            });

        $user = User::factory()->create([
            'username' => 'audituser',
            'password_hash' => bcrypt($password = 'P@ssword123!'),
        ]);

        $response = $this->post('/login', [
            'username' => 'audituser',
            'password' => $password,
        ]);

        $this->assertAuthenticatedAs($user);
    }

    public function test_failed_login_event_is_logged(): void
    {
        Log::shouldReceive('warning')
            ->once()
            ->withArgs(function ($message, $context) {
                return str_contains($message, '[AUTH_AUDIT] Login Gagal') &&
                       $context['username_attempted'] === 'wrongaudituser';
            });

        $response = $this->post('/login', [
            'username' => 'wrongaudituser',
            'password' => 'wrongpass',
        ]);

        $this->assertGuest();
    }

    public function test_logout_event_is_logged(): void
    {
        // First log the logout event
        Log::shouldReceive('info')
            ->once()
            ->withArgs(function ($message, $context) {
                return str_contains($message, '[AUTH_AUDIT] Logout') &&
                       isset($context['user_id']) &&
                       $context['username'] === 'audituser';
            });

        $user = User::factory()->create([
            'username' => 'audituser',
        ]);

        $response = $this->actingAs($user)->post('/logout');

        $this->assertGuest();
    }
}

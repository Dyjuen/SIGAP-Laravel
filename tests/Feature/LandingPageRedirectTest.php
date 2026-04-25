<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Role;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LandingPageRedirectTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_can_see_landing_page(): void
    {
        $response = $this->get('/');

        $response->assertStatus(200);
        $response->assertSee('LandingPage'); // Inertia component name check usually works or check status
    }

    public function test_authenticated_admin_is_redirected_from_landing_page(): void
    {
        $role = Role::create(['nama_role' => 'Admin']);
        $user = User::factory()->create(['role_id' => $role->role_id]);

        $response = $this->actingAs($user)->get('/');

        $response->assertRedirect('/admin/user-management');
    }

    public function test_authenticated_non_admin_is_redirected_to_dashboard(): void
    {
        $role = Role::create(['nama_role' => 'Pengusul']);
        $user = User::factory()->create(['role_id' => $role->role_id]);

        $response = $this->actingAs($user)->get('/');

        $response->assertRedirect('/dashboard');
    }
}

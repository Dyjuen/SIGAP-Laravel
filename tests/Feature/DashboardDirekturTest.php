<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardDirekturTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();

        // Buat roles
        Role::firstOrCreate(['nama_role' => 'Rektorat']);
        Role::firstOrCreate(['nama_role' => 'Pengusul']);
    }

    public function test_rektorat_can_access_dashboard()
    {
        $rektoratRole = Role::where('nama_role', 'Rektorat')->first();
        $rektorat = User::factory()->create(['role_id' => $rektoratRole->role_id]);

        $response = $this->actingAs($rektorat)->get(route('dashboard.direktur'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Direktur/Dashboard')
            ->has('dashboardData')
            ->has('dashboardData.overview')
            ->has('dashboardData.by_jurusan')
            ->has('dashboardData.trends')
            ->has('dashboardData.topsis_activities')
            ->has('dashboardData.spk_config')
        );
    }

    public function test_pengusul_cannot_access_dashboard()
    {
        $pengusulRole = Role::where('nama_role', 'Pengusul')->first();
        $pengusul = User::factory()->create(['role_id' => $pengusulRole->role_id]);

        $response = $this->actingAs($pengusul)->get(route('dashboard.direktur'));

        $response->assertStatus(403);
    }

    public function test_unauthenticated_user_cannot_access_dashboard()
    {
        $response = $this->get(route('dashboard.direktur'));

        $response->assertRedirect(route('login'));
    }
}

<?php

namespace Tests\Feature\Api;

use App\Models\Role;
use App\Models\User;
use Database\Seeders\MasterDataSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardAuthorizationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(MasterDataSeeder::class);
    }

    public function test_dashboard_routes_require_authentication()
    {
        $this->getJson('/api/verifikator/dashboard')->assertStatus(401);
        $this->getJson('/api/ppk/dashboard')->assertStatus(401);
        $this->getJson('/api/wadir/dashboard')->assertStatus(401);
        $this->getJson('/api/bendahara/dashboard')->assertStatus(401);
        $this->getJson('/api/direktur/dashboard')->assertStatus(401);
    }

    public function test_each_role_only_accesses_its_own_dashboard()
    {
        // Role mapping:
        // Admin: role_id = 1
        // Verifikator: role_id = 2, 'Verifikator'
        // PPK: 'PPK'
        // Wadir: 'Wadir'
        // Bendahara: 'Bendahara'
        // Direktur: 'Direktur'
        // Pengusul: role_id = 3, 'Pengusul'

        $verifikator = User::factory()->create(['role_id' => 2]); // Role name will resolve through belongsTo
        $this->seedRolesAndRelationships($verifikator, 'Verifikator');

        $ppk = User::factory()->create();
        $this->seedRolesAndRelationships($ppk, 'PPK');

        $wadir = User::factory()->create();
        $this->seedRolesAndRelationships($wadir, 'Wadir');

        $bendahara = User::factory()->create();
        $this->seedRolesAndRelationships($bendahara, 'Bendahara');

        $direktur = User::factory()->create();
        $this->seedRolesAndRelationships($direktur, 'Direktur');

        $admin = User::factory()->create(['role_id' => 1]);
        $this->seedRolesAndRelationships($admin, 'Admin');

        // Test Verifikator
        $this->actingAs($verifikator, 'sanctum')->getJson('/api/verifikator/dashboard')->assertStatus(200);
        $this->actingAs($verifikator, 'sanctum')->getJson('/api/ppk/dashboard')->assertStatus(403);

        // Test PPK
        $this->actingAs($ppk, 'sanctum')->getJson('/api/ppk/dashboard')->assertStatus(200);
        $this->actingAs($ppk, 'sanctum')->getJson('/api/verifikator/dashboard')->assertStatus(403);

        // Test Wadir
        $this->actingAs($wadir, 'sanctum')->getJson('/api/wadir/dashboard')->assertStatus(200);
        $this->actingAs($wadir, 'sanctum')->getJson('/api/ppk/dashboard')->assertStatus(403);

        // Test Bendahara
        $this->actingAs($bendahara, 'sanctum')->getJson('/api/bendahara/dashboard')->assertStatus(200);
        $this->actingAs($bendahara, 'sanctum')->getJson('/api/wadir/dashboard')->assertStatus(403);

        // Test Direktur
        $this->actingAs($direktur, 'sanctum')->getJson('/api/direktur/dashboard')->assertStatus(200);
        $this->actingAs($direktur, 'sanctum')->getJson('/api/bendahara/dashboard')->assertStatus(403);

        // Test Admin can access Direktur dashboard
        $this->actingAs($admin, 'sanctum')->getJson('/api/direktur/dashboard')->assertStatus(200);
    }

    private function seedRolesAndRelationships(User $user, string $roleName)
    {
        // Mock the getRoleName relationship if needed, or create a role model.
        // Let's seed the database roles.
        $role = Role::firstOrCreate(
            ['nama_role' => $roleName],
            ['nama_role' => $roleName]
        );
        $user->role_id = $role->role_id;
        $user->save();
    }
}

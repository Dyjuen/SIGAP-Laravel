<?php

namespace Tests\Feature\Admin;

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserSearchTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        if (Role::count() === 0) {
            Role::create(['role_id' => 1, 'nama_role' => 'Admin']);
            Role::create(['role_id' => 2, 'nama_role' => 'Verifikator']);
            Role::create(['role_id' => 3, 'nama_role' => 'Pengusul']);
        }
    }

    /**
     * Test Case: USR-F-002 - Cari berdasarkan Nama (Exact)
     */
    public function test_admin_can_search_user_by_name_exact()
    {
        $admin = User::factory()->create(['role_id' => 1]);
        User::factory()->create(['nama_lengkap' => 'Verifikator Akademik', 'role_id' => 2]);
        User::factory()->create(['nama_lengkap' => 'Other User', 'role_id' => 3]);

        $response = $this->actingAs($admin)
            ->get('/admin/user-management?search=Verifikator Akademik');

        $response->assertStatus(200);
        // Note: Currently Index() doesn't implement filtering. This test will FAIL (RED).
        $this->assertCount(1, $response->viewData('page')['props']['users']);
        $this->assertEquals('Verifikator Akademik', $response->viewData('page')['props']['users'][0]['nama_lengkap']);
    }

    /**
     * Test Case: USR-F-003 - Cari Nama (Huruf Kecil)
     */
    public function test_admin_can_search_user_by_name_case_insensitive()
    {
        $admin = User::factory()->create(['role_id' => 1]);
        User::factory()->create(['nama_lengkap' => 'Verifikator Akademik', 'role_id' => 2]);

        $response = $this->actingAs($admin)
            ->get('/admin/user-management?search=verifikator akademik');

        $response->assertStatus(200);
        $this->assertCount(1, $response->viewData('page')['props']['users']);
    }

    /**
     * Test Case: USR-F-004 - Cari berdasarkan Username
     */
    public function test_admin_can_search_user_by_username()
    {
        $admin = User::factory()->create(['role_id' => 1]);
        User::factory()->create(['username' => 'verifikator1', 'role_id' => 2]);

        $response = $this->actingAs($admin)
            ->get('/admin/user-management?search=verifikator1');

        $response->assertStatus(200);
        $this->assertCount(1, $response->viewData('page')['props']['users']);
        $this->assertEquals('verifikator1', $response->viewData('page')['props']['users'][0]['username']);
    }

    /**
     * Test Case: USR-F-005 - Cari berdasarkan Email
     */
    public function test_admin_can_search_user_by_email()
    {
        $admin = User::factory()->create(['role_id' => 1]);
        User::factory()->create(['email' => 'verifikator1@pnj.ac.id', 'role_id' => 2]);

        $response = $this->actingAs($admin)
            ->get('/admin/user-management?search=verifikator1@pnj.ac.id');

        $response->assertStatus(200);
        $this->assertCount(1, $response->viewData('page')['props']['users']);
    }

    /**
     * Test Case: USR-F-006 - Cari berdasarkan Role
     */
    public function test_admin_can_search_user_by_role()
    {
        $admin = User::factory()->create(['role_id' => 1]);
        User::factory()->create(['nama_lengkap' => 'V1', 'role_id' => 2]); // Verifikator
        User::factory()->create(['nama_lengkap' => 'V2', 'role_id' => 2]);
        User::factory()->create(['nama_lengkap' => 'P1', 'role_id' => 3]); // Pengusul

        $response = $this->actingAs($admin)
            ->get('/admin/user-management?search=Verifikator');

        $response->assertStatus(200);
        $this->assertCount(2, $response->viewData('page')['props']['users']);
    }

    /**
     * Test Case: USR-F-007 - Keyword Tidak Ditemukan
     */
    public function test_admin_search_no_results()
    {
        $admin = User::factory()->create(['role_id' => 1]);
        User::factory()->create(['nama_lengkap' => 'Admin', 'role_id' => 1]);

        $response = $this->actingAs($admin)
            ->get('/admin/user-management?search=xabiru');

        $response->assertStatus(200);
        $this->assertCount(0, $response->viewData('page')['props']['users']);
    }
}

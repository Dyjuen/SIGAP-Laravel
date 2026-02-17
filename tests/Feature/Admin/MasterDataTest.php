<?php

namespace Tests\Feature\Admin;

use App\Models\Iku;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MasterDataTest extends TestCase
{
    use RefreshDatabase;

    protected $admin;

    protected $user;

    protected function setUp(): void
    {
        parent::setUp();

        // Create Roles
        $adminRole = Role::create(['nama_role' => 'Admin']);
        $userRole = Role::create(['nama_role' => 'User']);

        // Create Users
        $this->admin = User::factory()->create(['role_id' => $adminRole->role_id]);
        $this->user = User::factory()->create(['role_id' => $userRole->role_id]);
    }

    public function test_admin_can_access_master_data_dashboard()
    {
        $response = $this->actingAs($this->admin)
            ->get(route('admin.master.index'));

        $response->assertStatus(200);
    }

    public function test_user_cannot_access_master_data_dashboard()
    {
        $response = $this->actingAs($this->user)
            ->get(route('admin.master.index'));

        // Assuming RoleMiddleware aborts with 403
        $response->assertStatus(403);
    }

    public function test_admin_can_create_mata_anggaran()
    {
        $data = [
            'kode_anggaran' => 'MA-001',
            'nama_sumber_dana' => 'APBN',
            'tahun_anggaran' => 2024,
            'total_pagu' => 100000000,
        ];

        $response = $this->actingAs($this->admin)
            ->post(route('admin.master.store', 'mata-anggaran'), $data);

        $response->assertRedirect();
        $this->assertDatabaseHas('m_mata_anggaran', $data);
    }

    public function test_admin_cannot_create_mata_anggaran_with_invalid_data()
    {
        $data = [
            'kode_anggaran' => 'MA-002',
            'nama_sumber_dana' => 'APBD',
            'tahun_anggaran' => 'invalid-year', // Should be integer
            'total_pagu' => 'not-a-number', // Should be numeric
        ];

        $response = $this->actingAs($this->admin)
            ->post(route('admin.master.store', 'mata-anggaran'), $data);

        $response->assertSessionHasErrors(['tahun_anggaran', 'total_pagu']);
    }

    public function test_admin_can_create_iku()
    {
        $data = [
            'kode_iku' => 'IKU-TEST',
            'nama_iku' => 'Indikator Test',
        ];

        $response = $this->actingAs($this->admin)
            ->post(route('admin.master.store', 'iku'), $data);

        $response->assertRedirect();
        $this->assertDatabaseHas('m_iku', $data);
    }

    public function test_admin_can_update_iku()
    {
        $iku = Iku::factory()->create();

        $data = [
            'kode_iku' => 'IKU-UPDATED',
            'nama_iku' => 'Indikator Updated',
        ];

        $response = $this->actingAs($this->admin)
            ->put(route('admin.master.update', ['type' => 'iku', 'id' => $iku->iku_id]), $data);

        $response->assertRedirect();
        $this->assertDatabaseHas('m_iku', $data);
    }

    public function test_admin_can_delete_iku()
    {
        $iku = Iku::factory()->create();

        $response = $this->actingAs($this->admin)
            ->delete(route('admin.master.destroy', ['type' => 'iku', 'id' => $iku->iku_id]));

        $response->assertRedirect();
        $this->assertSoftDeleted('m_iku', ['iku_id' => $iku->iku_id]);
    }

    public function test_admin_cannot_create_read_only_resource()
    {
        $data = ['nama_tipe' => 'New Type'];

        $response = $this->actingAs($this->admin)
            ->post(route('admin.master.store', 'tipe-kegiatan'), $data);

        $response->assertStatus(403);
    }

    public function test_validation_error()
    {
        $response = $this->actingAs($this->admin)
            ->post(route('admin.master.store', 'iku'), []);

        $response->assertSessionHasErrors(['kode_iku', 'nama_iku']);
    }
}

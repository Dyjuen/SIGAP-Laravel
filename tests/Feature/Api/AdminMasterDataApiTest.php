<?php

namespace Tests\Feature\Api;

use App\Models\User;
use App\Models\Iku;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminMasterDataApiTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private User $pengusul;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\MasterDataSeeder::class);
        $this->admin = User::factory()->create(['role_id' => 1]); // Admin
        $this->pengusul = User::factory()->create(['role_id' => 3]); // Pengusul
    }

    public function test_admin_can_view_master_types()
    {
        $token = $this->admin->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer '.$token,
            'Accept' => 'application/json',
        ])->getJson('/api/admin/master');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'types' => [
                '*' => ['key', 'title', 'readonly']
            ]
        ]);
    }

    public function test_admin_can_view_master_resource_index()
    {
        Iku::factory()->count(3)->create();
        $token = $this->admin->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer '.$token,
            'Accept' => 'application/json',
        ])->getJson('/api/admin/master/iku');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'type',
            'title',
            'readonly',
            'items' => [
                'data' => [
                    '*' => ['iku_id', 'kode_iku', 'nama_iku']
                ]
            ]
        ]);
    }

    public function test_admin_can_store_master_resource()
    {
        $token = $this->admin->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer '.$token,
            'Accept' => 'application/json',
        ])->postJson('/api/admin/master/iku', [
            'kode_iku' => 'IKU 9',
            'nama_iku' => 'IKU Kinerja Baru',
        ]);

        $response->assertStatus(200);
        $response->assertJson([
            'message' => 'Data berhasil ditambahkan.'
        ]);

        $this->assertDatabaseHas('m_iku', [
            'kode_iku' => 'IKU 9',
            'nama_iku' => 'IKU Kinerja Baru',
        ]);
    }

    public function test_admin_can_update_master_resource()
    {
        $iku = Iku::factory()->create([
            'kode_iku' => 'Old IKU',
            'nama_iku' => 'Old Nama'
        ]);
        $token = $this->admin->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer '.$token,
            'Accept' => 'application/json',
        ])->putJson('/api/admin/master/iku/'.$iku->iku_id, [
            'kode_iku' => 'New IKU',
            'nama_iku' => 'New Nama',
        ]);

        $response->assertStatus(200);
        $response->assertJson([
            'message' => 'Data berhasil diperbarui.'
        ]);

        $iku->refresh();
        $this->assertEquals('New IKU', $iku->kode_iku);
        $this->assertEquals('New Nama', $iku->nama_iku);
    }

    public function test_admin_can_destroy_master_resource()
    {
        $iku = Iku::factory()->create();
        $token = $this->admin->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer '.$token,
            'Accept' => 'application/json',
        ])->deleteJson('/api/admin/master/iku/'.$iku->iku_id);

        $response->assertStatus(200);
        $response->assertJson([
            'message' => 'Data berhasil dihapus.'
        ]);

        $this->assertSoftDeleted('m_iku', [
            'iku_id' => $iku->iku_id
        ]);
    }

    public function test_non_admin_cannot_access_master_crud()
    {
        $token = $this->pengusul->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer '.$token,
            'Accept' => 'application/json',
        ])->getJson('/api/admin/master');

        $response->assertStatus(403);
    }

    public function test_admin_cannot_create_read_only_resource()
    {
        $token = $this->admin->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer '.$token,
            'Accept' => 'application/json',
        ])->postJson('/api/admin/master/roles', [
            'nama_role' => 'New Fake Role',
        ]);

        $response->assertStatus(403);
        $response->assertJson([
            'message' => 'This master data type is read-only.'
        ]);
    }

    public function test_api_master_validation_error()
    {
        $token = $this->admin->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer '.$token,
            'Accept' => 'application/json',
        ])->postJson('/api/admin/master/iku', [
            'kode_iku' => '', // Empty
            'nama_iku' => 'Missing Kode',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['kode_iku']);
    }
}

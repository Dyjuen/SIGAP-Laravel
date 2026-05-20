<?php

namespace Tests\Feature\Validation;

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MasterDataValidationTest extends TestCase
{
    use RefreshDatabase;

    protected $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $role = new Role;
        $role->role_id = 1; // Admin
        $role->nama_role = 'Admin';
        $role->save();

        $this->admin = User::factory()->create(['role_id' => 1]);
    }

    /**
     * Test Satuan validation.
     */
    public function test_satuan_validation_rules()
    {
        // 1. Required
        $response = $this->actingAs($this->admin)
            ->postJson('/admin/master/satuan', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['nama_satuan']);

        // 2. Max length (255)
        $response = $this->actingAs($this->admin)
            ->postJson('/admin/master/satuan', [
                'nama_satuan' => str_repeat('a', 256),
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['nama_satuan']);
    }

    /**
     * Test IKU validation.
     */
    public function test_iku_validation_rules()
    {
        // 1. Required
        $response = $this->actingAs($this->admin)
            ->postJson('/admin/master/iku', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['kode_iku', 'nama_iku']);

        // 2. Max lengths (50, 255)
        $response = $this->actingAs($this->admin)
            ->postJson('/admin/master/iku', [
                'kode_iku' => str_repeat('a', 51),
                'nama_iku' => str_repeat('a', 256),
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['kode_iku', 'nama_iku']);
    }

    /**
     * Test Mata Anggaran validation.
     */
    public function test_mata_anggaran_validation_rules()
    {
        // 1. Required
        $response = $this->actingAs($this->admin)
            ->postJson('/admin/master/mata-anggaran', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['kode_anggaran', 'nama_sumber_dana', 'tahun_anggaran', 'total_pagu']);

        // 2. Data types
        $response = $this->actingAs($this->admin)
            ->postJson('/admin/master/mata-anggaran', [
                'kode_anggaran' => 'B001',
                'nama_sumber_dana' => 'APBN',
                'tahun_anggaran' => 'invalid-year',
                'total_pagu' => 'invalid-numeric',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['tahun_anggaran', 'total_pagu']);
    }
}

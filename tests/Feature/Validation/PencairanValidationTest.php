<?php

namespace Tests\Feature\Validation;

use App\Models\KAK;
use App\Models\Kegiatan;
use App\Models\KegiatanStatus;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PencairanValidationTest extends TestCase
{
    use RefreshDatabase;

    protected $user;

    protected function setUp(): void
    {
        parent::setUp();

        // Roles
        $verifRole = new Role;
        $verifRole->role_id = 2;
        $verifRole->nama_role = 'Verifikator';
        $verifRole->save();

        $pengusulRole = new Role;
        $pengusulRole->role_id = 3;
        $pengusulRole->nama_role = 'Pengusul';
        $pengusulRole->save();

        $bendaharaRole = new Role;
        $bendaharaRole->role_id = 4;
        $bendaharaRole->nama_role = 'Bendahara';
        $bendaharaRole->save();

        // Statuses
        KegiatanStatus::firstOrCreate(['status_id' => 1], ['nama_status' => 'Draft']);
        KegiatanStatus::firstOrCreate(['status_id' => 2], ['nama_status' => 'Review']);

        $this->user = User::factory()->create(['role_id' => 4]);

        // Create dummy KAK and Kegiatan
        $this->kak = KAK::factory()->create([
            'kak_id' => 1,
            'status_id' => 2, // Review
            'tipe_kegiatan_id' => 1,
        ]);

        $this->kegiatan = new Kegiatan;
        $this->kegiatan->kegiatan_id = 1;
        $this->kegiatan->kak_id = 1;
        $this->kegiatan->save();
    }

    /**
     * Test Pencairan creation validation rules.
     */
    public function test_pencairan_create_validation_rules()
    {
        // 1. Required and numeric
        $response = $this->actingAs($this->user)
            ->postJson('/kegiatan/1/pencairan', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors([
                'nominal_pencairan' => 'Nominal Pencairan harus diisi.',
            ]);

        // 2. Minimum 1 (PD-F-001, PD-F-002)
        $response = $this->actingAs($this->user)
            ->postJson('/kegiatan/1/pencairan', [
                'nominal_pencairan' => 0,
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors([
                'nominal_pencairan' => 'Nominal Pencairan minimal 1.',
            ]);

        // 3. Must be numeric (PD-F-003)
        $response = $this->actingAs($this->user)
            ->postJson('/kegiatan/1/pencairan', [
                'nominal_pencairan' => 'sepuluh ribu',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors([
                'nominal_pencairan' => 'Nominal Pencairan harus berupa angka.',
            ]);
    }

    /**
     * Test Pencairan rejection validation rules.
     */
    public function test_pencairan_reject_validation_rules()
    {
        // KAK Rejection by Verifikator requires 'catatan'
        $verifikator = User::factory()->create(['username' => 'verifikator1', 'role_id' => 2]);

        $response = $this->actingAs($verifikator)
            ->postJson('/kak/1/reject', [
                'catatan' => '', // Empty
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors([
                'catatan',
            ]);
    }
}

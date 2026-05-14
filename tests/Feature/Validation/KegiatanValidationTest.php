<?php

namespace Tests\Feature\Validation;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class KegiatanValidationTest extends TestCase
{
    use RefreshDatabase;

    protected $user;

    protected function setUp(): void
    {
        parent::setUp();
        
        $role = new \App\Models\Role();
        $role->role_id = 3; // Pengusul
        $role->nama_role = 'Pengusul';
        $role->save();
        
        \App\Models\KegiatanStatus::create(['status_id' => 1, 'nama_status' => 'Draft']);
        
        $this->user = User::factory()->create(['role_id' => 3]);
        
        $kak = \App\Models\KAK::factory()->create(['pengusul_user_id' => $this->user->user_id]);
        
        $kegiatan = new \App\Models\Kegiatan();
        $kegiatan->kegiatan_id = 1;
        $kegiatan->kak_id = $kak->kak_id;
        $kegiatan->save();
    }

    /**
     * Test basic kegiatan validation rules.
     */
    public function test_kegiatan_basic_validation_rules()
    {
        // Use PATCH to test update validation rules (nama_kegiatan, etc)
        $response = $this->actingAs($this->user)
            ->patchJson('/kegiatan/1', []);
            
        $response->assertStatus(422)
            ->assertJsonValidationErrors([
                'nama_kegiatan',
                'deskripsi_kegiatan',
                'tanggal_mulai',
                'tanggal_selesai',
                'lokasi',
                'mata_anggaran_id',
            ]);

        // Test min lengths
        $response = $this->actingAs($this->user)
            ->patchJson('/kegiatan/1', [
                'nama_kegiatan' => 'Short', // min:10
                'deskripsi_kegiatan' => 'Too short', // min:50
                'lokasi' => 'Loc', // min:5
            ]);
            
        $response->assertStatus(422)
            ->assertJsonValidationErrors([
                'nama_kegiatan',
                'deskripsi_kegiatan',
                'lokasi',
            ]);
    }

    /**
     * Test custom date range validation rules.
     */
    public function test_kegiatan_date_range_validation_rules()
    {
        // 1. Start date cannot be in the past
        $yesterday = date('Y-m-d', strtotime('-1 day'));
        $tomorrow = date('Y-m-d', strtotime('+1 day'));
        
        $response = $this->actingAs($this->user)
            ->patchJson('/kegiatan/1', [
                'nama_kegiatan' => 'Nama Kegiatan Test Panjang',
                'deskripsi_kegiatan' => 'Deskripsi kegiatan yang cukup panjang untuk melewati validasi minimal 50 karakter.',
                'tanggal_mulai' => $yesterday,
                'tanggal_selesai' => $tomorrow,
                'lokasi' => 'Gedung Serba Guna',
                'mata_anggaran_id' => 1,
            ]);
            
        $response->assertStatus(422)
            ->assertJsonValidationErrors([
                'tanggal_mulai' => 'Tanggal mulai tidak boleh kurang dari hari ini.',
            ]);

        // 2. End date must be after start date
        $start = date('Y-m-d', strtotime('+5 days'));
        $end = date('Y-m-d', strtotime('+4 days'));
        
        $response = $this->actingAs($this->user)
            ->patchJson('/kegiatan/1', [
                'nama_kegiatan' => 'Nama Kegiatan Test Panjang',
                'deskripsi_kegiatan' => 'Deskripsi kegiatan yang cukup panjang untuk melewati validasi minimal 50 karakter.',
                'tanggal_mulai' => $start,
                'tanggal_selesai' => $end,
                'lokasi' => 'Gedung Serba Guna',
                'mata_anggaran_id' => 1,
            ]);
            
        $response->assertStatus(422)
            ->assertJsonValidationErrors([
                'tanggal_selesai' => 'Tanggal selesai harus setelah tanggal mulai.',
            ]);

        // 3. Max duration 365 days
        $start = date('Y-m-d', strtotime('+1 day'));
        $end = date('Y-m-d', strtotime('+367 days'));
        
        $response = $this->actingAs($this->user)
            ->patchJson('/kegiatan/1', [
                'nama_kegiatan' => 'Nama Kegiatan Test Panjang',
                'deskripsi_kegiatan' => 'Deskripsi kegiatan yang cukup panjang untuk melewati validasi minimal 50 karakter.',
                'tanggal_mulai' => $start,
                'tanggal_selesai' => $end,
                'lokasi' => 'Gedung Serba Guna',
                'mata_anggaran_id' => 1,
            ]);
            
        $response->assertStatus(422)
            ->assertJsonValidationErrors([
                'tanggal_selesai' => 'Durasi kegiatan maksimal 365 hari (1 tahun).',
            ]);
    }
}

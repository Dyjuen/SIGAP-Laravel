<?php

namespace Tests\Feature\Validation;

use App\Models\KAK;
use App\Models\Kegiatan;
use App\Models\KegiatanStatus;
use App\Models\MataAnggaran;
use App\Models\Role;
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

        $role = new Role;
        $role->role_id = 3; // Pengusul
        $role->nama_role = 'Pengusul';
        $role->save();

        MataAnggaran::factory()->create(['mata_anggaran_id' => 1]);

        KegiatanStatus::create(['status_id' => 1, 'nama_status' => 'Draft']);

        $this->user = User::factory()->create(['role_id' => 3]);

        $kak = KAK::factory()->create(['pengusul_user_id' => $this->user->user_id]);

        $kegiatan = new Kegiatan;
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
     * Test required fields for creating kegiatan.
     */
    public function test_kegiatan_create_required_fields()
    {
        $response = $this->actingAs($this->user)
            ->postJson('/kegiatan', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors([
                'kak_id' => 'KAK wajib diisi.',
                'penanggung_jawab_manual' => 'Penanggung Jawab wajib diisi.',
                'pelaksana_manual' => 'Pelaksana wajib diisi.',
                'surat_pengantar' => 'Surat Pengantar wajib diisi.',
            ]);
    }

    /**
     * Test file validation (type and size).
     */
    public function test_kegiatan_file_validation()
    {
        // Test invalid mime type (AK-F-002, AK-F-021)
        $invalidFile = \Illuminate\Http\UploadedFile::fake()->create('script.sh', 100);
        
        $response = $this->actingAs($this->user)
            ->postJson('/kegiatan', [
                'surat_pengantar' => $invalidFile
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors([
                'surat_pengantar' => 'Surat Pengantar harus berupa file dengan format: pdf, doc, docx.',
            ]);

        // Test oversized file (AK-F-003)
        $largeFile = \Illuminate\Http\UploadedFile::fake()->create('document.pdf', 6144); // 6MB

        $response = $this->actingAs($this->user)
            ->postJson('/kegiatan', [
                'surat_pengantar' => $largeFile
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors([
                'surat_pengantar' => 'Surat Pengantar maksimal 5120 KB.',
            ]);
    }

    /**
     * Test max character limits (AK-F-008, AK-F-019).
     */
    public function test_kegiatan_max_character_limits()
    {
        // Store max length (penanggung_jawab_manual)
        $response = $this->actingAs($this->user)
            ->postJson('/kegiatan', [
                'penanggung_jawab_manual' => str_repeat('a', 256),
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors([
                'penanggung_jawab_manual' => 'Penanggung Jawab maksimal 255 karakter.',
            ]);

        // Update max length (nama_kegiatan)
        $response = $this->actingAs($this->user)
            ->patchJson('/kegiatan/1', [
                'nama_kegiatan' => str_repeat('a', 201),
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors([
                'nama_kegiatan' => 'Nama Kegiatan maksimal 200 karakter.',
            ]);
    }

    /**
     * Test XSS prevention (AK-F-012).
     */
    public function test_kegiatan_xss_prevention()
    {
        $xssInput = '<script>alert("xss")</script>Test Kegiatan';
        
        // Assuming the application should strip tags or escape them.
        // For Inertia, usually we store as is and React handles escaping, 
        // but let's check if there's any backend sanitization.
        $response = $this->actingAs($this->user)
            ->patchJson('/kegiatan/1', [
                'nama_kegiatan' => $xssInput,
                'deskripsi_kegiatan' => 'Deskripsi kegiatan yang cukup panjang untuk melewati validasi minimal 50 karakter.',
                'tanggal_mulai' => date('Y-m-d', strtotime('+1 day')),
                'tanggal_selesai' => date('Y-m-d', strtotime('+2 days')),
                'lokasi' => 'Gedung Serba Guna',
                'mata_anggaran_id' => 1,
            ]);

        $response->assertStatus(302);
        
        $kegiatan = Kegiatan::find(1)->load('kak');
        // If we want it "rejected/cleaned", we expect tags to be gone or escaped.
        // Many Laravel apps use e() or strip_tags() in observers or mutators.
        $this->assertStringNotContainsString('<script>', $kegiatan->kak->nama_kegiatan);
    }

    /**
     * Test special characters and emojis (AK-F-027).
     */
    public function test_kegiatan_emoji_support()
    {
        $emojiInput = 'Kegiatan Seru 🚀🔥';
        
        $response = $this->actingAs($this->user)
            ->patchJson('/kegiatan/1', [
                'nama_kegiatan' => $emojiInput,
                'deskripsi_kegiatan' => 'Deskripsi kegiatan yang cukup panjang untuk melewati validasi minimal 50 karakter.',
                'tanggal_mulai' => date('Y-m-d', strtotime('+1 day')),
                'tanggal_selesai' => date('Y-m-d', strtotime('+2 days')),
                'lokasi' => 'Gedung Serba Guna',
                'mata_anggaran_id' => 1,
            ]);

        $response->assertStatus(302);
        
        $kegiatan = Kegiatan::find(1)->load('kak');
        $this->assertEquals($emojiInput, $kegiatan->kak->nama_kegiatan);
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
                'tanggal_mulai' => 'Tanggal Mulai tidak boleh kurang dari hari ini.',
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
                'tanggal_selesai' => 'Tanggal Selesai harus setelah Tanggal Mulai.',
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

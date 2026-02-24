<?php

namespace Tests\Feature;

use App\Models\KAK;
use App\Models\Kegiatan;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class KegiatanTest extends TestCase
{
    use RefreshDatabase;

    private User $pengusul;

    private User $ppk;

    private User $wadir;

    private User $verifikator;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(\Database\Seeders\MasterDataSeeder::class);

        $this->pengusul = User::factory()->create(['role_id' => 3]);
        $this->ppk = User::factory()->create(['role_id' => 4]);
        $this->wadir = User::factory()->create(['role_id' => 5]);
        $this->verifikator = User::factory()->create(['role_id' => 2]);
    }

    private function createApprovedKak(User $pengusul): KAK
    {
        return KAK::create([
            'nama_kegiatan' => 'Test KAK',
            'deskripsi_kegiatan' => 'Test Deskripsi',
            'pengusul_user_id' => $pengusul->user_id,
            'status_id' => 3, // Disetujui Verifikator
            'tanggal_mulai' => now()->addDays(1),
            'tanggal_selesai' => now()->addDays(5),
            'tipe_kegiatan_id' => 1,
            'mata_anggaran_id' => 1,
        ]);
    }

    private function createDraftKak(User $pengusul): KAK
    {
        return KAK::create([
            'nama_kegiatan' => 'Test Draft KAK',
            'deskripsi_kegiatan' => 'Test Deskripsi',
            'pengusul_user_id' => $pengusul->user_id,
            'status_id' => 1, // Draft
            'tanggal_mulai' => now()->addDays(1),
            'tanggal_selesai' => now()->addDays(5),
            'tipe_kegiatan_id' => 1,
            'mata_anggaran_id' => 1,
        ]);
    }

    public function test_kegiatan_index_requires_authentication()
    {
        $response = $this->get('/kegiatan');
        $response->assertRedirect('/login');
    }

    public function test_pengusul_can_view_index_and_see_approved_kak()
    {
        $kak = $this->createApprovedKak($this->pengusul);

        $response = $this->actingAs($this->pengusul)->get('/kegiatan');

        $response->assertStatus(200);
        $response->assertInertia(
            fn ($page) => $page
                ->component('Kegiatan/Index')
                ->has('approvedKaks', 1)
        );
    }

    public function test_pengusul_can_submit_kegiatan()
    {
        Storage::fake('public');
        $kak = $this->createApprovedKak($this->pengusul);
        $file = UploadedFile::fake()->create('surat.pdf', 100);

        $response = $this->actingAs($this->pengusul)->post('/kegiatan', [
            'kak_id' => $kak->kak_id,
            'penanggung_jawab_manual' => 'John Doe',
            'pelaksana_manual' => 'Jane Doe',
            'surat_pengantar' => $file,
        ]);

        $response->assertRedirect(route('kegiatan.index'));
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('t_kegiatan', [
            'kak_id' => $kak->kak_id,
            'penanggung_jawab_manual' => 'John Doe',
        ]);

        $this->assertDatabaseHas('t_kak', [
            'kak_id' => $kak->kak_id,
            'status_id' => 6, // Review PPK
        ]);

        $this->assertDatabaseCount('t_kegiatan_approval', 5);
        $this->assertDatabaseHas('t_kegiatan_approval', [
            'approval_level' => 'PPK',
            'status' => 'Aktif',
        ]);
        $this->assertDatabaseHas('t_kegiatan_log_status', [
            'status_id_baru' => 6,
        ]);
    }

    public function test_pengusul_cannot_submit_from_unapproved_kak()
    {
        $kak = $this->createDraftKak($this->pengusul);
        $file = UploadedFile::fake()->create('surat.pdf', 100);

        $response = $this->actingAs($this->pengusul)->post('/kegiatan', [
            'kak_id' => $kak->kak_id,
            'penanggung_jawab_manual' => 'John Doe',
            'pelaksana_manual' => 'Jane Doe',
            'surat_pengantar' => $file,
        ]);

        $response->assertSessionHas('error', 'KAK belum disetujui Verifikator.');
        $this->assertDatabaseCount('t_kegiatan', 0);
    }

    public function test_pengusul_cannot_submit_duplicate_kegiatan_for_same_kak()
    {
        Storage::fake('public');
        $kak = $this->createApprovedKak($this->pengusul);
        $file = UploadedFile::fake()->create('surat.pdf', 100);

        // First submit
        $this->actingAs($this->pengusul)->post('/kegiatan', [
            'kak_id' => $kak->kak_id,
            'penanggung_jawab_manual' => 'John Doe',
            'pelaksana_manual' => 'Jane Doe',
            'surat_pengantar' => $file,
        ]);

        // Second submit
        $response = $this->actingAs($this->pengusul)->post('/kegiatan', [
            'kak_id' => $kak->kak_id,
            'penanggung_jawab_manual' => 'John Doe',
            'pelaksana_manual' => 'Jane Doe',
            'surat_pengantar' => UploadedFile::fake()->create('surat2.pdf', 100),
        ]);

        $response->assertSessionHas('error', 'Kegiatan untuk KAK ini sudah diajukan.');
        $this->assertDatabaseCount('t_kegiatan', 1);
    }

    public function test_submit_with_missing_required_fields_fails_validation()
    {
        $kak = $this->createApprovedKak($this->pengusul);

        $response = $this->actingAs($this->pengusul)->post('/kegiatan', [
            'kak_id' => $kak->kak_id,
            // missing other fields
        ]);

        $response->assertSessionHasErrors(['penanggung_jawab_manual', 'pelaksana_manual', 'surat_pengantar']);
    }

    public function test_oversized_file_rejection()
    {
        Storage::fake('public');
        $kak = $this->createApprovedKak($this->pengusul);
        $file = UploadedFile::fake()->create('surat.pdf', 6000); // 6MB (limit is 5MB)

        $response = $this->actingAs($this->pengusul)->post('/kegiatan', [
            'kak_id' => $kak->kak_id,
            'penanggung_jawab_manual' => 'John Doe',
            'pelaksana_manual' => 'Jane Doe',
            'surat_pengantar' => $file,
        ]);

        $response->assertSessionHasErrors(['surat_pengantar']);
    }

    public function test_invalid_file_type_rejection()
    {
        Storage::fake('public');
        $kak = $this->createApprovedKak($this->pengusul);
        $file = UploadedFile::fake()->create('surat.exe', 100);

        $response = $this->actingAs($this->pengusul)->post('/kegiatan', [
            'kak_id' => $kak->kak_id,
            'penanggung_jawab_manual' => 'John Doe',
            'pelaksana_manual' => 'Jane Doe',
            'surat_pengantar' => $file,
        ]);

        $response->assertSessionHasErrors(['surat_pengantar']);
    }

    public function test_ppk_can_approve_kegiatan()
    {
        Storage::fake('public');
        $kak = $this->createApprovedKak($this->pengusul);

        $this->actingAs($this->pengusul)->post('/kegiatan', [
            'kak_id' => $kak->kak_id,
            'penanggung_jawab_manual' => 'John Doe',
            'pelaksana_manual' => 'Jane Doe',
            'surat_pengantar' => UploadedFile::fake()->create('surat.pdf', 100),
        ]);

        $kegiatan = Kegiatan::first();

        $response = $this->actingAs($this->ppk)->post("/kegiatan/{$kegiatan->kegiatan_id}/approve", [
            'catatan' => 'Lanjut ke Wadir',
        ]);

        $response->assertRedirect(route('kegiatan.index'));

        $this->assertDatabaseHas('t_kegiatan_approval', [
            'kegiatan_id' => $kegiatan->kegiatan_id,
            'approval_level' => 'PPK',
            'status' => 'Disetujui',
        ]);

        $this->assertDatabaseHas('t_kegiatan_approval', [
            'kegiatan_id' => $kegiatan->kegiatan_id,
            'approval_level' => 'Wadir2',
            'status' => 'Aktif',
        ]);

        $this->assertDatabaseHas('t_kak', [
            'kak_id' => $kak->kak_id,
            'status_id' => 7, // Review Wadir 2
        ]);
    }

    public function test_wadir_cannot_approve_while_at_ppk_level()
    {
        Storage::fake('public');
        $kak = $this->createApprovedKak($this->pengusul);

        $this->actingAs($this->pengusul)->post('/kegiatan', [
            'kak_id' => $kak->kak_id,
            'penanggung_jawab_manual' => 'John Doe',
            'pelaksana_manual' => 'Jane Doe',
            'surat_pengantar' => UploadedFile::fake()->create('surat.pdf', 100),
        ]);

        $kegiatan = Kegiatan::first();

        // Wadir tries to approve when it's PPK's turn
        $response = $this->actingAs($this->wadir)->post("/kegiatan/{$kegiatan->kegiatan_id}/approve", [
            'catatan' => 'Testing',
        ]);

        $response->assertStatus(403);
    }

    public function test_pengusul_cannot_approve()
    {
        Storage::fake('public');
        $kak = $this->createApprovedKak($this->pengusul);

        $this->actingAs($this->pengusul)->post('/kegiatan', [
            'kak_id' => $kak->kak_id,
            'penanggung_jawab_manual' => 'John Doe',
            'pelaksana_manual' => 'Jane Doe',
            'surat_pengantar' => UploadedFile::fake()->create('surat.pdf', 100),
        ]);

        $kegiatan = Kegiatan::first();

        $response = $this->actingAs($this->pengusul)->post("/kegiatan/{$kegiatan->kegiatan_id}/approve", [
            'catatan' => 'Hacker attempt',
        ]);

        $response->assertStatus(403);
    }

    public function test_wadir_can_approve_after_ppk()
    {
        Storage::fake('public');
        $kak = $this->createApprovedKak($this->pengusul);

        $this->actingAs($this->pengusul)->post('/kegiatan', [
            'kak_id' => $kak->kak_id,
            'penanggung_jawab_manual' => 'John Doe',
            'pelaksana_manual' => 'Jane Doe',
            'surat_pengantar' => UploadedFile::fake()->create('surat.pdf', 100),
        ]);

        $kegiatan = Kegiatan::first();

        // PPK Approves
        $this->actingAs($this->ppk)->post("/kegiatan/{$kegiatan->kegiatan_id}/approve", [
            'catatan' => 'OK',
        ]);

        // Wadir Approves
        $response = $this->actingAs($this->wadir)->post("/kegiatan/{$kegiatan->kegiatan_id}/approve", [
            'catatan' => 'ACC pencairan',
        ]);

        $response->assertRedirect(route('kegiatan.index'));

        $this->assertDatabaseHas('t_kegiatan_approval', [
            'kegiatan_id' => $kegiatan->kegiatan_id,
            'approval_level' => 'Wadir2',
            'status' => 'Disetujui',
        ]);

        $this->assertDatabaseHas('t_kegiatan_approval', [
            'kegiatan_id' => $kegiatan->kegiatan_id,
            'approval_level' => 'Bendahara-Cair',
            'status' => 'Aktif',
        ]);

        $this->assertDatabaseHas('t_kak', [
            'kak_id' => $kak->kak_id,
            'status_id' => 8, // Proses Pencairan
        ]);
    }

    public function test_show_nonexistent_kegiatan_returns_404()
    {
        $response = $this->actingAs($this->pengusul)->get('/kegiatan/99999');
        $response->assertStatus(404);
    }
}

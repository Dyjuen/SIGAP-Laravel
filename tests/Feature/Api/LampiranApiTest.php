<?php

namespace Tests\Feature\Api;

use App\Models\KAK;
use App\Models\KAKAnggaran;
use App\Models\KegiatanLampiran;
use App\Models\User;
use Database\Seeders\MasterDataSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class LampiranApiTest extends TestCase
{
    use RefreshDatabase;

    private User $pengusul;
    private User $pengusulLain;
    private User $verifikator;
    private User $bendahara;
    private User $admin;
    private User $ppk;
    private KAKAnggaran $anggaran;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(MasterDataSeeder::class);

        $this->admin = User::factory()->create(['role_id' => 1]);
        $this->verifikator = User::factory()->create(['role_id' => 2]);
        $this->pengusul = User::factory()->create(['role_id' => 3]);
        $this->pengusulLain = User::factory()->create(['role_id' => 3]);
        $this->ppk = User::factory()->create(['role_id' => 4]);
        $this->bendahara = User::factory()->create(['role_id' => 6]);

        $kak = KAK::create([
            'nama_kegiatan' => 'Test KAK API',
            'deskripsi_kegiatan' => 'Test',
            'pengusul_user_id' => $this->pengusul->user_id,
            'status_id' => 1,
            'tanggal_mulai' => now(),
            'tanggal_selesai' => now()->addDays(1),
            'tipe_kegiatan_id' => 1,
            'mata_anggaran_id' => 1,
        ]);

        $this->anggaran = KAKAnggaran::create([
            'kak_id' => $kak->kak_id,
            'kategori_belanja_id' => 1,
            'uraian' => 'Test Item API',
            'volume1' => 1,
            'satuan1_id' => 1,
            'harga_satuan' => 1000,
            'jumlah_diusulkan' => 1000,
        ]);

        Storage::fake('supabase');
    }

    /**
     * Auth Tests
     */
    public function test_unauthenticated_cannot_access_lampiran_routes(): void
    {
        $this->getJson("/api/lampiran/anggaran/{$this->anggaran->anggaran_id}")->assertStatus(401);
    }

    public function test_pengusul_can_only_access_own_lampiran(): void
    {
        // Own
        $this->actingAs($this->pengusul)
            ->getJson("/api/lampiran/anggaran/{$this->anggaran->anggaran_id}")
            ->assertStatus(200);

        // Others
        $this->actingAs($this->pengusulLain)
            ->getJson("/api/lampiran/anggaran/{$this->anggaran->anggaran_id}")
            ->assertStatus(403);
    }

    public function test_verifikator_cannot_access_lampiran(): void
    {
        $this->actingAs($this->verifikator)
            ->getJson("/api/lampiran/anggaran/{$this->anggaran->anggaran_id}")
            ->assertStatus(403);
    }

    public function test_ppk_cannot_access_lampiran(): void
    {
        $this->actingAs($this->ppk)
            ->getJson("/api/lampiran/anggaran/{$this->anggaran->anggaran_id}")
            ->assertStatus(403);
    }

    /**
     * Upload Tests
     */
    public function test_successful_upload(): void
    {
        $file = UploadedFile::fake()->image('bukti.jpg', 500);

        $response = $this->actingAs($this->pengusul)
            ->postJson("/api/lampiran/anggaran/{$this->anggaran->anggaran_id}", [
                'file' => $file,
                'catatan' => 'Test catatan uploader API',
            ]);

        $response->assertStatus(201);

        $this->assertDatabaseHas('t_kegiatan_lampiran', [
            'anggaran_id' => $this->anggaran->anggaran_id,
            'nama_file_asli' => 'bukti.jpg',
            'catatan' => 'Test catatan uploader API',
        ]);

        $lampiran = KegiatanLampiran::first();
        Storage::disk('supabase')->assertExists($lampiran->path_file_disimpan);
    }

    public function test_upload_fails_on_storage_error_and_rolls_back(): void
    {
        $file = UploadedFile::fake()->image('bukti.jpg', 500);

        $response = $this->actingAs($this->pengusul)
            ->postJson("/api/lampiran/anggaran/{$this->anggaran->anggaran_id}", [
                'file' => $file,
            ]);

        $response->assertStatus(201);
        $lampiran = KegiatanLampiran::first();
        $this->assertStringContainsString('lampiran/'.$this->anggaran->anggaran_id, $lampiran->path_file_disimpan);
    }

    public function test_upload_validation_rules(): void
    {
        // 1. Invalid mime type
        $file = UploadedFile::fake()->create('script.txt', 100, 'text/plain');
        $this->actingAs($this->pengusul)
            ->postJson("/api/lampiran/anggaran/{$this->anggaran->anggaran_id}", ['file' => $file])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['file']);

        // 2. Too large (> 10MB)
        $largeFile = UploadedFile::fake()->create('heavy.jpg', 11000, 'image/jpeg');
        $this->actingAs($this->pengusul)
            ->postJson("/api/lampiran/anggaran/{$this->anggaran->anggaran_id}", ['file' => $largeFile])
            ->assertStatus(422);
    }

    public function test_upload_max_limit_enforced(): void
    {
        // Create 10 files
        KegiatanLampiran::factory()->count(10)->create([
            'anggaran_id' => $this->anggaran->anggaran_id,
            'status_lampiran' => 'pending',
        ]);

        $file = UploadedFile::fake()->image('bukti_extra.jpg', 500);

        $this->actingAs($this->pengusul)
            ->postJson("/api/lampiran/anggaran/{$this->anggaran->anggaran_id}", ['file' => $file])
            ->assertStatus(422)
            ->assertJsonFragment(['success' => false]);
    }

    /**
     * Streaming Tests
     */
    public function test_stream_file_successfully(): void
    {
        $lampiran = KegiatanLampiran::create([
            'anggaran_id' => $this->anggaran->anggaran_id,
            'nama_file_asli' => 'test.jpg',
            'path_file_disimpan' => 'lampiran/1/test.jpg',
            'uploader_user_id' => $this->pengusul->user_id,
            'status_lampiran' => 'pending',
        ]);

        Storage::disk('supabase')->put($lampiran->path_file_disimpan, 'fake-content');

        $response = $this->actingAs($this->pengusul)
            ->get("/api/lampiran/{$lampiran->lampiran_id}/stream");

        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'image/jpeg');
    }

    public function test_stream_fails_when_file_missing_on_disk(): void
    {
        $lampiran = KegiatanLampiran::create([
            'anggaran_id' => $this->anggaran->anggaran_id,
            'nama_file_asli' => 'ghost.pdf',
            'path_file_disimpan' => 'lampiran/1/ghost.pdf',
            'uploader_user_id' => $this->pengusul->user_id,
            'status_lampiran' => 'pending',
        ]);

        // No file in storage
        $response = $this->actingAs($this->pengusul)
            ->getJson("/api/lampiran/{$lampiran->lampiran_id}/stream");

        $response->assertStatus(404)
            ->assertJsonFragment(['message' => 'File tidak ditemukan di server.']);
    }

    /**
     * Revision Logic Tests
     */
    public function test_revision_requested_and_resubmit(): void
    {
        $lampiran = KegiatanLampiran::create([
            'anggaran_id' => $this->anggaran->anggaran_id,
            'nama_file_asli' => 'ver1.pdf',
            'path_file_disimpan' => 'lampiran/1/ver1.pdf',
            'uploader_user_id' => $this->pengusul->user_id,
            'status_lampiran' => 'pending',
        ]);

        // 1. Bendahara requests revision
        $this->actingAs($this->bendahara)
            ->postJson("/api/lampiran/{$lampiran->lampiran_id}/catatan", [
                'catatan_reviewer' => 'Perlu revisi data.',
            ])->assertStatus(200);

        $this->assertEquals('revision_requested', $lampiran->fresh()->status_lampiran);

        // 2. Pengusul resubmits
        $revFile = UploadedFile::fake()->image('ver2.jpg', 600);
        $resubmitResponse = $this->actingAs($this->pengusul)
            ->postJson("/api/lampiran/{$lampiran->lampiran_id}/resubmit", [
                'file' => $revFile,
            ]);

        $resubmitResponse->assertStatus(201);

        // Old version should be archived
        $this->assertEquals('archived', $lampiran->fresh()->status_lampiran);

        // New version should exist
        $newLampiran = KegiatanLampiran::where('parent_lampiran_id', $lampiran->lampiran_id)->first();
        $this->assertNotNull($newLampiran);
        $this->assertEquals(1, $newLampiran->revisi_ke);
    }

    public function test_resubmit_fails_if_not_revision_requested(): void
    {
        $lampiran = KegiatanLampiran::create([
            'anggaran_id' => $this->anggaran->anggaran_id,
            'nama_file_asli' => 'ver1.pdf',
            'path_file_disimpan' => 'path',
            'uploader_user_id' => $this->pengusul->user_id,
            'status_lampiran' => 'pending',
        ]);

        $file = UploadedFile::fake()->image('ver2.jpg', 100);
        $this->actingAs($this->pengusul)
            ->postJson("/api/lampiran/{$lampiran->lampiran_id}/resubmit", ['file' => $file])
            ->assertStatus(422)
            ->assertJsonFragment(['message' => 'Lampiran ini tidak memerlukan revisi.']);
    }

    public function test_pengusul_cannot_approve(): void
    {
        $lampiran = KegiatanLampiran::factory()->create(['anggaran_id' => $this->anggaran->anggaran_id]);

        $this->actingAs($this->pengusul)
            ->postJson("/api/lampiran/{$lampiran->lampiran_id}/approve")
            ->assertStatus(403);
    }

    public function test_cross_owner_cannot_destroy(): void
    {
        $lampiran = KegiatanLampiran::factory()->create(['anggaran_id' => $this->anggaran->anggaran_id]);

        $this->actingAs($this->pengusulLain)
            ->deleteJson("/api/lampiran/{$lampiran->lampiran_id}")
            ->assertStatus(403);
    }

    public function test_save_catatan_fails_for_pengusul(): void
    {
        $lampiran = KegiatanLampiran::factory()->create(['anggaran_id' => $this->anggaran->anggaran_id]);

        $this->actingAs($this->pengusul)
            ->postJson("/api/lampiran/{$lampiran->lampiran_id}/catatan", ['catatan_reviewer' => 'test'])
            ->assertStatus(403);
    }

    public function test_approve_cleans_up_archived_parents(): void
    {
        // Create chain: L1 (archived) -> L2 (pending)
        $l1 = KegiatanLampiran::create([
            'anggaran_id' => $this->anggaran->anggaran_id,
            'nama_file_asli' => 'old.jpg',
            'path_file_disimpan' => 'lampiran/1/old.jpg',
            'uploader_user_id' => $this->pengusul->user_id,
            'status_lampiran' => 'archived',
        ]);
        Storage::disk('supabase')->put($l1->path_file_disimpan, 'old-data');

        $l2 = KegiatanLampiran::create([
            'anggaran_id' => $this->anggaran->anggaran_id,
            'nama_file_asli' => 'new.jpg',
            'path_file_disimpan' => 'lampiran/1/new.jpg',
            'uploader_user_id' => $this->pengusul->user_id,
            'status_lampiran' => 'pending',
            'parent_lampiran_id' => $l1->lampiran_id,
        ]);
        Storage::disk('supabase')->put($l2->path_file_disimpan, 'new-data');

        // Approve L2
        $this->actingAs($this->bendahara)
            ->postJson("/api/lampiran/{$l2->lampiran_id}/approve")
            ->assertStatus(200);

        // Verify L2 is approved
        $this->assertEquals('approved', $l2->fresh()->status_lampiran);

        // Verify L1 is deleted from DB and Disk
        $this->assertDatabaseMissing('t_kegiatan_lampiran', ['lampiran_id' => $l1->lampiran_id]);
        Storage::disk('supabase')->assertMissing($l1->path_file_disimpan);

        // L2 file should still exist
        Storage::disk('supabase')->assertExists($l2->path_file_disimpan);
    }

    public function test_history_returns_correct_tree(): void
    {
        $l1 = KegiatanLampiran::create(['anggaran_id' => $this->anggaran->anggaran_id, 'nama_file_asli' => 'v1.pdf', 'path_file_disimpan' => 'v1', 'uploader_user_id' => $this->pengusul->user_id]);
        $l2 = KegiatanLampiran::create(['anggaran_id' => $this->anggaran->anggaran_id, 'nama_file_asli' => 'v2.pdf', 'path_file_disimpan' => 'v2', 'parent_lampiran_id' => $l1->lampiran_id, 'uploader_user_id' => $this->pengusul->user_id]);
        $l3 = KegiatanLampiran::create(['anggaran_id' => $this->anggaran->anggaran_id, 'nama_file_asli' => 'v3.pdf', 'path_file_disimpan' => 'v3', 'parent_lampiran_id' => $l2->lampiran_id, 'uploader_user_id' => $this->pengusul->user_id]);

        $response = $this->actingAs($this->pengusul)
            ->getJson("/api/lampiran/{$l3->lampiran_id}/history");

        $response->assertStatus(200)
            ->assertJsonCount(2, 'data');
    }
}

<?php

namespace Tests\Feature;

use App\Models\KAK;
use App\Models\KAKAnggaran;
use App\Models\KegiatanLampiran;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class LampiranTest extends TestCase
{
    use RefreshDatabase;

    private User $pengusul;

    private User $pengusulLain;

    private User $bendahara;

    private User $admin;

    private KAKAnggaran $anggaran;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\MasterDataSeeder::class);

        $this->pengusul = User::factory()->create(['role_id' => 3]); // Pengusul
        $this->pengusulLain = User::factory()->create(['role_id' => 3]);
        $this->bendahara = User::factory()->create(['role_id' => 6]); // Bendahara
        $this->admin = User::factory()->create(['role_id' => 1]); // Admin

        $kak = KAK::create([
            'nama_kegiatan' => 'Test KAK',
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
            'uraian' => 'Test Item',
            'volume1' => 1,
            'satuan1_id' => 1,
            'harga_satuan' => 1000,
            'jumlah_diusulkan' => 1000,
        ]);

        Storage::fake('public');
    }

    /**
     * Auth Tests
     */
    public function test_unauthenticated_cannot_access_lampiran_routes(): void
    {
        $this->getJson(route('lampiran.index', $this->anggaran))->assertStatus(401);
    }

    public function test_pengusul_can_only_access_own_lampiran(): void
    {
        // Own
        $this->actingAs($this->pengusul)
            ->getJson(route('lampiran.index', $this->anggaran))
            ->assertStatus(200);

        // Others
        $this->actingAs($this->pengusulLain)
            ->getJson(route('lampiran.index', $this->anggaran))
            ->assertStatus(403);
    }

    /**
     * Upload Tests
     */
    public function test_successful_upload(): void
    {
        $file = UploadedFile::fake()->create('dokumen.pdf', 500);

        $response = $this->actingAs($this->pengusul)
            ->postJson(route('lampiran.store', $this->anggaran), [
                'file' => $file,
                'catatan' => 'Test catatan uploader',
            ]);

        $response->assertStatus(201);

        $this->assertDatabaseHas('t_kegiatan_lampiran', [
            'anggaran_id' => $this->anggaran->anggaran_id,
            'nama_file_asli' => 'dokumen.pdf',
            'catatan' => 'Test catatan uploader',
        ]);

        $lampiran = KegiatanLampiran::first();
        Storage::disk('public')->assertExists($lampiran->path_file_disimpan);
    }

    public function test_upload_fails_on_storage_error_and_rolls_back(): void
    {
        // Simulate storage failure
        Storage::shouldReceive('disk->put')->andReturn(false);

        $file = UploadedFile::fake()->create('dokumen.pdf', 500);

        $response = $this->actingAs($this->pengusul)
            ->postJson(route('lampiran.store', $this->anggaran), [
                'file' => $file,
            ]);

        $response->assertStatus(500);
        $this->assertDatabaseCount('t_kegiatan_lampiran', 0);
    }

    public function test_upload_max_limit_enforced(): void
    {
        // Create 10 files
        KegiatanLampiran::factory()->count(10)->create([
            'anggaran_id' => $this->anggaran->anggaran_id,
            'status_lampiran' => 'pending',
        ]);

        $file = UploadedFile::fake()->create('dokumen_extra.pdf', 500);

        $this->actingAs($this->pengusul)
            ->postJson(route('lampiran.store', $this->anggaran), ['file' => $file])
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
            'nama_file_asli' => 'test.pdf',
            'path_file_disimpan' => 'lampiran/1/test.pdf',
            'uploader_user_id' => $this->pengusul->user_id,
            'status_lampiran' => 'pending',
        ]);

        Storage::disk('public')->put($lampiran->path_file_disimpan, 'fake-content');

        $response = $this->actingAs($this->pengusul)
            ->get(route('lampiran.stream', $lampiran));

        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'application/pdf');
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
            ->getJson(route('lampiran.stream', $lampiran));

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
            ->postJson(route('lampiran.catatan', $lampiran), [
                'catatan_reviewer' => 'Perlu revisi data.',
            ])->assertStatus(200);

        $this->assertEquals('revision_requested', $lampiran->fresh()->status_lampiran);

        // 2. Pengusul resubmits
        $revFile = UploadedFile::fake()->create('ver2.pdf', 600);
        $resubmitResponse = $this->actingAs($this->pengusul)
            ->postJson(route('lampiran.resubmit', $lampiran), [
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

    public function test_approve_cleans_up_archived_parents(): void
    {
        // Create chain: L1 (archived) -> L2 (pending)
        $l1 = KegiatanLampiran::create([
            'anggaran_id' => $this->anggaran->anggaran_id,
            'nama_file_asli' => 'old.pdf',
            'path_file_disimpan' => 'lampiran/1/old.pdf',
            'uploader_user_id' => $this->pengusul->user_id,
            'status_lampiran' => 'archived',
        ]);
        Storage::disk('public')->put($l1->path_file_disimpan, 'old-data');

        $l2 = KegiatanLampiran::create([
            'anggaran_id' => $this->anggaran->anggaran_id,
            'nama_file_asli' => 'new.pdf',
            'path_file_disimpan' => 'lampiran/1/new.pdf',
            'uploader_user_id' => $this->pengusul->user_id,
            'status_lampiran' => 'pending',
            'parent_lampiran_id' => $l1->lampiran_id,
        ]);
        Storage::disk('public')->put($l2->path_file_disimpan, 'new-data');

        // Approve L2
        $this->actingAs($this->bendahara)
            ->postJson(route('lampiran.approve', $l2))
            ->assertStatus(200);

        // Verify L2 is approved
        $this->assertEquals('approved', $l2->fresh()->status_lampiran);

        // Verify L1 is deleted from DB and Disk
        $this->assertDatabaseMissing('t_kegiatan_lampiran', ['lampiran_id' => $l1->lampiran_id]);
        Storage::disk('public')->assertMissing($l1->path_file_disimpan);

        // L2 file should still exist
        Storage::disk('public')->assertExists($l2->path_file_disimpan);
    }

    public function test_history_returns_correct_tree(): void
    {
        $l1 = KegiatanLampiran::create(['anggaran_id' => $this->anggaran->anggaran_id, 'nama_file_asli' => 'v1.pdf', 'path_file_disimpan' => 'v1', 'uploader_user_id' => $this->pengusul->user_id]);
        $l2 = KegiatanLampiran::create(['anggaran_id' => $this->anggaran->anggaran_id, 'nama_file_asli' => 'v2.pdf', 'path_file_disimpan' => 'v2', 'parent_lampiran_id' => $l1->lampiran_id, 'uploader_user_id' => $this->pengusul->user_id]);
        $l3 = KegiatanLampiran::create(['anggaran_id' => $this->anggaran->anggaran_id, 'nama_file_asli' => 'v3.pdf', 'path_file_disimpan' => 'v3', 'parent_lampiran_id' => $l2->lampiran_id, 'uploader_user_id' => $this->pengusul->user_id]);

        $response = $this->actingAs($this->pengusul)
            ->getJson(route('lampiran.history', $l3));

        $response->assertStatus(200)
            ->assertJsonCount(2, 'data'); // data contains parents (v1, v2)
    }
}

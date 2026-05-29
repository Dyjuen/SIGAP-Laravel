<?php

namespace Tests\Unit\Services;

use App\Models\User;
use App\Models\KAK;
use App\Models\KAKAnggaran;
use App\Models\KegiatanLampiran;
use App\Services\LampiranService;
use Database\Seeders\MasterDataSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;
use Exception;

class LampiranServiceTest extends TestCase
{
    use RefreshDatabase;

    private LampiranService $service;
    private User $pengusul;
    private User $bendahara;
    private KAKAnggaran $anggaran;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(MasterDataSeeder::class);
        $this->service = new LampiranService();

        $this->pengusul = User::factory()->create(['role_id' => 3]);
        $this->bendahara = User::factory()->create(['role_id' => 6]);

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

        Storage::fake('supabase');
    }

    public function test_store_success(): void
    {
        $file = UploadedFile::fake()->image('bukti.jpg', 500);

        $lampiran = $this->service->store($this->anggaran, $file, 'Catatan Uploader', $this->pengusul);

        $this->assertNotNull($lampiran);
        $this->assertDatabaseHas('t_kegiatan_lampiran', [
            'anggaran_id' => $this->anggaran->anggaran_id,
            'nama_file_asli' => 'bukti.jpg',
            'catatan' => 'Catatan Uploader',
            'uploader_user_id' => $this->pengusul->user_id,
        ]);

        Storage::disk('supabase')->assertExists($lampiran->path_file_disimpan);
    }

    public function test_store_fails_when_limit_reached(): void
    {
        // Pre-create 10 lampiran
        for ($i = 0; $i < 10; $i++) {
            KegiatanLampiran::create([
                'anggaran_id' => $this->anggaran->anggaran_id,
                'nama_file_asli' => "file_{$i}.jpg",
                'path_file_disimpan' => "path_{$i}",
                'uploader_user_id' => $this->pengusul->user_id,
                'status_lampiran' => 'pending',
            ]);
        }

        $file = UploadedFile::fake()->image('extra.jpg', 100);

        $this->expectException(Exception::class);
        $this->expectExceptionMessage('Maksimal 10 file per item anggaran. Hapus file lama terlebih dahulu.');

        $this->service->store($this->anggaran, $file, null, $this->pengusul);
    }

    public function test_destroy_archives_file(): void
    {
        $lampiran = KegiatanLampiran::create([
            'anggaran_id' => $this->anggaran->anggaran_id,
            'nama_file_asli' => 'bukti.jpg',
            'path_file_disimpan' => 'path',
            'uploader_user_id' => $this->pengusul->user_id,
            'status_lampiran' => 'pending',
        ]);

        $this->service->destroy($lampiran);

        $this->assertEquals('archived', $lampiran->fresh()->status_lampiran);
    }

    public function test_save_catatan_requests_revision(): void
    {
        $lampiran = KegiatanLampiran::create([
            'anggaran_id' => $this->anggaran->anggaran_id,
            'nama_file_asli' => 'bukti.jpg',
            'path_file_disimpan' => 'path',
            'uploader_user_id' => $this->pengusul->user_id,
            'status_lampiran' => 'pending',
        ]);

        $this->service->saveCatatan($lampiran, 'Perlu perbaikan', $this->bendahara);

        $lampiran->refresh();
        $this->assertEquals('revision_requested', $lampiran->status_lampiran);
        $this->assertEquals('Perlu perbaikan', $lampiran->catatan_reviewer);
        $this->assertEquals($this->bendahara->user_id, $lampiran->reviewer_user_id);
    }

    public function test_approve_and_cleans_up_parents(): void
    {
        $parent = KegiatanLampiran::create([
            'anggaran_id' => $this->anggaran->anggaran_id,
            'nama_file_asli' => 'old.jpg',
            'path_file_disimpan' => 'lampiran/1/old.jpg',
            'uploader_user_id' => $this->pengusul->user_id,
            'status_lampiran' => 'archived',
        ]);
        Storage::disk('supabase')->put($parent->path_file_disimpan, 'old-data');

        $child = KegiatanLampiran::create([
            'anggaran_id' => $this->anggaran->anggaran_id,
            'nama_file_asli' => 'new.jpg',
            'path_file_disimpan' => 'lampiran/1/new.jpg',
            'uploader_user_id' => $this->pengusul->user_id,
            'status_lampiran' => 'pending',
            'parent_lampiran_id' => $parent->lampiran_id,
        ]);
        Storage::disk('supabase')->put($child->path_file_disimpan, 'new-data');

        $this->service->approve($child, $this->bendahara);

        $this->assertEquals('approved', $child->fresh()->status_lampiran);

        // Verify parent deleted from disk and db
        Storage::disk('supabase')->assertMissing($parent->path_file_disimpan);
        $this->assertDatabaseMissing('t_kegiatan_lampiran', ['lampiran_id' => $parent->lampiran_id]);

        // Child still exists
        Storage::disk('supabase')->assertExists($child->path_file_disimpan);
    }

    public function test_resubmit_success(): void
    {
        $lampiran = KegiatanLampiran::create([
            'anggaran_id' => $this->anggaran->anggaran_id,
            'nama_file_asli' => 'v1.pdf',
            'path_file_disimpan' => 'lampiran/1/v1.pdf',
            'uploader_user_id' => $this->pengusul->user_id,
            'status_lampiran' => 'revision_requested',
        ]);

        $file = UploadedFile::fake()->create('v2.pdf', 500, 'application/pdf');

        $child = $this->service->resubmit($lampiran, $file, 'Revisi uploader', $this->pengusul);

        $this->assertNotNull($child);
        $this->assertEquals('archived', $lampiran->fresh()->status_lampiran);
        $this->assertEquals(1, $child->revisi_ke);
        $this->assertEquals($lampiran->lampiran_id, $child->parent_lampiran_id);

        Storage::disk('supabase')->assertExists($child->path_file_disimpan);
    }

    public function test_resubmit_fails_when_not_needing_revision(): void
    {
        $lampiran = KegiatanLampiran::create([
            'anggaran_id' => $this->anggaran->anggaran_id,
            'nama_file_asli' => 'v1.pdf',
            'path_file_disimpan' => 'path',
            'uploader_user_id' => $this->pengusul->user_id,
            'status_lampiran' => 'pending', // NOT revision_requested
        ]);

        $file = UploadedFile::fake()->create('v2.pdf', 500, 'application/pdf');

        $this->expectException(Exception::class);
        $this->expectExceptionMessage('Lampiran ini tidak memerlukan revisi.');

        $this->service->resubmit($lampiran, $file, null, $this->pengusul);
    }
}

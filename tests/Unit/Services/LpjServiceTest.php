<?php

namespace Tests\Unit\Services;

use App\Events\LpjApproved;
use App\Events\LpjCompleted;
use App\Events\LpjRevised;
use App\Events\LpjSubmitted;
use App\Exceptions\LpjException;
use App\Models\KAK;
use App\Models\KAKAnggaran;
use App\Models\KAKIku;
use App\Models\Iku;
use App\Models\Kegiatan;
use App\Models\KegiatanApproval;
use App\Models\KegiatanLampiran;
use App\Models\Satuan;
use App\Models\User;
use App\Services\LpjService;
use Database\Seeders\MasterDataSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class LpjServiceTest extends TestCase
{
    use RefreshDatabase;

    private LpjService $service;

    private User $pengusul;

    private User $bendahara;

    private Satuan $satuan;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(MasterDataSeeder::class);
        $this->service = new LpjService;

        $this->pengusul = User::factory()->create(['role_id' => 3]);
        $this->bendahara = User::factory()->create(['role_id' => 6]);
        $this->satuan = Satuan::first();
        Storage::fake('supabase');
    }

    private function createKegiatanAtLpjStage(int $totalAnggaran = 5000000): Kegiatan
    {
        $kak = KAK::create([
            'nama_kegiatan' => 'Test Kegiatan LPJ',
            'deskripsi_kegiatan' => 'Test',
            'pengusul_user_id' => $this->pengusul->user_id,
            'status_id' => 10, // Menunggu LPJ
            'tanggal_mulai' => now()->subDays(5),
            'tanggal_selesai' => now()->subDays(1),
            'tipe_kegiatan_id' => 1,
            'mata_anggaran_id' => 1,
        ]);

        KAKAnggaran::create([
            'kak_id' => $kak->kak_id,
            'kategori_belanja_id' => 1,
            'uraian' => 'Honorarium Narasumber',
            'volume1' => 2,
            'satuan1_id' => $this->satuan->satuan_id,
            'harga_satuan' => $totalAnggaran / 2,
            'jumlah_diusulkan' => $totalAnggaran,
        ]);

        // Create IKU data for testing
        $iku1 = Iku::create([
            'kode_iku' => 'IKU-TEST-001',
            'nama_iku' => 'Test IKU 1',
        ]);

        $iku2 = Iku::create([
            'kode_iku' => 'IKU-TEST-002',
            'nama_iku' => 'Test IKU 2',
        ]);

        // Link IKUs to KAK via the pivot table
        KAKIku::create([
            'kak_id' => $kak->kak_id,
            'iku_id' => $iku1->iku_id,
            'spk_kesesuaian_output_score' => 100,
            'satuan_id' => 1,
            'target' => 10,
        ]);

        KAKIku::create([
            'kak_id' => $kak->kak_id,
            'iku_id' => $iku2->iku_id,
            'spk_kesesuaian_output_score' => 0,
            'satuan_id' => 1,
            'target' => 5,
        ]);

        $kegiatan = Kegiatan::create([
            'kak_id' => $kak->kak_id,
            'penanggung_jawab_manual' => 'Test PJ',
            'pelaksana_manual' => 'Test Pelaksana',
            'tgl_batas_lpj' => now()->addDays(14)->toDateString(),
        ]);

        $steps = ['PPK', 'Wadir2', 'Bendahara-Cair', 'Bendahara-LPJ', 'Bendahara-Setor'];
        foreach ($steps as $step) {
            $status = match ($step) {
                'PPK', 'Wadir2', 'Bendahara-Cair' => 'Disetujui',
                'Bendahara-LPJ' => 'Aktif',
                default => 'Menunggu',
            };
            KegiatanApproval::create([
                'kegiatan_id' => $kegiatan->kegiatan_id,
                'approval_level' => $step,
                'status' => $status,
            ]);
        }

        return $kegiatan;
    }

    private function getIkuScores(Kegiatan $kegiatan): array
    {
        return $kegiatan->kak->ikus->map(function ($kakIku) {
            return [
                'kak_id' => $kakIku->kak_id,
                'iku_id' => $kakIku->iku_id,
                'score' => $kakIku->spk_kesesuaian_output_score,
            ];
        })->toArray();
    }

    public function test_submit_success(): void
    {
        Event::fake();

        $kegiatan = $this->createKegiatanAtLpjStage();
        $anggaran = KAKAnggaran::where('kak_id', $kegiatan->kak_id)->first();

        $realisasi = [
            $anggaran->anggaran_id => [
                'volume1' => '2',
                'satuan1_id' => (string) $this->satuan->satuan_id,
                'volume2' => '',
                'satuan2_id' => '',
                'volume3' => '',
                'satuan3_id' => '',
                'harga_satuan' => '2000000',
            ],
        ];

        $files = [
            $anggaran->anggaran_id => [
                UploadedFile::fake()->create('bukti.pdf', 500, 'application/pdf'),
            ],
        ];

        $spkInputs = [
            'realisasi_tgl_mulai' => now()->subDays(5)->toDateString(),
            'realisasi_tgl_selesai' => now()->subDays(1)->toDateString(),
        ];

        $ikuScores = $this->getIkuScores($kegiatan);

        $this->service->submit($kegiatan, $realisasi, $files, $spkInputs, $ikuScores, $this->pengusul);

        $kegiatan->refresh();
        $this->assertNotNull($kegiatan->lpj_submitted_at);
        $this->assertEquals(100, $kegiatan->spk_kesesuaian_waktu);
        $this->assertEquals(50, $kegiatan->spk_kesesuaian_output); // Average of 100 and 0

        $this->assertDatabaseHas('t_kak', [
            'kak_id' => $kegiatan->kak_id,
            'status_id' => 11, // Review LPJ
        ]);

        $this->assertDatabaseHas('t_kegiatan_lampiran', [
            'anggaran_id' => $anggaran->anggaran_id,
            'nama_file_asli' => 'bukti.pdf',
        ]);

        Event::assertDispatched(LpjSubmitted::class, function ($event) use ($kegiatan) {
            return $event->kegiatan->kegiatan_id === $kegiatan->kegiatan_id && $event->type === 'submitted';
        });
    }

    public function test_submit_fails_when_already_submitted(): void
    {
        $kegiatan = $this->createKegiatanAtLpjStage();
        $kegiatan->update(['lpj_submitted_at' => now()]);

        $this->expectException(LpjException::class);
        $this->expectExceptionMessage('LPJ untuk kegiatan ini sudah pernah disubmit.');

        $this->service->submit($kegiatan, [], null, [], [], $this->pengusul);
    }

    public function test_resubmit_success(): void
    {
        Event::fake();

        $kegiatan = $this->createKegiatanAtLpjStage();
        $anggaran = KAKAnggaran::where('kak_id', $kegiatan->kak_id)->first();

        // Put in revised state
        $kegiatan->kak->update(['status_id' => 12]);
        KegiatanApproval::where('kegiatan_id', $kegiatan->kegiatan_id)
            ->where('approval_level', 'Bendahara-LPJ')
            ->update(['status' => 'Revisi']);

        $lampiran = KegiatanLampiran::create([
            'anggaran_id' => $anggaran->anggaran_id,
            'nama_file_asli' => 'old_bukti.pdf',
            'path_file_disimpan' => 'lampiran/'.$anggaran->anggaran_id.'/old_bukti.pdf',
            'uploader_user_id' => $this->pengusul->user_id,
            'status_lampiran' => 'pending',
        ]);

        $realisasi = [
            $anggaran->anggaran_id => [
                'volume1' => '2',
                'satuan1_id' => (string) $this->satuan->satuan_id,
                'volume2' => '',
                'satuan2_id' => '',
                'volume3' => '',
                'satuan3_id' => '',
                'harga_satuan' => '2100000',
            ],
        ];

        $files = [
            $anggaran->anggaran_id => [
                UploadedFile::fake()->create('new_bukti.pdf', 500, 'application/pdf'),
            ],
        ];

        $spkInputs = [
            'realisasi_tgl_mulai' => now()->subDays(5)->toDateString(),
            'realisasi_tgl_selesai' => now()->subDays(1)->toDateString(),
        ];

        $ikuScores = $this->getIkuScores($kegiatan);

        $this->service->resubmit($kegiatan, $realisasi, $files, [$lampiran->lampiran_id], $spkInputs, $ikuScores, $this->pengusul);

        $kegiatan->refresh();
        $this->assertEquals(100, $kegiatan->spk_kesesuaian_waktu);
        $this->assertEquals('archived', $lampiran->fresh()->status_lampiran);

        $this->assertDatabaseHas('t_kak', [
            'kak_id' => $kegiatan->kak_id,
            'status_id' => 11, // Back to Review LPJ
        ]);

        $this->assertDatabaseHas('t_kegiatan_approval', [
            'kegiatan_id' => $kegiatan->kegiatan_id,
            'approval_level' => 'Bendahara-LPJ',
            'status' => 'Aktif',
        ]);

        Event::assertDispatched(LpjSubmitted::class, function ($event) use ($kegiatan) {
            return $event->kegiatan->kegiatan_id === $kegiatan->kegiatan_id && $event->type === 'resubmitted';
        });
    }

    public function test_resubmit_fails_when_not_in_revisi(): void
    {
        $kegiatan = $this->createKegiatanAtLpjStage();

        $this->expectException(LpjException::class);
        $this->expectExceptionMessage('LPJ tidak dalam status revisi.');

        $this->service->resubmit($kegiatan, [], null, [], [], [], $this->pengusul);
    }

    public function test_revise_success(): void
    {
        Event::fake();

        $kegiatan = $this->createKegiatanAtLpjStage();
        $anggaran = KAKAnggaran::where('kak_id', $kegiatan->kak_id)->first();
        $lampiran = KegiatanLampiran::create([
            'anggaran_id' => $anggaran->anggaran_id,
            'nama_file_asli' => 'bukti.pdf',
            'path_file_disimpan' => 'path',
            'uploader_user_id' => $this->pengusul->user_id,
            'status_lampiran' => 'pending',
        ]);

        $anggaranComments = [
            ['id' => $anggaran->anggaran_id, 'catatan_reviewer' => 'Revisi Anggaran'],
        ];
        $lampiranComments = [
            ['id' => $lampiran->lampiran_id, 'catatan_reviewer' => 'Revisi File'],
        ];

        $this->service->revise($kegiatan, $anggaranComments, $lampiranComments, $this->bendahara);

        $kegiatan->refresh();
        $this->assertEquals(12, $kegiatan->kak->status_id);

        $this->assertDatabaseHas('t_kegiatan_approval', [
            'kegiatan_id' => $kegiatan->kegiatan_id,
            'approval_level' => 'Bendahara-LPJ',
            'status' => 'Revisi',
            'approver_user_id' => $this->bendahara->user_id,
        ]);

        $this->assertDatabaseHas('t_kak_anggaran', [
            'anggaran_id' => $anggaran->anggaran_id,
            'catatan_verifikator' => 'Revisi Anggaran',
        ]);

        $this->assertDatabaseHas('t_kegiatan_lampiran', [
            'lampiran_id' => $lampiran->lampiran_id,
            'catatan_reviewer' => 'Revisi File',
        ]);

        Event::assertDispatched(LpjRevised::class);
    }

    public function test_approve_success(): void
    {
        Event::fake();

        $kegiatan = $this->createKegiatanAtLpjStage();

        $this->service->approve($kegiatan, $this->bendahara);

        $kegiatan->refresh();
        $this->assertEquals(13, $kegiatan->kak->status_id);

        $this->assertDatabaseHas('t_kegiatan_approval', [
            'kegiatan_id' => $kegiatan->kegiatan_id,
            'approval_level' => 'Bendahara-LPJ',
            'status' => 'Disetujui',
        ]);

        $this->assertDatabaseHas('t_kegiatan_approval', [
            'kegiatan_id' => $kegiatan->kegiatan_id,
            'approval_level' => 'Bendahara-Setor',
            'status' => 'Aktif',
        ]);

        Event::assertDispatched(LpjApproved::class);
    }

    public function test_complete_success(): void
    {
        Event::fake();

        $kegiatan = $this->createKegiatanAtLpjStage();
        // Simulate digital LPJ already approved, pending physically submitted
        KegiatanApproval::where('kegiatan_id', $kegiatan->kegiatan_id)
            ->where('approval_level', 'Bendahara-LPJ')
            ->update(['status' => 'Disetujui']);
        KegiatanApproval::where('kegiatan_id', $kegiatan->kegiatan_id)
            ->where('approval_level', 'Bendahara-Setor')
            ->update(['status' => 'Aktif']);
        $kegiatan->kak->update(['status_id' => 13]);

        $this->service->complete($kegiatan, $this->bendahara);

        $kegiatan->refresh();
        $this->assertEquals(14, $kegiatan->kak->status_id);

        $this->assertDatabaseHas('t_kegiatan_approval', [
            'kegiatan_id' => $kegiatan->kegiatan_id,
            'approval_level' => 'Bendahara-Setor',
            'status' => 'Disetujui',
        ]);

        Event::assertDispatched(LpjCompleted::class);
    }

    public function test_get_eligible_lpjs_includes_tgl_batas_lpj(): void
    {
        $kegiatan = $this->createKegiatanAtLpjStage();
        $kegiatan->update(['tgl_batas_lpj' => '2026-06-15 12:00:00']);

        $lpjs = $this->service->getEligibleLpjs($this->pengusul);

        $this->assertNotEmpty($lpjs);
        $matched = $lpjs->firstWhere('kegiatan_id', $kegiatan->kegiatan_id);
        $this->assertNotNull($matched);
        $this->assertEquals('2026-06-15 12:00:00', $matched['tgl_batas_lpj']);
    }
}

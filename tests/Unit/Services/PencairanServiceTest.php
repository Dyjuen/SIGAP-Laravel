<?php

namespace Tests\Unit\Services;

use App\Exceptions\PencairanException;
use App\Events\PencairanSelesai;
use App\Models\KAK;
use App\Models\KAKAnggaran;
use App\Models\Kegiatan;
use App\Models\KegiatanApproval;
use App\Models\PencairanDana;
use App\Models\User;
use App\Services\PencairanService;
use Database\Seeders\MasterDataSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Tests\TestCase;

class PencairanServiceTest extends TestCase
{
    use RefreshDatabase;

    private PencairanService $service;
    private User $pengusul;
    private User $bendahara;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(MasterDataSeeder::class);
        $this->service = new PencairanService();

        $this->pengusul = User::factory()->create(['role_id' => 3]);
        $this->bendahara = User::factory()->create(['role_id' => 6]);
    }

    private function createKegiatanAtBendaharaCair(int $totalAnggaran = 5000000): Kegiatan
    {
        $kak = KAK::create([
            'nama_kegiatan' => 'Test Kegiatan Pencairan',
            'deskripsi_kegiatan' => 'Test',
            'pengusul_user_id' => $this->pengusul->user_id,
            'status_id' => 8, // Proses Pencairan
            'tanggal_mulai' => now()->addDays(1),
            'tanggal_selesai' => now()->addDays(5),
            'tipe_kegiatan_id' => 1,
            'mata_anggaran_id' => 1,
        ]);

        KAKAnggaran::create([
            'kak_id' => $kak->kak_id,
            'kategori_belanja_id' => 1,
            'uraian' => 'Test Anggaran',
            'volume1' => 1,
            'satuan1_id' => 1,
            'harga_satuan' => $totalAnggaran,
            'jumlah_diusulkan' => $totalAnggaran,
        ]);

        $kegiatan = Kegiatan::create([
            'kak_id' => $kak->kak_id,
            'penanggung_jawab_manual' => 'Test PJ',
            'pelaksana_manual' => 'Test Pelaksana',
        ]);

        $steps = ['PPK', 'Wadir2', 'Bendahara-Cair', 'Bendahara-LPJ', 'Bendahara-Setor'];
        foreach ($steps as $step) {
            $status = match ($step) {
                'PPK', 'Wadir2' => 'Disetujui',
                'Bendahara-Cair' => 'Aktif',
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

    public function test_compute_sisa_dana(): void
    {
        $kegiatan = $this->createKegiatanAtBendaharaCair(5000000);
        PencairanDana::create([
            'kegiatan_id' => $kegiatan->kegiatan_id,
            'jumlah_dicairkan' => 2000000,
            'created_by' => $this->bendahara->user_id,
            'tanggal_pencairan' => now()->toDateString(),
        ]);

        $summary = $this->service->computeSisaDana($kegiatan);

        $this->assertEquals(5000000, $summary['total_anggaran_disetujui']);
        $this->assertEquals(2000000, $summary['total_dicairkan']);
        $this->assertEquals(3000000, $summary['sisa_dana']);
    }

    public function test_store_success(): void
    {
        $kegiatan = $this->createKegiatanAtBendaharaCair(5000000);

        $pencairan = $this->service->store($kegiatan, 2000000, 'Tahap 1', $this->bendahara);

        $this->assertNotNull($pencairan);
        $this->assertDatabaseHas('t_pencairan_dana', [
            'kegiatan_id' => $kegiatan->kegiatan_id,
            'jumlah_dicairkan' => 2000000,
            'keterangan' => 'Tahap 1',
            'created_by' => $this->bendahara->user_id,
        ]);
    }

    public function test_store_fails_when_bendahara_cair_not_active(): void
    {
        $kegiatan = $this->createKegiatanAtBendaharaCair(5000000);
        KegiatanApproval::where('kegiatan_id', $kegiatan->kegiatan_id)
            ->where('approval_level', 'Bendahara-Cair')
            ->update(['status' => 'Disetujui']);

        $this->expectException(PencairanException::class);
        $this->expectExceptionMessage('Pencairan belum dapat dilakukan. Status persetujuan Bendahara-Cair belum Aktif.');

        $this->service->store($kegiatan, 2000000, 'Tahap 1', $this->bendahara);
    }

    public function test_store_fails_when_exceeding_sisa_dana(): void
    {
        $kegiatan = $this->createKegiatanAtBendaharaCair(5000000);

        $this->expectException(PencairanException::class);
        $this->expectExceptionMessage('Nominal pencairan melebihi sisa dana yang tersedia.');

        $this->service->store($kegiatan, 6000000, 'Exceeded', $this->bendahara);
    }

    public function test_selesai_success(): void
    {
        Event::fake();

        $kegiatan = $this->createKegiatanAtBendaharaCair(5000000);
        PencairanDana::create([
            'kegiatan_id' => $kegiatan->kegiatan_id,
            'jumlah_dicairkan' => 5000000,
            'created_by' => $this->bendahara->user_id,
            'tanggal_pencairan' => now()->toDateString(),
        ]);

        $this->service->selesai($kegiatan, $this->bendahara);

        $kegiatan->refresh();
        $this->assertEquals(10, $kegiatan->kak->status_id);

        $this->assertDatabaseHas('t_kegiatan_approval', [
            'kegiatan_id' => $kegiatan->kegiatan_id,
            'approval_level' => 'Bendahara-Cair',
            'status' => 'Disetujui',
        ]);

        $this->assertDatabaseHas('t_kegiatan_approval', [
            'kegiatan_id' => $kegiatan->kegiatan_id,
            'approval_level' => 'Bendahara-LPJ',
            'status' => 'Aktif',
        ]);

        Event::assertDispatched(PencairanSelesai::class, function ($event) use ($kegiatan) {
            return $event->kegiatan->kegiatan_id === $kegiatan->kegiatan_id && $event->jumlah == 5000000;
        });
    }

    public function test_selesai_fails_when_bendahara_cair_not_active(): void
    {
        $kegiatan = $this->createKegiatanAtBendaharaCair(5000000);
        KegiatanApproval::where('kegiatan_id', $kegiatan->kegiatan_id)
            ->where('approval_level', 'Bendahara-Cair')
            ->update(['status' => 'Disetujui']);

        $this->expectException(PencairanException::class);
        $this->expectExceptionMessage('Proses pencairan belum aktif atau sudah diselesaikan.');

        $this->service->selesai($kegiatan, $this->bendahara);
    }
}

<?php

namespace Tests\Unit\Services;

use App\Events\KakApproved;
use App\Events\KakRejected;
use App\Events\KakRevised;
use App\Events\KakSubmitted;
use App\Exceptions\KakWorkflowException;
use App\Models\KAK;
use App\Models\KAKAnggaran;
use App\Models\KAKManfaat;
use App\Models\User;
use App\Services\KakWorkflowService;
use Database\Seeders\MasterDataSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Tests\TestCase;

class KakWorkflowServiceTest extends TestCase
{
    use RefreshDatabase;

    private KakWorkflowService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(MasterDataSeeder::class);
        $this->service = new KakWorkflowService;
    }

    public function test_it_submits_kak_and_dispatches_event(): void
    {
        Event::fake();

        $pengusul = User::factory()->create(['role_id' => 3]);
        $kak = KAK::factory()->create(['pengusul_user_id' => $pengusul->user_id, 'status_id' => 1]); // Draft

        $this->service->submit($kak, $pengusul);

        $this->assertDatabaseHas('t_kak', [
            'kak_id' => $kak->kak_id,
            'status_id' => 2, // Review
        ]);
        $this->assertDatabaseHas('t_kak_log_status', [
            'kak_id' => $kak->kak_id,
            'status_id_baru' => 2,
            'actor_user_id' => $pengusul->user_id,
        ]);

        Event::assertDispatched(KakSubmitted::class, function ($event) use ($kak) {
            return $event->kak->kak_id === $kak->kak_id && $event->type === 'submitted';
        });
    }

    public function test_it_approves_kak_creates_mata_anggaran_and_dispatches_event(): void
    {
        Event::fake();

        $verif = User::factory()->create(['role_id' => 2, 'username' => 'verifikator1']);
        $pengusul = User::factory()->create(['role_id' => 3]);
        $kak = KAK::factory()->review()->create([
            'pengusul_user_id' => $pengusul->user_id,
            'tipe_kegiatan_id' => 1,
            'catatan_nama_kegiatan' => 'Some revision note',
        ]);

        $data = [
            'kode_anggaran' => 'NEW-MAK-999',
            'nama_sumber_dana' => 'Dana Baru',
            'tahun_anggaran' => 2025,
            'total_pagu' => 5000000,
        ];

        $this->service->approve($kak, $data, $verif);

        $this->assertDatabaseHas('t_kak', [
            'kak_id' => $kak->kak_id,
            'status_id' => 3, // Approved
            'catatan_nama_kegiatan' => null, // Cleared on approval
        ]);
        $this->assertDatabaseHas('m_mata_anggaran', [
            'kode_anggaran' => 'NEW-MAK-999',
        ]);

        $kak->refresh();
        $this->assertNotNull($kak->mata_anggaran_id);

        Event::assertDispatched(KakApproved::class);
    }

    public function test_it_rejects_kak_and_dispatches_event(): void
    {
        Event::fake();

        $verif = User::factory()->create(['role_id' => 2, 'username' => 'verifikator1']);
        $pengusul = User::factory()->create(['role_id' => 3]);
        $kak = KAK::factory()->review()->create([
            'pengusul_user_id' => $pengusul->user_id,
            'tipe_kegiatan_id' => 1,
        ]);

        $this->service->reject($kak, 'Ditolak karena tidak sesuai sasaran', $verif);

        $this->assertDatabaseHas('t_kak', [
            'kak_id' => $kak->kak_id,
            'status_id' => 4, // Rejected
        ]);
        $this->assertDatabaseHas('t_kak_approval', [
            'kak_id' => $kak->kak_id,
            'status' => 'Ditolak',
            'catatan' => 'Ditolak karena tidak sesuai sasaran',
            'approver_user_id' => $verif->user_id,
        ]);

        Event::assertDispatched(KakRejected::class);
    }

    public function test_it_revises_kak_and_dispatches_event(): void
    {
        Event::fake();

        $verif = User::factory()->create(['role_id' => 2, 'username' => 'verifikator1']);
        $pengusul = User::factory()->create(['role_id' => 3]);
        $kak = KAK::factory()->review()->create([
            'pengusul_user_id' => $pengusul->user_id,
            'tipe_kegiatan_id' => 1,
        ]);

        $anggaran = KAKAnggaran::create([
            'kak_id' => $kak->kak_id,
            'kategori_belanja_id' => 1,
            'uraian' => 'Test Uraian',
        ]);
        $manfaat = KAKManfaat::create([
            'kak_id' => $kak->kak_id,
            'manfaat' => 'Test Manfaat',
        ]);

        $data = [
            'catatan' => 'General revision note',
            'catatan_kak' => [
                'nama_kegiatan' => 'Fix Name',
            ],
            'anak' => [
                't_kak_anggaran' => [
                    ['id' => $anggaran->anggaran_id, 'catatan_verifikator' => 'RAB terlalu mahal'],
                ],
                't_kak_manfaat' => [
                    ['id' => $manfaat->manfaat_id, 'catatan_manfaat' => 'Manfaat kurang jelas'],
                ],
            ],
        ];

        $this->service->revise($kak, $data, $verif);

        $this->assertDatabaseHas('t_kak', [
            'kak_id' => $kak->kak_id,
            'status_id' => 5, // Revisi
            'catatan_nama_kegiatan' => 'Fix Name',
        ]);
        $this->assertDatabaseHas('t_kak_anggaran', [
            'anggaran_id' => $anggaran->anggaran_id,
            'catatan_verifikator' => 'RAB terlalu mahal',
        ]);
        $this->assertDatabaseHas('t_kak_manfaat', [
            'manfaat_id' => $manfaat->manfaat_id,
            'catatan_manfaat' => 'Manfaat kurang jelas',
        ]);

        Event::assertDispatched(KakRevised::class);
    }

    public function test_it_throws_exception_on_invalid_status_transition(): void
    {
        $pengusul = User::factory()->create(['role_id' => 3]);
        $kak = KAK::factory()->approved()->create(['pengusul_user_id' => $pengusul->user_id]); // Approved

        $this->expectException(KakWorkflowException::class);
        $this->expectExceptionMessage('Anda hanya dapat mengajukan KAK dengan status Draft atau Revisi.');

        $this->service->submit($kak, $pengusul);
    }
}

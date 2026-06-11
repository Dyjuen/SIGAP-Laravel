<?php

namespace Tests\Feature;

use App\Mail\LPJWorkflowMail;
use App\Models\KAK;
use App\Models\KAKAnggaran;
use App\Models\Kegiatan;
use App\Models\KegiatanApproval;
use App\Models\Satuan;
use App\Models\User;
use Database\Seeders\MasterDataSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class LpjMailTest extends TestCase
{
    use RefreshDatabase;

    private User $pengusul;

    private User $bendahara;

    private Satuan $satuan;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(MasterDataSeeder::class);
        Mail::fake();

        $this->pengusul = User::factory()->create(['role_id' => 3]);
        $this->bendahara = User::factory()->create(['role_id' => 6]);
        $this->satuan = Satuan::first();
    }

    private function createKegiatanAtLpjStage(): Kegiatan
    {
        $kak = KAK::create([
            'nama_kegiatan' => 'Test Kegiatan LPJ',
            'deskripsi_kegiatan' => 'Test',
            'pengusul_user_id' => $this->pengusul->user_id,
            'status_id' => 10,
            'tanggal_mulai' => now()->subDays(5),
            'tanggal_selesai' => now()->subDays(1),
            'tipe_kegiatan_id' => 1,
            'mata_anggaran_id' => 1,
        ]);

        KAKAnggaran::create([
            'kak_id' => $kak->kak_id,
            'kategori_belanja_id' => 1,
            'uraian' => 'Item',
            'volume1' => 1,
            'satuan1_id' => $this->satuan->satuan_id,
            'harga_satuan' => 1000,
            'jumlah_diusulkan' => 1000,
        ]);

        $kegiatan = Kegiatan::create(['kak_id' => $kak->kak_id]);

        $steps = ['PPK', 'Wadir2', 'Bendahara-Cair', 'Bendahara-LPJ', 'Bendahara-Setor'];
        foreach ($steps as $step) {
            KegiatanApproval::create([
                'kegiatan_id' => $kegiatan->kegiatan_id,
                'approval_level' => $step,
                'status' => in_array($step, ['PPK', 'Wadir2', 'Bendahara-Cair']) ? 'Disetujui' : ($step === 'Bendahara-LPJ' ? 'Aktif' : 'Menunggu'),
            ]);
        }

        return $kegiatan;
    }

    public function test_submit_lpj_sends_email_to_bendahara()
    {
        $kegiatan = $this->createKegiatanAtLpjStage();
        $anggaran = $kegiatan->kak->anggaran->first();

        $response = $this->actingAs($this->pengusul)->post(route('lpj.submit', $kegiatan), [
            'realisasi' => [
                $anggaran->anggaran_id => [
                    'volume1' => 1,
                    'satuan1_id' => $this->satuan->satuan_id,
                    'volume2' => '',
                    'satuan2_id' => '',
                    'volume3' => '',
                    'satuan3_id' => '',
                    'harga_satuan' => 1000,
                ],
            ],
            'realisasi_tgl_mulai' => now()->subDays(5)->toDateString(),
            'realisasi_tgl_selesai' => now()->subDays(1)->toDateString(),
            'spk_kesesuaian_output' => 100,
        ]);

        $response->assertStatus(302);
        $response->assertSessionHas('success');

        Mail::assertQueued(LPJWorkflowMail::class, function ($mail) {
            return $mail->hasTo($this->bendahara->email);
        });
    }

    public function test_revise_lpj_sends_email_to_pengusul()
    {
        $kegiatan = $this->createKegiatanAtLpjStage();
        $kegiatan->kak->update(['status_id' => 11]);
        $anggaran = $kegiatan->kak->anggaran->first();

        $response = $this->actingAs($this->bendahara)->post(route('lpj.revise', $kegiatan), [
            'anggaran_comments' => [
                ['id' => $anggaran->anggaran_id, 'catatan_reviewer' => 'Please revise this LPJ'],
            ],
        ]);

        $response->assertStatus(302);
        $response->assertSessionHas('success');

        Mail::assertQueued(LPJWorkflowMail::class, function ($mail) {
            return $mail->hasTo($this->pengusul->email) &&
                   str_contains($mail->mailData['body'], 'memerlukan revisi');
        });
    }

    public function test_approve_lpj_sends_email_to_pengusul()
    {
        $kegiatan = $this->createKegiatanAtLpjStage();
        $kegiatan->kak->update(['status_id' => 11]);

        $response = $this->actingAs($this->bendahara)->post(route('lpj.approve', $kegiatan));

        $response->assertStatus(302);
        $response->assertSessionHas('success');

        Mail::assertQueued(LPJWorkflowMail::class, function ($mail) {
            return $mail->hasTo($this->pengusul->email) &&
                   $mail->mailData['status_color'] === '#28a745';
        });
    }

    public function test_complete_lpj_sends_email_to_pengusul()
    {
        $kegiatan = $this->createKegiatanAtLpjStage();
        $kegiatan->kak->update(['status_id' => 13]);

        // Ensure only Bendahara-Setor is Aktif
        KegiatanApproval::where('kegiatan_id', $kegiatan->kegiatan_id)
            ->where('approval_level', 'Bendahara-LPJ')
            ->update(['status' => 'Disetujui']);

        KegiatanApproval::where('kegiatan_id', $kegiatan->kegiatan_id)
            ->where('approval_level', 'Bendahara-Setor')
            ->update(['status' => 'Aktif']);

        $response = $this->actingAs($this->bendahara)->post(route('lpj.complete', $kegiatan));

        $response->assertStatus(302);
        $response->assertSessionHas('success');

        Mail::assertQueued(LPJWorkflowMail::class, function ($mail) {
            return $mail->hasTo($this->pengusul->email) &&
                   str_contains($mail->mailData['body'], 'selesai');
        });
    }
}

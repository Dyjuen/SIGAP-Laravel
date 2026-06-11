<?php

namespace Tests\Feature;

use App\Models\KAK;
use App\Models\KAKAnggaran;
use App\Models\Kegiatan;
use App\Models\KegiatanApproval;
use App\Models\Satuan;
use App\Models\SpkConfig;
use App\Models\User;
use Database\Seeders\MasterDataSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SpkTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    private User $pengusul;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();

        // Run seeders including MasterDataSeeder to setup roles and SPK configs
        $this->seed(MasterDataSeeder::class);

        // Create Admin (Super Admin / Admin generally role_id = 1) and Pengusul (role_id = 3)
        $this->admin = User::factory()->create(['role_id' => 1]);
        $this->pengusul = User::factory()->create(['role_id' => 3]);
    }

    /**
     * Test guest and unauthorized user access restriction on SPK management.
     */
    public function test_unauthorized_cannot_access_spk_management(): void
    {
        // 1. Guest access is redirected to login
        $response = $this->get(route('admin.spk.index'));
        $response->assertRedirect('/login');

        // 2. Pengusul gets 403 Forbidden
        $response = $this->actingAs($this->pengusul)->get(route('admin.spk.index'));
        $response->assertStatus(403);

        // 3. Guest config update gets 403 Forbidden because RoleMiddleware intercepts it first
        $response = $this->post(route('admin.spk.config.update'), [
            'weight_waktu' => 25,
            'weight_anggaran' => 25,
            'weight_output' => 25,
            'weight_lpj' => 25,
        ]);
        $response->assertStatus(403);

        // 4. Pengusul config update gets 403 Forbidden
        $response = $this->actingAs($this->pengusul)->post(route('admin.spk.config.update'), [
            'weight_waktu' => 25,
            'weight_anggaran' => 25,
            'weight_output' => 25,
            'weight_lpj' => 25,
        ]);
        $response->assertStatus(403);
    }

    /**
     * Test admin can access SPK management page successfully.
     */
    public function test_admin_can_access_spk_management(): void
    {
        $response = $this->actingAs($this->admin)->get(route('admin.spk.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/Spk/Index')
            ->has('spk_config')
            ->has('kegiatans')
            ->has('statistics')
        );
    }

    /**
     * Test admin can successfully update configuration with correct weight sums.
     */
    public function test_admin_can_update_spk_config_successfully(): void
    {
        $payload = [
            'weight_waktu' => 10,
            'weight_anggaran' => 40,
            'weight_output' => 30,
            'weight_lpj' => 20,
            'waktu_min' => 60,
            'waktu_max' => 100,
            'anggaran_min' => 60,
            'anggaran_max' => 100,
            'output_min' => 0,
            'output_max' => 100,
            'lpj_min' => 60,
            'lpj_max' => 100,
            'lpj_penalty_per_day' => 4,
        ];

        $response = $this->actingAs($this->admin)
            ->from(route('admin.spk.index'))
            ->post(route('admin.spk.config.update'), $payload);

        $response->assertRedirect(route('admin.spk.index'));
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('m_spk_config', [
            'weight_waktu' => 10,
            'weight_anggaran' => 40,
            'weight_output' => 30,
            'weight_lpj' => 20,
            'waktu_min' => 60,
            'waktu_max' => 100,
            'lpj_penalty_per_day' => 4,
        ]);
    }

    /**
     * Test admin cannot update configuration with weights not summing to 100%.
     */
    public function test_admin_cannot_save_invalid_spk_weights(): void
    {
        // Total weights sum up to 90% instead of 100%
        $payload = [
            'weight_waktu' => 10,
            'weight_anggaran' => 30,
            'weight_output' => 30,
            'weight_lpj' => 20,
            'waktu_min' => 50,
            'waktu_max' => 100,
            'anggaran_min' => 50,
            'anggaran_max' => 100,
            'output_min' => 0,
            'output_max' => 100,
            'lpj_min' => 50,
            'lpj_max' => 100,
            'lpj_penalty_per_day' => 5,
        ];

        $response = $this->actingAs($this->admin)
            ->from(route('admin.spk.index'))
            ->post(route('admin.spk.config.update'), $payload);

        $response->assertRedirect(route('admin.spk.index'));
        $response->assertSessionHasErrors(['weights_sum']);

        // Assert database still has the default weights (25, 25, 25, 25)
        $this->assertDatabaseMissing('m_spk_config', [
            'weight_waktu' => 10,
        ]);
    }

    /**
     * Test LPJ submission respects dynamic database constraints for manual inputs.
     */
    public function test_lpj_submission_uses_dynamic_validation(): void
    {
        // Adjust the constraints: output_min = 70, output_max = 100
        SpkConfig::getActive()->update([
            'output_min' => 70,
            'output_max' => 100,
        ]);

        $kegiatan = $this->createKegiatanAtLpjStage($this->pengusul);
        $payload = $this->buildRealisasiPayload($kegiatan);

        // 1. Should fail because 60 is below output_min = 70
        $payload['spk_kesesuaian_output'] = 60;

        $response = $this->actingAs($this->pengusul)
            ->post(route('lpj.submit', $kegiatan->kegiatan_id), $payload);

        $response->assertSessionHasErrors(['spk_kesesuaian_output']);

        // 2. Should pass because 70 is within [70, 100] (specifically, one of the valid options in:70,100)
        $payload['spk_kesesuaian_output'] = 70;

        $response = $this->actingAs($this->pengusul)
            ->post(route('lpj.submit', $kegiatan->kegiatan_id), $payload);

        $response->assertSessionDoesntHaveErrors(['spk_kesesuaian_output']);
    }

    // =========================================================================
    // HELPER METHODS
    // =========================================================================

    /**
     * Create a full kegiatan fixture at LPJ stage (status 10).
     */
    private function createKegiatanAtLpjStage(User $pengusul): Kegiatan
    {
        $kak = KAK::create([
            'nama_kegiatan' => 'Test Kegiatan LPJ SPK',
            'deskripsi_kegiatan' => 'Test Description',
            'pengusul_user_id' => $pengusul->user_id,
            'status_id' => 10,
            'tanggal_mulai' => now()->subDays(5),
            'tanggal_selesai' => now()->subDays(1),
            'tipe_kegiatan_id' => 1,
            'mata_anggaran_id' => 1,
        ]);

        $satuan = Satuan::first() ?? Satuan::create(['nama_satuan' => 'Pcs']);

        KAKAnggaran::create([
            'kak_id' => $kak->kak_id,
            'kategori_belanja_id' => 1,
            'uraian' => 'Test Belanja',
            'volume1' => 1,
            'satuan1_id' => $satuan->satuan_id,
            'harga_satuan' => 1000000,
            'jumlah_diusulkan' => 1000000,
        ]);

        $kegiatan = Kegiatan::create([
            'kak_id' => $kak->kak_id,
            'penanggung_jawab_manual' => 'PJ Test',
            'pelaksana_manual' => 'Pelaksana Test',
        ]);

        $steps = ['PPK', 'Wadir2', 'Bendahara-Cair', 'Bendahara-LPJ'];
        foreach ($steps as $step) {
            $status = ($step === 'Bendahara-LPJ') ? 'Aktif' : 'Disetujui';
            KegiatanApproval::create([
                'kegiatan_id' => $kegiatan->kegiatan_id,
                'approval_level' => $step,
                'status' => $status,
            ]);
        }

        return $kegiatan;
    }

    /**
     * Build valid realisasi payload for submission.
     */
    private function buildRealisasiPayload(Kegiatan $kegiatan): array
    {
        $anggaran = KAKAnggaran::where('kak_id', $kegiatan->kak_id)->first();
        $satuan = Satuan::first();

        return [
            'realisasi' => [
                $anggaran->anggaran_id => [
                    'volume1' => '1',
                    'satuan1_id' => (string) $satuan->satuan_id,
                    'volume2' => '',
                    'satuan2_id' => '',
                    'volume3' => '',
                    'satuan3_id' => '',
                    'harga_satuan' => '1000000',
                ],
            ],
            'realisasi_tgl_mulai' => now()->subDays(5)->toDateString(),
            'realisasi_tgl_selesai' => now()->subDays(1)->toDateString(),
            'spk_kesesuaian_output' => 100,
        ];
    }
}

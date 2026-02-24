<?php

namespace Tests\Feature\Kegiatan;

use App\Models\KAK;
use App\Models\Kegiatan;
use App\Models\KegiatanApproval;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MonitoringKegiatanTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        // Seed master data required for KAK and Kegiatan
        $this->seed(\Database\Seeders\MasterDataSeeder::class);
    }

    private function createVerifikator($tipeId = 1)
    {
        return User::factory()->create(['role_id' => 2, 'username' => 'verifikator'.$tipeId]);
    }

    private function createPengusul()
    {
        return User::factory()->create(['role_id' => 3]);
    }

    private function createAdmin()
    {
        return User::factory()->create(['role_id' => 1]);
    }

    public function test_pengusul_can_only_see_own_kegiatan(): void
    {
        $pengusul1 = $this->createPengusul();
        $pengusul2 = $this->createPengusul();

        $kak1 = KAK::factory()->create(['pengusul_user_id' => $pengusul1->user_id]);
        $kak2 = KAK::factory()->create(['pengusul_user_id' => $pengusul2->user_id]);

        $kegiatan1 = Kegiatan::create(['kak_id' => $kak1->kak_id]);
        $kegiatan2 = Kegiatan::create(['kak_id' => $kak2->kak_id]);

        $response = $this->actingAs($pengusul1)->get(route('kegiatan.monitoring'));

        $response->assertStatus(200);

        // Assert that inertia views the page and passes props
        $response->assertInertia(
            fn (\Inertia\Testing\AssertableInertia $page) => $page
                ->component('Kegiatan/Monitoring')
                ->has('kegiatans.data', 1)
                ->where('kegiatans.data.0.kegiatan_id', $kegiatan1->kegiatan_id)
        );
    }

    public function test_verifikator_can_only_see_matching_tipe_kegiatan(): void
    {
        $verifikator1 = $this->createVerifikator(1); // Tipe 1
        $pengusul = $this->createPengusul();

        $kak1 = KAK::factory()->create(['pengusul_user_id' => $pengusul->user_id, 'tipe_kegiatan_id' => 1]);
        $kak2 = KAK::factory()->create(['pengusul_user_id' => $pengusul->user_id, 'tipe_kegiatan_id' => 2]);

        $kegiatan1 = Kegiatan::create(['kak_id' => $kak1->kak_id]);
        $kegiatan2 = Kegiatan::create(['kak_id' => $kak2->kak_id]);

        $response = $this->actingAs($verifikator1)->get(route('kegiatan.monitoring'));

        $response->assertStatus(200);

        $response->assertInertia(
            fn (\Inertia\Testing\AssertableInertia $page) => $page
                ->component('Kegiatan/Monitoring')
                ->has('kegiatans.data', 1)
                ->where('kegiatans.data.0.kegiatan_id', $kegiatan1->kegiatan_id)
        );
    }

    public function test_admin_can_see_all_kegiatan(): void
    {
        $admin = $this->createAdmin();
        $pengusul = $this->createPengusul();

        $kak1 = KAK::factory()->create(['pengusul_user_id' => $pengusul->user_id, 'tipe_kegiatan_id' => 1]);
        $kak2 = KAK::factory()->create(['pengusul_user_id' => $pengusul->user_id, 'tipe_kegiatan_id' => 2]);

        $kegiatan1 = Kegiatan::create(['kak_id' => $kak1->kak_id]);
        $kegiatan2 = Kegiatan::create(['kak_id' => $kak2->kak_id]);

        $response = $this->actingAs($admin)->get(route('kegiatan.monitoring'));

        $response->assertStatus(200);

        $response->assertInertia(
            fn (\Inertia\Testing\AssertableInertia $page) => $page
                ->component('Kegiatan/Monitoring')
                ->has('kegiatans.data', 2)
        );
    }

    public function test_stepper_status_computation(): void
    {
        $pengusul = $this->createPengusul();
        $kak = KAK::factory()->create(['pengusul_user_id' => $pengusul->user_id]);

        $kegiatan = Kegiatan::create(['kak_id' => $kak->kak_id]);

        // Create approvals correctly modeling current active step
        KegiatanApproval::create([
            'kegiatan_id' => $kegiatan->kegiatan_id,
            'approval_level' => 'PPK',
            'status' => 'Disetujui',
            'updated_at' => now(),
        ]);

        KegiatanApproval::create([
            'kegiatan_id' => $kegiatan->kegiatan_id,
            'approval_level' => 'Wadir2',
            'status' => 'Aktif',
            'updated_at' => now(),
        ]);

        $response = $this->actingAs($pengusul)->get(route('kegiatan.monitoring'));

        $response->assertStatus(200);

        $response->assertInertia(
            fn (\Inertia\Testing\AssertableInertia $page) => $page
                ->component('Kegiatan/Monitoring')
                ->has('kegiatans.data', 1)
                ->where('kegiatans.data.0.status', 2) // Step 2 (Wadir2) is active
                ->has('kegiatans.data.0.dates.accPPK') // The date should be mapped
                ->where('kegiatans.data.0.dates.accWD2', null) // Not yet approved
        );
    }
}

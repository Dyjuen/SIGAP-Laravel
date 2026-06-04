<?php

namespace Tests\Feature\Kegiatan;

use App\Models\KAK;
use App\Models\Kegiatan;
use App\Models\KegiatanApproval;
use App\Models\User;
use Database\Seeders\MasterDataSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class MonitoringKegiatanTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        // Seed master data required for KAK and Kegiatan
        $this->seed(MasterDataSeeder::class);
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
            fn (AssertableInertia $page) => $page
                ->component('Kegiatan/Monitoring')
                ->has('kegiatans.data', 1)
                ->where('kegiatans.data.0.kegiatan_id', $kegiatan1->kegiatan_id)
        );
    }

    public function test_unauthorized_roles_cannot_access_monitoring(): void
    {
        $verifikator = $this->createVerifikator(1);
        $bendahara = User::factory()->create(['role_id' => 6]);
        $rektorat = User::factory()->create(['role_id' => 7]);

        $this->actingAs($verifikator)->get(route('kegiatan.monitoring'))->assertStatus(403);
        $this->actingAs($bendahara)->get(route('kegiatan.monitoring'))->assertStatus(403);
        $this->actingAs($rektorat)->get(route('kegiatan.monitoring'))->assertStatus(403);
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
            fn (AssertableInertia $page) => $page
                ->component('Kegiatan/Monitoring')
                ->has('kegiatans.data', 2)
        );
    }

    public function test_monitoring_search_by_kak_name(): void
    {
        $admin = $this->createAdmin();
        $kak1 = KAK::factory()->create(['nama_kegiatan' => 'Workshop IT']);
        $kak2 = KAK::factory()->create(['nama_kegiatan' => 'Seminar Bisnis']);

        Kegiatan::create(['kak_id' => $kak1->kak_id]);
        Kegiatan::create(['kak_id' => $kak2->kak_id]);

        $response = $this->actingAs($admin)->get(route('kegiatan.monitoring', ['search' => 'Workshop']));

        $response->assertInertia(
            fn (AssertableInertia $page) => $page
                ->component('Kegiatan/Monitoring')
                ->has('kegiatans.data', 1)
                ->where('kegiatans.data.0.nama_kegiatan', 'Workshop IT')
        );
    }

    public function test_sequential_workflow_tracking(): void
    {
        $pengusul = $this->createPengusul();
        $ppk = User::factory()->create(['role_id' => 4]);
        $wadir = User::factory()->create(['role_id' => 5]);

        $kak = KAK::factory()->create(['pengusul_user_id' => $pengusul->user_id, 'status_id' => 6]);
        $kegiatan = Kegiatan::create(['kak_id' => $kak->kak_id]);

        $steps = ['PPK', 'Wadir2', 'Bendahara-Cair'];
        foreach ($steps as $step) {
            KegiatanApproval::create([
                'kegiatan_id' => $kegiatan->kegiatan_id,
                'approval_level' => $step,
                'status' => $step === 'PPK' ? 'Aktif' : 'Menunggu',
            ]);
        }

        // PPK Approves
        $this->actingAs($ppk)->post("/kegiatan/{$kegiatan->kegiatan_id}/approve", ['catatan' => 'PPK OK']);

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

        // Wadir Approves
        $this->actingAs($wadir)->post("/kegiatan/{$kegiatan->kegiatan_id}/approve", ['catatan' => 'Wadir OK']);

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
    }

    public function test_audit_log_creation_on_approval(): void
    {
        $ppk = User::factory()->create(['role_id' => 4]);
        $kak = KAK::factory()->create(['status_id' => 6]);
        $kegiatan = Kegiatan::create(['kak_id' => $kak->kak_id]);

        KegiatanApproval::create([
            'kegiatan_id' => $kegiatan->kegiatan_id,
            'approval_level' => 'PPK',
            'status' => 'Aktif',
        ]);

        $this->actingAs($ppk)->post("/kegiatan/{$kegiatan->kegiatan_id}/approve", ['catatan' => 'Audit Test']);

        $this->assertDatabaseHas('t_kegiatan_log_status', [
            'kegiatan_id' => $kegiatan->kegiatan_id,
            'status_id_baru' => 7,
            'actor_user_id' => $ppk->user_id,
            'catatan' => 'Audit Test',
        ]);
    }

    public function test_approval_with_empty_notes(): void
    {
        $ppk = User::factory()->create(['role_id' => 4]);
        $kak = KAK::factory()->create(['status_id' => 6]);
        $kegiatan = Kegiatan::create(['kak_id' => $kak->kak_id]);

        KegiatanApproval::create([
            'kegiatan_id' => $kegiatan->kegiatan_id,
            'approval_level' => 'PPK',
            'status' => 'Aktif',
        ]);

        $response = $this->actingAs($ppk)->post("/kegiatan/{$kegiatan->kegiatan_id}/approve", ['catatan' => '']);

        $response->assertRedirect();
        $this->assertDatabaseHas('t_kegiatan_approval', [
            'kegiatan_id' => $kegiatan->kegiatan_id,
            'approval_level' => 'PPK',
            'status' => 'Disetujui',
            'catatan' => null,
        ]);
    }

    public function test_bypass_approval_stage_fails(): void
    {
        $wadir = User::factory()->create(['role_id' => 5]);
        $kak = KAK::factory()->create(['status_id' => 6]); // Still at PPK
        $kegiatan = Kegiatan::create(['kak_id' => $kak->kak_id]);

        KegiatanApproval::create([
            'kegiatan_id' => $kegiatan->kegiatan_id,
            'approval_level' => 'PPK',
            'status' => 'Aktif',
        ]);
        KegiatanApproval::create([
            'kegiatan_id' => $kegiatan->kegiatan_id,
            'approval_level' => 'Wadir2',
            'status' => 'Menunggu',
        ]);

        // Wadir tries to approve while PPK is active
        $response = $this->actingAs($wadir)->post("/kegiatan/{$kegiatan->kegiatan_id}/approve", ['catatan' => 'Illegal']);

        $response->assertStatus(403);
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
            fn (AssertableInertia $page) => $page
                ->component('Kegiatan/Monitoring')
                ->has('kegiatans.data', 1)
                ->where('kegiatans.data.0.status', 2) // Step 2 (Wadir2) is active
                ->has('kegiatans.data.0.dates.accPPK') // The date should be mapped
                ->where('kegiatans.data.0.dates.accWD2', null) // Not yet approved
        );
    }

    public function test_monitoring_filter_by_kak_type(): void
    {
        $admin = $this->createAdmin();
        $kak1 = KAK::factory()->create(['tipe_kegiatan_id' => 1]);
        $kak2 = KAK::factory()->create(['tipe_kegiatan_id' => 2]);

        Kegiatan::create(['kak_id' => $kak1->kak_id]);
        Kegiatan::create(['kak_id' => $kak2->kak_id]);

        $response = $this->actingAs($admin)->get(route('kegiatan.monitoring', ['tipe_kegiatan_id' => 1]));

        $response->assertStatus(200);
        $response->assertInertia(
            fn (AssertableInertia $page) => $page
                ->component('Kegiatan/Monitoring')
                ->has('kegiatans.data', 1)
                ->where('kegiatans.data.0.kak_id', $kak1->kak_id)
        );
    }
}

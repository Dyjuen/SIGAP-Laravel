<?php

namespace Tests\Feature;

use App\Models\KAK;
use App\Models\Kegiatan;
use App\Models\KegiatanApproval;
use App\Models\Panduan;
use App\Models\User;
use Database\Seeders\MasterDataSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(MasterDataSeeder::class);
    }

    public function test_guest_redirected_to_login(): void
    {
        $response = $this->get(route('dashboard'));
        $response->assertRedirect(route('login'));
    }

    public function test_rektorat_redirected_to_direktur_dashboard(): void
    {
        $user = User::factory()->create(['role_id' => 7]); // Rektorat
        $response = $this->actingAs($user)->get(route('dashboard'));
        $response->assertRedirect(route('dashboard.direktur'));
    }

    public function test_pengusul_sees_own_stats(): void
    {
        $user = User::factory()->create(['role_id' => 3]); // Pengusul
        KAK::factory()->count(2)->create(['pengusul_user_id' => $user->user_id, 'status_id' => 1]); // Draft
        KAK::factory()->count(1)->create(['pengusul_user_id' => $user->user_id, 'status_id' => 3]); // Approved

        $response = $this->actingAs($user)->get(route('dashboard'));

        $response->assertStatus(200)
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dashboard')
                ->where('stats.total_kak', 3)
                ->where('stats.draft_kak', 2)
                ->where('stats.approved_kak', 1)
                ->has('panduans')
            );
    }

    public function test_ppk_sees_pending_queue(): void
    {
        $ppk = User::factory()->create(['role_id' => 4]); // PPK
        $kak = KAK::factory()->create(['status_id' => 6]); // Review PPK
        $kegiatan = Kegiatan::create(['kak_id' => $kak->kak_id]);
        KegiatanApproval::create([
            'kegiatan_id' => $kegiatan->kegiatan_id,
            'approval_level' => 'PPK',
            'status' => 'Aktif',
        ]);

        $response = $this->actingAs($ppk)->get(route('dashboard'));

        $response->assertStatus(200)
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dashboard')
                ->where('stats.pending_count', 1)
                ->has('pending_kegiatan', 1)
            );
    }

    public function test_wadir_sees_pending_queue(): void
    {
        $wadir = User::factory()->create(['role_id' => 5]); // Wadir
        $kak = KAK::factory()->create(['status_id' => 7]); // Review Wadir 2
        $kegiatan = Kegiatan::create(['kak_id' => $kak->kak_id]);
        KegiatanApproval::create([
            'kegiatan_id' => $kegiatan->kegiatan_id,
            'approval_level' => 'Wadir2',
            'status' => 'Aktif',
        ]);

        $response = $this->actingAs($wadir)->get(route('dashboard'));

        $response->assertStatus(200)
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dashboard')
                ->where('stats.pending_count', 1)
                ->has('pending_kegiatan', 1)
            );
    }

    public function test_verifikator_filters_by_tipe_kegiatan(): void
    {
        $verif1 = User::factory()->create(['role_id' => 2, 'username' => 'verifikator1']);
        KAK::factory()->create(['status_id' => 2, 'tipe_kegiatan_id' => 1]); // Matching
        KAK::factory()->create(['status_id' => 2, 'tipe_kegiatan_id' => 2]); // Non-matching

        $response = $this->actingAs($verif1)->get(route('dashboard'));

        $response->assertStatus(200)
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dashboard')
                ->where('stats.pending_kak', 1)
                ->has('recent_kaks', 1)
            );
    }

    public function test_verifikator_without_suffix_sees_all_kak(): void
    {
        $verif = User::factory()->create(['role_id' => 2, 'username' => 'verifikator']);
        KAK::factory()->create(['status_id' => 2, 'tipe_kegiatan_id' => 1]);
        KAK::factory()->create(['status_id' => 2, 'tipe_kegiatan_id' => 2]);

        $response = $this->actingAs($verif)->get(route('dashboard'));

        $response->assertStatus(200)
            ->assertInertia(fn (Assert $page) => $page
                ->where('stats.pending_kak', 2)
            );
    }

    public function test_bendahara_sees_ready_to_disburse(): void
    {
        $bendahara = User::factory()->create(['role_id' => 6]); // Bendahara
        
        // 1. Waiting
        $kak1 = KAK::factory()->create(['status_id' => 8]);
        $keg1 = Kegiatan::create(['kak_id' => $kak1->kak_id]);
        KegiatanApproval::create(['kegiatan_id' => $keg1->kegiatan_id, 'approval_level' => 'PPK', 'status' => 'Disetujui']);
        KegiatanApproval::create(['kegiatan_id' => $keg1->kegiatan_id, 'approval_level' => 'Wadir2', 'status' => 'Disetujui']);
        KegiatanApproval::create(['kegiatan_id' => $keg1->kegiatan_id, 'approval_level' => 'Bendahara-Cair', 'status' => 'Aktif']);

        // 2. Disbursed
        $kak2 = KAK::factory()->create(['status_id' => 10]);
        $keg2 = Kegiatan::create(['kak_id' => $kak2->kak_id]);
        KegiatanApproval::create(['kegiatan_id' => $keg2->kegiatan_id, 'approval_level' => 'PPK', 'status' => 'Disetujui']);
        KegiatanApproval::create(['kegiatan_id' => $keg2->kegiatan_id, 'approval_level' => 'Wadir2', 'status' => 'Disetujui']);
        KegiatanApproval::create(['kegiatan_id' => $keg2->kegiatan_id, 'approval_level' => 'Bendahara-Cair', 'status' => 'Disetujui']);
        // No active Bendahara-LPJ yet, so isLpjVerification is false, isDisbursed is true.

        // 3. LPJ Submitted
        $kak3 = KAK::factory()->create(['status_id' => 11]);
        $keg3 = Kegiatan::create(['kak_id' => $kak3->kak_id, 'lpj_submitted_at' => now()]);
        KegiatanApproval::create(['kegiatan_id' => $keg3->kegiatan_id, 'approval_level' => 'PPK', 'status' => 'Disetujui']);
        KegiatanApproval::create(['kegiatan_id' => $keg3->kegiatan_id, 'approval_level' => 'Wadir2', 'status' => 'Disetujui']);
        KegiatanApproval::create(['kegiatan_id' => $keg3->kegiatan_id, 'approval_level' => 'Bendahara-Cair', 'status' => 'Disetujui']);
        KegiatanApproval::create(['kegiatan_id' => $keg3->kegiatan_id, 'approval_level' => 'Bendahara-LPJ', 'status' => 'Aktif']);

        $response = $this->actingAs($bendahara)->get(route('dashboard'));

        $response->assertStatus(200)
            ->assertInertia(fn (Assert $page) => $page
                ->component('Bendahara/Dashboard')
                ->has('kegiatans', 3)
                ->where('kegiatans.0.status', 'waiting')
                ->where('kegiatans.1.status', 'disbursed')
                ->where('kegiatans.2.status', 'lpj_submitted')
            );
    }

    public function test_dashboard_filters_panduans_by_role(): void
    {
        $pengusul = User::factory()->create(['role_id' => 3]);
        Panduan::create(['judul_panduan' => 'P1', 'tipe_media' => 'video', 'target_role_id' => 3]);
        Panduan::create(['judul_panduan' => 'P2', 'tipe_media' => 'video', 'target_role_id' => 4]); // PPK only
        Panduan::create(['judul_panduan' => 'P3', 'tipe_media' => 'video', 'target_role_id' => null]); // All

        $response = $this->actingAs($pengusul)->get(route('dashboard'));

        $response->assertInertia(fn (Assert $page) => $page
            ->has('panduans', 2)
            ->where('panduans.0.judul', 'P1')
            ->where('panduans.1.judul', 'P3')
        );
    }
}

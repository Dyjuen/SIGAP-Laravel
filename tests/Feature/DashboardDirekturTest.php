<?php

namespace Tests\Feature;

use App\Models\KAK;
use App\Models\KAKAnggaran;
use App\Models\Kegiatan;
use App\Models\Panduan;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\MasterDataSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class DashboardDirekturTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();

        $this->seed(MasterDataSeeder::class);
    }

    /**
     * Test Case: TC-D-F09 - Dashboard direktur default periode 6 bulan
     */
    public function test_rektorat_can_access_dashboard()
    {
        $rektoratRole = Role::where('nama_role', 'Rektorat')->first();
        $rektorat = User::factory()->create(['role_id' => $rektoratRole->role_id]);

        $response = $this->actingAs($rektorat)->get(route('dashboard.direktur'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Direktur/Dashboard')
            ->has('dashboardData')
            ->has('dashboardData.overview')
            ->has('dashboardData.by_jurusan')
            ->has('dashboardData.trends')
            ->has('dashboardData.topsis_activities')
            ->has('dashboardData.spk_config')
        );
    }

    /**
     * Test Case: TC-D-F14 - Dashboard: Non-Rektorat tidak bisa akses dashboard direktur
     */
    public function test_pengusul_cannot_access_dashboard()
    {
        $pengusulRole = Role::where('nama_role', 'Pengusul')->first();
        $pengusul = User::factory()->create(['role_id' => $pengusulRole->role_id]);

        $response = $this->actingAs($pengusul)->get(route('dashboard.direktur'));

        $response->assertStatus(403);
    }

    /**
     * Test Case: TC-D-F10, F11, F12, F13 - Dashboard direktur filters
     */
    public function test_rektorat_can_filter_dashboard_by_period()
    {
        $rektoratRole = Role::where('nama_role', 'Rektorat')->first();
        $rektorat = User::factory()->create(['role_id' => $rektoratRole->role_id]);

        $periods = ['3months', '1year', 'year', 'all'];

        foreach ($periods as $period) {
            $response = $this->actingAs($rektorat)->get(route('dashboard.direktur', ['period' => $period]));
            $response->assertStatus(200);
        }
    }

    public function test_unauthenticated_user_cannot_access_dashboard()
    {
        $response = $this->get(route('dashboard.direktur'));

        $response->assertRedirect(route('login'));
    }

    /**
     * Test Case: TC-D-F16 - Dashboard direktur menampilkan daftar video panduan
     */
    public function test_dashboard_direktur_contains_video_panduan(): void
    {
        $rektoratRole = Role::where('nama_role', 'Rektorat')->first();
        $rektorat = User::factory()->create(['role_id' => $rektoratRole->role_id]);

        // Create a video guidebook
        Panduan::create([
            'judul_panduan' => 'Video Guide 1',
            'tipe_media' => 'video',
            'path_media' => 'https://youtube.com/watch?v=123',
            'target_role_id' => null,
        ]);

        $response = $this->actingAs($rektorat)->get(route('dashboard.direktur'));

        $response->assertStatus(200);
        $response->assertInertia(fn (AssertableInertia $page) => $page
            ->component('Direktur/Dashboard')
            ->has('dashboardData.videos', 1)
            ->where('dashboardData.videos.0.title', 'Video Guide 1')
            ->where('dashboardData.videos.0.url', 'https://youtube.com/watch?v=123')
        );
    }

    /**
     * Test Case: TC-D-F19 - Direktur melihat data per jurusan (by_jurusan)
     */
    public function test_direktur_dashboard_computes_by_jurusan_correctly(): void
    {
        $rektoratRole = Role::where('nama_role', 'Rektorat')->first();
        $rektorat = User::factory()->create(['role_id' => $rektoratRole->role_id]);

        // Create a Pengusul user in Teknik Sipil
        $sipilUser = User::factory()->create([
            'role_id' => 3,
            'nama_lengkap' => 'Budi Teknik Sipil',
        ]);

        // Create a KAK with anggaran for this user
        $kak = KAK::factory()->create([
            'pengusul_user_id' => $sipilUser->user_id,
            'status_id' => 3, // Approved
            'created_at' => now(),
        ]);

        KAKAnggaran::create([
            'kak_id' => $kak->kak_id,
            'kategori_belanja_id' => 1,
            'uraian' => 'Semen',
            'volume1' => 10,
            'satuan1_id' => 1,
            'harga_satuan' => 100000,
            'jumlah_diusulkan' => 1000000,
        ]);

        $response = $this->actingAs($rektorat)->get(route('dashboard.direktur'));

        $response->assertStatus(200);
        $response->assertInertia(fn (AssertableInertia $page) => $page
            ->component('Direktur/Dashboard')
            ->has('dashboardData.by_jurusan')
        );

        // Assert the computed by_jurusan array contains Teknik Sipil with the correct amount
        $byJurusan = $response->original->getData()['page']['props']['dashboardData']['by_jurusan'];
        $sipilData = collect($byJurusan)->firstWhere('nama_jurusan', 'Teknik Sipil');

        $this->assertNotNull($sipilData);
        $this->assertEquals(1, $sipilData['kak_diajukan']);
        $this->assertEquals(1000000, $sipilData['dana_diminta']);
    }

    /**
     * Test Case: TC-D-F20 - Direktur melihat tren bulanan (trends)
     */
    public function test_direktur_dashboard_computes_trends_correctly(): void
    {
        $rektoratRole = Role::where('nama_role', 'Rektorat')->first();
        $rektorat = User::factory()->create(['role_id' => $rektoratRole->role_id]);

        // Create a KAK & Kegiatan
        $kak = KAK::factory()->create([
            'status_id' => 3,
            'created_at' => now(),
        ]);
        $kegiatan = Kegiatan::create([
            'kak_id' => $kak->kak_id,
        ]);

        $response = $this->actingAs($rektorat)->get(route('dashboard.direktur'));

        $response->assertStatus(200);
        $response->assertInertia(fn (AssertableInertia $page) => $page
            ->component('Direktur/Dashboard')
            ->has('dashboardData.trends')
        );

        $trends = $response->original->getData()['page']['props']['dashboardData']['trends'];
        $currentMonthLabel = now()->translatedFormat('M Y');
        $currentMonthTrend = collect($trends)->firstWhere('periode', $currentMonthLabel);

        $this->assertNotNull($currentMonthTrend);
        $this->assertEquals(1, $currentMonthTrend['total_kegiatan']);
    }

    /**
     * Test Case: TC-D-F22 - Budget growth dihitung jika ada data periode sebelumnya
     */
    public function test_direktur_dashboard_computes_budget_growth_correctly(): void
    {
        $rektoratRole = Role::where('nama_role', 'Rektorat')->first();
        $rektorat = User::factory()->create(['role_id' => $rektoratRole->role_id]);

        $currentStart = now()->subMonths(6);
        $daysDiff = $currentStart->diffInDays(now());
        $previousDate = $currentStart->copy()->subDays(floor($daysDiff / 2));

        // 1. Current period budget KAK
        $currentKak = KAK::factory()->create([
            'status_id' => 3,
            'created_at' => now(),
        ]);
        KAKAnggaran::create([
            'kak_id' => $currentKak->kak_id,
            'kategori_belanja_id' => 1,
            'uraian' => 'Current item',
            'volume1' => 1,
            'satuan1_id' => 1,
            'harga_satuan' => 150000,
            'jumlah_diusulkan' => 150000,
        ]);

        // 2. Previous period budget KAK
        $previousKak = KAK::factory()->create([
            'status_id' => 3,
            'created_at' => $previousDate,
        ]);
        KAKAnggaran::create([
            'kak_id' => $previousKak->kak_id,
            'kategori_belanja_id' => 1,
            'uraian' => 'Previous item',
            'volume1' => 1,
            'satuan1_id' => 1,
            'harga_satuan' => 100000,
            'jumlah_diusulkan' => 100000,
        ]);

        $response = $this->actingAs($rektorat)->get(route('dashboard.direktur'));

        $response->assertStatus(200);
        $overview = $response->original->getData()['page']['props']['dashboardData']['overview'];

        // Expected growth: ((150k - 100k) / 100k) * 100 = 50%
        $this->assertEquals(50.0, $overview['budget_growth']);
    }
}

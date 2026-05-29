<?php

namespace Tests\Unit\Services;

use App\Models\User;
use App\Models\KAK;
use App\Models\Kegiatan;
use App\Models\KegiatanApproval;
use App\Services\DashboardService;
use Database\Seeders\MasterDataSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardServiceTest extends TestCase
{
    use RefreshDatabase;

    private DashboardService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(MasterDataSeeder::class);
        $this->service = new DashboardService();
    }

    public function test_get_pengusul_stats(): void
    {
        $user = User::factory()->create(['role_id' => 3]);

        // Draft
        KAK::factory()->create(['pengusul_user_id' => $user->user_id, 'status_id' => 1]);
        // Review
        KAK::factory()->create(['pengusul_user_id' => $user->user_id, 'status_id' => 2]);
        // Approved
        KAK::factory()->create(['pengusul_user_id' => $user->user_id, 'status_id' => 3]);
        // Rejected
        KAK::factory()->create(['pengusul_user_id' => $user->user_id, 'status_id' => 4]);

        $stats = $this->service->getPengusulStats($user);

        $this->assertEquals(4, $stats['total_kak']);
        $this->assertEquals(1, $stats['draft_kak']);
        $this->assertEquals(1, $stats['review_kak']);
        $this->assertEquals(1, $stats['approved_kak']);
        $this->assertEquals(1, $stats['rejected_kak']);
    }

    public function test_get_ppk_stats(): void
    {
        $pengusul = User::factory()->create(['role_id' => 3]);
        $kak = KAK::factory()->create(['pengusul_user_id' => $pengusul->user_id, 'status_id' => 3]);
        $kegiatan = Kegiatan::create([
            'kak_id' => $kak->kak_id,
            'status' => 'Pending',
        ]);

        KegiatanApproval::create([
            'kegiatan_id' => $kegiatan->kegiatan_id,
            'approval_level' => 'PPK',
            'status' => 'Aktif',
            'sequence' => 1,
        ]);

        $res = $this->service->getPpkStatsAndRecent();

        $this->assertEquals(1, $res['stats']['pending_count']);
        $this->assertCount(1, $res['pending_kegiatan']);
    }
}

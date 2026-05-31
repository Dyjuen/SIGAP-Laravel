<?php

namespace Tests\Feature;

use App\Models\KAK;
use App\Models\Kegiatan;
use App\Models\KegiatanApproval;
use App\Models\User;
use Carbon\Carbon;
use Database\Seeders\MasterDataSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class ScheduledReminderTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(MasterDataSeeder::class);
        Mail::fake();
    }

    protected function tearDown(): void
    {
        Carbon::setTestNow(); // Reset time after each test
        parent::tearDown();
    }

    /**
     * Precision Bottleneck Tests (3 Days)
     */
    public function test_bottleneck_trigger_boundaries(): void
    {
        $now = Carbon::create(2026, 5, 23, 10, 0, 0); // Saturday 10:00 AM
        Carbon::setTestNow($now);

        $verif = User::factory()->create(['role_id' => 2, 'username' => 'verifikator1', 'email' => 'verif@pnj.ac.id']);

        // 1. Exactly 3 days ago (boundary) -> Should NOT trigger if we use '<' (older than)
        // or SHOULD trigger if we use '<=' (older or equal). Standard reminder logic usually uses '<'.
        // Let's assume '<' (older than 3 full days).
        $kakBoundary = KAK::factory()->create([
            'status_id' => 2,
            'tipe_kegiatan_id' => 1,
            'updated_at' => $now->copy()->subDays(3),
        ]);

        // 2. Just under 3 days (2 days, 23 hours, 59 mins) -> Should NOT trigger
        $kakJustUnder = KAK::factory()->create([
            'status_id' => 2,
            'tipe_kegiatan_id' => 1,
            'updated_at' => $now->copy()->subDays(2)->subHours(23)->subMinutes(59),
        ]);

        // 3. Just over 3 days (3 days, 1 minute) -> SHOULD trigger
        $kakJustOver = KAK::factory()->create([
            'status_id' => 2,
            'tipe_kegiatan_id' => 1,
            'updated_at' => $now->copy()->subDays(3)->subMinutes(1),
        ]);

        $this->artisan('app:check-workflow-reminders');

        // Verify only the 'Just Over' KAK triggered a notification
        $this->assertDatabaseHas('t_notifikasi', [
            'penerima_user_id' => $verif->user_id,
            'pesan' => "KAK '{$kakJustOver->nama_kegiatan}' telah menunggu verifikasi selama lebih dari 3 hari.",
        ]);

        $this->assertDatabaseMissing('t_notifikasi', [
            'pesan' => "KAK '{$kakJustUnder->nama_kegiatan}' telah menunggu verifikasi selama lebih dari 3 hari.",
        ]);

        $this->assertDatabaseMissing('t_notifikasi', [
            'pesan' => "KAK '{$kakBoundary->nama_kegiatan}' telah menunggu verifikasi selama lebih dari 3 hari.",
        ]);
    }

    /**
     * Precision LPJ Deadline Tests (10 Days)
     */
    public function test_lpj_deadline_trigger_boundaries(): void
    {
        $now = Carbon::create(2026, 5, 23, 10, 0, 0);
        Carbon::setTestNow($now);

        $pengusul = User::factory()->create(['role_id' => 3, 'email' => 'pengusul@pnj.ac.id']);

        // 1. Just under 10 days -> Should NOT trigger
        $kegiatanJustUnder = Kegiatan::factory()->create(['kak_id' => KAK::factory()->create(['pengusul_user_id' => $pengusul->user_id])]);
        KegiatanApproval::create([
            'kegiatan_id' => $kegiatanJustUnder->kegiatan_id,
            'approval_level' => 'Bendahara-LPJ',
            'status' => 'Aktif',
            'updated_at' => $now->copy()->subDays(9)->subHours(23),
        ]);

        // 2. Just over 10 days -> SHOULD trigger
        $kegiatanJustOver = Kegiatan::factory()->create(['kak_id' => KAK::factory()->create(['pengusul_user_id' => $pengusul->user_id])]);
        KegiatanApproval::create([
            'kegiatan_id' => $kegiatanJustOver->kegiatan_id,
            'approval_level' => 'Bendahara-LPJ',
            'status' => 'Aktif',
            'updated_at' => $now->copy()->subDays(10)->subMinutes(1),
        ]);

        $this->artisan('app:check-workflow-reminders');

        $this->assertDatabaseHas('t_notifikasi', [
            'penerima_user_id' => $pengusul->user_id,
            'pesan' => "Kegiatan '{$kegiatanJustOver->kak->nama_kegiatan}' hampir melewati tenggat waktu LPJ (14 hari). Silakan segera submit LPJ.",
        ]);

        $this->assertDatabaseMissing('t_notifikasi', [
            'pesan' => "Kegiatan '{$kegiatanJustUnder->kak->nama_kegiatan}' hampir melewati tenggat waktu LPJ (14 hari). Silakan segera submit LPJ.",
        ]);
    }

    /**
     * Cross-Day Persistence Test
     */
    public function test_notifications_sent_every_day_after_threshold(): void
    {
        $verif = User::factory()->create(['role_id' => 2, 'username' => 'verifikator1']);
        $kak = KAK::factory()->create([
            'status_id' => 2,
            'tipe_kegiatan_id' => 1,
            'updated_at' => Carbon::now()->subDays(4),
        ]);

        // Run Day 4
        $this->artisan('app:check-workflow-reminders');
        $this->assertDatabaseCount('t_notifikasi', 1);

        // Run Day 5
        $this->artisan('app:check-workflow-reminders');
        $this->assertDatabaseCount('t_notifikasi', 2);
    }
}

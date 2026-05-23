<?php

namespace Tests\Feature;

use App\Models\KAK;
use App\Models\User;
use Database\Seeders\MasterDataSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class KakNotificationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(MasterDataSeeder::class);
    }

    public function test_submit_creates_notification_for_verifikator(): void
    {
        $pengusul = User::factory()->create(['role_id' => 3, 'nama_lengkap' => 'Budi Pengusul']);
        $verif = User::factory()->create(['role_id' => 2, 'username' => 'verifikator1', 'email' => 'verif@pnj.ac.id']);
        $kak = KAK::factory()->create(['pengusul_user_id' => $pengusul->user_id, 'status_id' => 1, 'tipe_kegiatan_id' => 1]);

        $this->actingAs($pengusul)->post(route('kak.submit', $kak->kak_id));

        $this->assertDatabaseHas('t_notifikasi', [
            'penerima_user_id' => $verif->user_id,
            'is_read' => 0,
        ]);
        
        $notif = \App\Models\Notifikasi::where('penerima_user_id', $verif->user_id)->first();
        $this->assertStringContainsString('Budi Pengusul', $notif->pesan);
        $this->assertStringContainsString('menunggu verifikasi', $notif->pesan);
    }

    public function test_approve_creates_notification_for_pengusul(): void
    {
        $pengusul = User::factory()->create(['role_id' => 3, 'email' => 'pengusul@pnj.ac.id']);
        $verif = User::factory()->create(['role_id' => 2, 'username' => 'verifikator1']);
        $kak = KAK::factory()->review()->create(['pengusul_user_id' => $pengusul->user_id, 'tipe_kegiatan_id' => 1]);

        $this->actingAs($verif)->post(route('kak.approve', $kak->kak_id), [
            'kode_anggaran' => 'MAK-001',
            'nama_sumber_dana' => 'X',
            'tahun_anggaran' => 2025,
            'total_pagu' => 1000,
        ]);

        $this->assertDatabaseHas('t_notifikasi', [
            'penerima_user_id' => $pengusul->user_id,
            'is_read' => 0,
        ]);

        $notif = \App\Models\Notifikasi::where('penerima_user_id', $pengusul->user_id)->first();
        $this->assertStringContainsString('disetujui', $notif->pesan);
    }

    public function test_reject_creates_notification_for_pengusul(): void
    {
        $pengusul = User::factory()->create(['role_id' => 3, 'email' => 'pengusul@pnj.ac.id']);
        $verif = User::factory()->create(['role_id' => 2, 'username' => 'verifikator1']);
        $kak = KAK::factory()->review()->create(['pengusul_user_id' => $pengusul->user_id, 'tipe_kegiatan_id' => 1]);

        $this->actingAs($verif)->post(route('kak.reject', $kak->kak_id), ['catatan' => 'Wrong data']);

        $this->assertDatabaseHas('t_notifikasi', [
            'penerima_user_id' => $pengusul->user_id,
            'is_read' => 0,
        ]);

        $notif = \App\Models\Notifikasi::where('penerima_user_id', $pengusul->user_id)->first();
        $this->assertStringContainsString('ditolak', $notif->pesan);
    }

    public function test_revise_creates_notification_for_pengusul(): void
    {
        $pengusul = User::factory()->create(['role_id' => 3, 'email' => 'pengusul@pnj.ac.id']);
        $verif = User::factory()->create(['role_id' => 2, 'username' => 'verifikator1']);
        $kak = KAK::factory()->review()->create(['pengusul_user_id' => $pengusul->user_id, 'tipe_kegiatan_id' => 1]);

        $this->actingAs($verif)->post(route('kak.revise', $kak->kak_id), ['catatan' => 'Please revise']);

        $this->assertDatabaseHas('t_notifikasi', [
            'penerima_user_id' => $pengusul->user_id,
            'is_read' => 0,
        ]);

        $notif = \App\Models\Notifikasi::where('penerima_user_id', $pengusul->user_id)->first();
        $this->assertStringContainsString('perlu direvisi', $notif->pesan);
    }
}

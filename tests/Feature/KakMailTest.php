<?php

namespace Tests\Feature;

use App\Mail\KAKWorkflowMail;
use App\Models\KAK;
use App\Models\User;
use Database\Seeders\MasterDataSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class KakMailTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(MasterDataSeeder::class);
        Mail::fake();
    }

    /**
     * Test Case: KAK-IT-002, KAK-IT-036
     */
    public function test_submit_sends_email_to_verifikator(): void
    {
        $pengusul = User::factory()->create(['role_id' => 3, 'nama_lengkap' => 'Budi Pengusul']);
        $verif = User::factory()->create(['role_id' => 2, 'username' => 'verifikator1', 'email' => 'verif@pnj.ac.id']);
        $kak = KAK::factory()->create(['pengusul_user_id' => $pengusul->user_id, 'status_id' => 1, 'tipe_kegiatan_id' => 1]);

        $this->actingAs($pengusul)->post(route('kak.submit', $kak->kak_id));

        Mail::assertQueued(KAKWorkflowMail::class, function ($mail) {
            return $mail->hasTo('verif@pnj.ac.id') &&
                   $mail->mailData['status_color'] === '#1ABDD4';
        });
    }

    /**
     * Test Case: KAK-IT-005, KAK-IT-037
     */
    public function test_approve_sends_email_to_pengusul(): void
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

        Mail::assertQueued(KAKWorkflowMail::class, function ($mail) {
            return $mail->hasTo('pengusul@pnj.ac.id') &&
                   $mail->mailData['status_color'] === '#28a745';
        });
    }

    /**
     * Test Case: KAK-IT-038
     */
    public function test_reject_sends_email_to_pengusul(): void
    {
        $pengusul = User::factory()->create(['role_id' => 3, 'email' => 'pengusul@pnj.ac.id']);
        $verif = User::factory()->create(['role_id' => 2, 'username' => 'verifikator1']);
        $kak = KAK::factory()->review()->create(['pengusul_user_id' => $pengusul->user_id, 'tipe_kegiatan_id' => 1]);

        $this->actingAs($verif)->post(route('kak.reject', $kak->kak_id), ['catatan' => 'Wrong data']);

        Mail::assertQueued(KAKWorkflowMail::class, function ($mail) {
            return $mail->hasTo('pengusul@pnj.ac.id') &&
                   $mail->mailData['status_color'] === '#dc3545' &&
                   str_contains($mail->mailData['body'], 'Wrong data');
        });
    }

    public function test_revise_sends_email_to_pengusul(): void
    {
        $pengusul = User::factory()->create(['role_id' => 3, 'email' => 'pengusul@pnj.ac.id']);
        $verif = User::factory()->create(['role_id' => 2, 'username' => 'verifikator1']);
        $kak = KAK::factory()->review()->create(['pengusul_user_id' => $pengusul->user_id, 'tipe_kegiatan_id' => 1]);

        $this->actingAs($verif)->post(route('kak.revise', $kak->kak_id), ['catatan' => 'Please revise']);

        Mail::assertQueued(KAKWorkflowMail::class, function ($mail) {
            return $mail->hasTo('pengusul@pnj.ac.id') &&
                   $mail->mailData['status_color'] === '#ffc107';
        });
    }

    /**
     * Test Case: KAK-IT-023
     */
    public function test_transaction_rolls_back_if_mail_fails(): void
    {
        // We need to bypass Mail::fake() to simulate a real exception in the workflow
        // But since we use DB::transaction, any exception inside will rollback.

        $pengusul = User::factory()->create(['role_id' => 3]);
        $verif = User::factory()->create(['role_id' => 2, 'username' => 'verifikator1', 'email' => 'verif@pnj.ac.id']);
        $kak = KAK::factory()->create(['pengusul_user_id' => $pengusul->user_id, 'status_id' => 1, 'tipe_kegiatan_id' => 1]);

        // Mock Mail to throw exception
        Mail::shouldReceive('to')->andThrow(new \Exception('SMTP Error'));

        try {
            $this->actingAs($pengusul)->post(route('kak.submit', $kak->kak_id));
        } catch (\Exception $e) {
            $this->assertEquals('SMTP Error', $e->getMessage());
        }

        // Verify rollback
        $this->assertDatabaseHas('t_kak', [
            'kak_id' => $kak->kak_id,
            'status_id' => 1, // Remained Draft
        ]);
        $this->assertDatabaseMissing('t_kak_log_status', [
            'kak_id' => $kak->kak_id,
            'status_id_baru' => 2,
        ]);
    }
}

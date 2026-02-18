<?php

namespace Tests\Feature\Admin;

use App\Models\KAK;
use App\Models\KAKLogStatus;
use App\Models\KegiatanStatus;
use App\Models\LogAktivitas;
use App\Models\Role;
use App\Models\TipeKegiatan;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LogViewTest extends TestCase
{
    use RefreshDatabase;

    private function seedBaseData(): array
    {
        $role = Role::create(['nama_role' => 'Admin']);
        $statusDraft = KegiatanStatus::create(['nama_status' => 'Draft']);
        $statusSubmitted = KegiatanStatus::create(['nama_status' => 'Submitted']);
        $tipeKegiatan = TipeKegiatan::create(['nama_tipe' => 'Test Tipe']);

        $user = User::factory()->create(['role_id' => $role->role_id]);

        $kak = KAK::create([
            'nama_kegiatan' => 'Test KAK',
            'deskripsi_kegiatan' => 'Deskripsi test',
            'pengusul_user_id' => $user->user_id,
            'status_id' => $statusDraft->status_id,
            'tipe_kegiatan_id' => $tipeKegiatan->tipe_kegiatan_id,
        ]);

        return compact('role', 'statusDraft', 'statusSubmitted', 'user', 'kak');
    }

    public function test_v_log_aktivitas_aggregates_data_correctly()
    {
        $data = $this->seedBaseData();

        $log = KAKLogStatus::create([
            'kak_id' => $data['kak']->kak_id,
            'actor_user_id' => $data['user']->user_id,
            'status_id_lama' => $data['statusDraft']->status_id,
            'status_id_baru' => $data['statusSubmitted']->status_id,
            'catatan' => 'Test log',
            'timestamp' => now(),
        ]);

        $viewLog = LogAktivitas::where('log_type', 'KAK_STATUS')
            ->where('kak_id', $data['kak']->kak_id)
            ->first();

        $this->assertNotNull($viewLog);
        $this->assertEquals($data['user']->user_id, $viewLog->user_id);
        $this->assertEquals('Test log', $viewLog->catatan);
        $this->assertTrue(str_starts_with($viewLog->log_id, 'KAK_STATUS_'));
    }

    public function test_log_aktivitas_model_relationships()
    {
        $data = $this->seedBaseData();

        KAKLogStatus::create([
            'kak_id' => $data['kak']->kak_id,
            'actor_user_id' => $data['user']->user_id,
            'status_id_lama' => $data['statusDraft']->status_id,
            'status_id_baru' => $data['statusSubmitted']->status_id,
            'catatan' => 'Relationship Test',
            'timestamp' => now(),
        ]);

        $viewLog = LogAktivitas::first();

        $this->assertNotNull($viewLog->user);
        $this->assertEquals($data['user']->user_id, $viewLog->user->user_id);

        $this->assertNotNull($viewLog->kak);
        $this->assertEquals($data['kak']->kak_id, $viewLog->kak->kak_id);

        $this->assertNotNull($viewLog->oldStatus);
        $this->assertEquals('Draft', $viewLog->oldStatus->nama_status);
    }

    public function test_log_aktivitas_handles_soft_deleted_user_and_null_relationships()
    {
        $data = $this->seedBaseData();

        // Create log
        $log = KAKLogStatus::create([
            'kak_id' => $data['kak']->kak_id,
            'actor_user_id' => $data['user']->user_id,
            'status_id_lama' => null, // Test nullable
            'status_id_baru' => $data['statusSubmitted']->status_id,
            'catatan' => 'Soft delete test',
            'timestamp' => now(),
        ]);

        // Soft delete the user
        $data['user']->delete();

        $viewLog = LogAktivitas::where('log_type', 'KAK_STATUS')
            ->where('kak_id', $data['kak']->kak_id)
            ->first();

        $this->assertNotNull($viewLog);

        // Verify we can still access user data (withTrashed)
        $this->assertNotNull($viewLog->user);
        $this->assertEquals($data['user']->user_id, $viewLog->user->user_id);
        $this->assertEquals($data['user']->nama_lengkap, $viewLog->user->nama_lengkap);

        // Verify description handles null oldStatus
        $description = $viewLog->log_description;
        $this->assertStringContainsString('dari "-"', $description);
    }
}

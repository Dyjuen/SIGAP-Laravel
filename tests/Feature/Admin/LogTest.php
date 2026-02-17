<?php

namespace Tests\Feature\Admin;

use App\Models\KAK;
use App\Models\KAKApproval;
use App\Models\KAKLogStatus;
use App\Models\KegiatanStatus;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class LogTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        // Seed roles if needed
        if (Role::count() === 0) {
            Role::create(['role_id' => 1, 'nama_role' => 'Admin']);
            Role::create(['role_id' => 2, 'nama_role' => 'Verifikator']);
            Role::create(['role_id' => 3, 'nama_role' => 'Pengusul']);
        }
    }

    public function test_admin_can_view_logs_page()
    {
        $admin = User::find(1) ?? User::factory()->create(['role_id' => 1]); // Ensure admin exists

        $response = $this->actingAs($admin)
            ->get(route('admin.logs.index'));

        $response->assertStatus(200)
            ->assertInertia(
                fn (Assert $page) => $page
                    ->component('Admin/Logs/Index')
                    ->has('logs')
                    ->has('filters')
            );
    }

    public function test_non_admin_cannot_view_logs_page()
    {
        $user = User::factory()->create(['role_id' => 3]); // Pengusul

        $response = $this->actingAs($user)
            ->get(route('admin.logs.index'));

        $response->assertStatus(403);
    }

    public function test_logs_page_displays_kak_status_logs()
    {
        $admin = User::first() ?? User::factory()->create(['role_id' => 1]);
        $status = KegiatanStatus::firstOrCreate(['status_id' => 1], ['nama_status' => 'Baru']);

        $kak = KAK::create([
            'nama_kegiatan' => 'Test KAK',
            'deskripsi_kegiatan' => 'Test Deskripsi',
            'pengusul_user_id' => $admin->user_id,
            'status_id' => $status->status_id,
        ]);

        // Create log manually
        KAKLogStatus::create([
            'kak_id' => $kak->kak_id,
            'status_id_lama' => null,
            'status_id_baru' => $status->status_id,
            'actor_user_id' => $admin->user_id,
            'catatan' => 'Test Log KAK',
        ]);

        $response = $this->actingAs($admin)
            ->get(route('admin.logs.index'));

        $response->assertStatus(200)
            ->assertInertia(
                fn (Assert $page) => $page
                    ->component('Admin/Logs/Index')
                    ->has('logs.data', 1)
                    ->where('logs.data.0.log_type', 'KAK_STATUS')
                    ->where('logs.data.0.context_title', 'Test KAK')
                    ->where('logs.data.0.user_name', $admin->nama_lengkap)
                    ->where('logs.data.0.catatan', 'Test Log KAK')
            );
    }

    public function test_logs_page_displays_kak_approval_logs()
    {
        $admin = User::first() ?? User::factory()->create(['role_id' => 1]);
        $status = KegiatanStatus::firstOrCreate(['status_id' => 1], ['nama_status' => 'Baru']);

        $kak = KAK::create([
            'nama_kegiatan' => 'Test KAK Approval',
            'deskripsi_kegiatan' => 'Test Deskripsi',
            'pengusul_user_id' => $admin->user_id,
            'status_id' => $status->status_id,
        ]);

        // Create approval log
        KAKApproval::create([
            'kak_id' => $kak->kak_id,
            'approver_user_id' => $admin->user_id,
            'status' => 'Disetujui',
            'catatan' => 'ACC KAK',
        ]);

        $response = $this->actingAs($admin)
            ->get(route('admin.logs.index'));

        $response->assertStatus(200)
            ->assertInertia(
                fn (Assert $page) => $page
                    ->component('Admin/Logs/Index')
                    ->has('logs.data', 1) // Should be 1 if database is refreshed or we filter/sort correctly
                    ->where('logs.data.0.log_type', 'KAK_APPROVAL')
                    ->where('logs.data.0.context_title', 'Test KAK Approval')
                    ->where('logs.data.0.catatan', 'ACC KAK')
            );
    }
}

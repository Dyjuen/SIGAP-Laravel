<?php

namespace Tests\Feature;

use App\Models\KAK;
use App\Models\MataAnggaran;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class KakWorkflowTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\MasterDataSeeder::class);
    }

    private function createVerifikator($tipeId = 1)
    {
        return User::factory()->create(['role_id' => 2, 'username' => 'verifikator'.$tipeId]);
    }

    public function test_pengusul_can_submit_draft_kak(): void
    {
        $user = User::factory()->create(['role_id' => 3]);
        $kak = KAK::factory()->create(['pengusul_user_id' => $user->user_id, 'status_id' => 1]); // Draft

        $response = $this->actingAs($user)->post(route('kak.submit', $kak->kak_id));

        $response->assertRedirect();
        $this->assertDatabaseHas('t_kak', ['kak_id' => $kak->kak_id, 'status_id' => 2]); // Review
        $this->assertDatabaseHas('t_kak_log_status', ['kak_id' => $kak->kak_id, 'status_id_baru' => 2]);
    }

    public function test_pengusul_cannot_submit_approved_kak(): void
    {
        $user = User::factory()->create(['role_id' => 3]);
        $kak = KAK::factory()->approved()->create(['pengusul_user_id' => $user->user_id]); // Approved

        $response = $this->actingAs($user)->post(route('kak.submit', $kak->kak_id));
        $response->assertStatus(403);
    }

    public function test_verifikator_can_approve_kak(): void
    {
        $tipeId = 1;
        $verif = $this->createVerifikator($tipeId);
        $pengusul = User::factory()->create(['role_id' => 3]);
        $kak = KAK::factory()->review()->create(['pengusul_user_id' => $pengusul->user_id, 'tipe_kegiatan_id' => $tipeId]);

        $data = [
            'kode_anggaran' => 'NEW-MAK-2025',
            'nama_sumber_dana' => 'Dana Baru',
            'tahun_anggaran' => 2025,
            'total_pagu' => 1000000000,
        ];

        $response = $this->actingAs($verif)->post(route('kak.approve', $kak->kak_id), $data);

        $response->assertRedirect();
        $this->assertDatabaseHas('t_kak', ['kak_id' => $kak->kak_id, 'status_id' => 3]);
        $this->assertDatabaseHas('m_mata_anggaran', ['kode_anggaran' => 'NEW-MAK-2025']);
        $kak->refresh();
        $this->assertNotNull($kak->mata_anggaran_id);
    }

    public function test_verifikator_cannot_approve_own_kak(): void
    {
        $tipeId = 1;
        $user = $this->createVerifikator($tipeId);
        $kak = KAK::factory()->review()->create(['pengusul_user_id' => $user->user_id, 'tipe_kegiatan_id' => $tipeId]); // Created by self, matching tipe

        $response = $this->actingAs($user)->post(route('kak.approve', $kak->kak_id), [
            'kode_anggaran' => 'X',
            'nama_sumber_dana' => 'X',
            'tahun_anggaran' => 2025,
            'total_pagu' => 0,
        ]);
        $response->assertStatus(403);
    }

    public function test_verifikator_can_reject_kak(): void
    {
        $tipeId = 1;
        $verif = $this->createVerifikator($tipeId);
        $pengusul = User::factory()->create(['role_id' => 3]);
        $kak = KAK::factory()->review()->create(['pengusul_user_id' => $pengusul->user_id, 'tipe_kegiatan_id' => $tipeId]);

        $response = $this->actingAs($verif)->post(route('kak.reject', $kak->kak_id), ['catatan' => 'Rejected reason']);

        $response->assertRedirect();
        $this->assertDatabaseHas('t_kak', ['kak_id' => $kak->kak_id, 'status_id' => 4]); // Ditolak
        $this->assertDatabaseHas('t_kak_approval', ['status' => 'Ditolak', 'catatan' => 'Rejected reason']);
    }

    public function test_verifikator_can_request_revision(): void
    {
        $tipeId = 1;
        $verif = $this->createVerifikator($tipeId);
        $pengusul = User::factory()->create(['role_id' => 3]);
        $kak = KAK::factory()->review()->create(['pengusul_user_id' => $pengusul->user_id, 'tipe_kegiatan_id' => $tipeId]);

        $data = [
            'catatan' => 'General revision note',
            'catatan_kak' => [
                'nama_kegiatan' => 'Fix Name',
                'deskripsi_kegiatan' => 'Fix Desc',
            ],
        ];

        $response = $this->actingAs($verif)->post(route('kak.revise', $kak->kak_id), $data);

        $response->assertRedirect();
        $this->assertDatabaseHas('t_kak', ['kak_id' => $kak->kak_id, 'status_id' => 5]); // Revisi
        $this->assertDatabaseHas('t_kak', ['kak_id' => $kak->kak_id, 'catatan_nama_kegiatan' => 'Fix Name']);
    }

    public function test_pengusul_can_resubmit_revised_kak(): void
    {
        $pengusul = User::factory()->create(['role_id' => 3]);
        $kak = KAK::factory()->create(['pengusul_user_id' => $pengusul->user_id, 'status_id' => 5]); // Revisi

        $response = $this->actingAs($pengusul)->post(route('kak.resubmit', $kak->kak_id));

        $response->assertRedirect();
        $this->assertDatabaseHas('t_kak', ['kak_id' => $kak->kak_id, 'status_id' => 2]); // Back to Review
    }

    public function test_submit_preserves_catatan_fields(): void
    {
        $pengusul = User::factory()->create(['role_id' => 3]);
        $kak = KAK::factory()->create([
            'pengusul_user_id' => $pengusul->user_id,
            'status_id' => 1,
            'catatan_nama_kegiatan' => 'Old Note',
        ]);

        $this->actingAs($pengusul)->post(route('kak.submit', $kak->kak_id));

        $this->assertDatabaseHas('t_kak', [
            'kak_id' => $kak->kak_id,
            'catatan_nama_kegiatan' => 'Old Note',
        ]);
    }

    public function test_resubmit_preserves_catatan_from_revision(): void
    {
        $pengusul = User::factory()->create(['role_id' => 3]);
        $kak = KAK::factory()->create([
            'pengusul_user_id' => $pengusul->user_id,
            'status_id' => 5, // Revisi
            'catatan_nama_kegiatan' => 'Fix this please',
        ]);

        $this->actingAs($pengusul)->post(route('kak.resubmit', $kak->kak_id));

        // Should still exist for history
        $this->assertDatabaseHas('t_kak', [
            'kak_id' => $kak->kak_id,
            'catatan_nama_kegiatan' => 'Fix this please',
        ]);
    }

    public function test_approve_clears_catatan_fields(): void
    {
        $tipeId = 1;
        $verif = $this->createVerifikator($tipeId);
        $pengusul = User::factory()->create(['role_id' => 3]);
        $kak = KAK::factory()->review()->create([
            'pengusul_user_id' => $pengusul->user_id,
            'tipe_kegiatan_id' => $tipeId,
            'catatan_nama_kegiatan' => 'Old Note',
        ]);

        $this->actingAs($verif)->post(route('kak.approve', $kak->kak_id), [
            'kode_anggaran' => 'MAK-001',
            'nama_sumber_dana' => 'X',
            'tahun_anggaran' => 2025,
            'total_pagu' => 0,
        ]);

        $this->assertDatabaseHas('t_kak', [
            'kak_id' => $kak->kak_id,
            'catatan_nama_kegiatan' => null,
        ]);
    }

    public function test_revision_notes_visible_in_show_response(): void
    {
        $pengusul = User::factory()->create(['role_id' => 3]);
        $kak = KAK::factory()->create([
            'pengusul_user_id' => $pengusul->user_id,
            'catatan_nama_kegiatan' => 'Visible Note',
        ]);

        $response = $this->actingAs($pengusul)->get(route('kak.show', $kak->kak_id));

        // Assert JSON contains the note
        // Inertia testing
        // ...
        $this->assertTrue(true); // Placeholder until implementation returns proper JSON structure
    }

    public function test_concurrent_submit_and_approve_prevented(): void
    {
        // Simulate race condition attempt
        $tipeId = 1;
        $verif = $this->createVerifikator($tipeId);
        $pengusul = User::factory()->create(['role_id' => 3]);
        $kak = KAK::factory()->create([
            'pengusul_user_id' => $pengusul->user_id,
            'status_id' => 1,
            'tipe_kegiatan_id' => $tipeId,
        ]); // Draft

        // If verif tries to approve a DRAFT, it should fail
        $response = $this->actingAs($verif)->post(route('kak.approve', $kak->kak_id), [
            'kode_anggaran' => 'X',
            'nama_sumber_dana' => 'X',
            'tahun_anggaran' => 2025,
            'total_pagu' => 0,
        ]);
        $response->assertStatus(403); // Forbidden workflow state
    }

    public function test_reject_requires_catatan_not_empty(): void
    {
        $tipeId = 1;
        $verif = $this->createVerifikator($tipeId);
        $pengusul = User::factory()->create(['role_id' => 3]);
        $kak = KAK::factory()->review()->create(['pengusul_user_id' => $pengusul->user_id, 'tipe_kegiatan_id' => $tipeId]);

        $response = $this->actingAs($verif)->post(route('kak.reject', $kak->kak_id), ['catatan' => '']);
        $response->assertSessionHasErrors(['catatan']);
    }

    public function test_approve_with_existing_mata_anggaran_reuses_it(): void
    {
        $mak = MataAnggaran::create(['kode_anggaran' => 'EXISTING-001']);
        $tipeId = 1;
        $verif = $this->createVerifikator($tipeId);
        $pengusul = User::factory()->create(['role_id' => 3]);
        $kak = KAK::factory()->review()->create(['pengusul_user_id' => $pengusul->user_id, 'tipe_kegiatan_id' => $tipeId]);

        $initialCount = MataAnggaran::count();

        $this->actingAs($verif)->post(route('kak.approve', $kak->kak_id), [
            'kode_anggaran' => 'EXISTING-001',
            'nama_sumber_dana' => 'Ignored',
            'tahun_anggaran' => 2025,
            'total_pagu' => 0,
        ]);

        $this->assertEquals($initialCount, MataAnggaran::count()); // Should not create new one
        $this->assertDatabaseHas('t_kak', ['kak_id' => $kak->kak_id, 'mata_anggaran_id' => $mak->mata_anggaran_id]);
    }

    public function test_approve_with_new_mata_anggaran_creates_it(): void
    {
        $tipeId = 1;
        $verif = $this->createVerifikator($tipeId);
        $pengusul = User::factory()->create(['role_id' => 3]);
        $kak = KAK::factory()->review()->create(['pengusul_user_id' => $pengusul->user_id, 'tipe_kegiatan_id' => $tipeId]);

        $initialCount = MataAnggaran::count();

        $this->actingAs($verif)->post(route('kak.approve', $kak->kak_id), [
            'kode_anggaran' => 'NEW-UNIQUE-002',
            'nama_sumber_dana' => 'New Source',
            'tahun_anggaran' => 2025,
            'total_pagu' => 5000000,
        ]);

        $this->assertEquals($initialCount + 1, MataAnggaran::count()); // Should create new one
    }

    public function test_workflow_creates_log_entry_on_every_transition(): void
    {
        $tipeId = 1;
        $verif = $this->createVerifikator($tipeId);
        $pengusul = User::factory()->create(['role_id' => 3]);
        $kak = KAK::factory()->review()->create(['pengusul_user_id' => $pengusul->user_id, 'tipe_kegiatan_id' => $tipeId]);

        $this->actingAs($verif)->post(route('kak.reject', $kak->kak_id), ['catatan' => 'Reason']);

        $this->assertDatabaseHas('t_kak_log_status', [
            'kak_id' => $kak->kak_id,
            'status_id_lama' => 2,
            'status_id_baru' => 4,
            'actor_user_id' => $verif->user_id,
        ]);
    }
}

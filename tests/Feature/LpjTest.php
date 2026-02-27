<?php

namespace Tests\Feature;

use App\Models\KAK;
use App\Models\KAKAnggaran;
use App\Models\Kegiatan;
use App\Models\KegiatanApproval;
use App\Models\KegiatanLampiran;
use App\Models\Satuan;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class LpjTest extends TestCase
{
    use RefreshDatabase;

    private User $pengusul;

    private User $pengusulLain;

    private User $bendahara;

    private User $ppk;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\MasterDataSeeder::class);

        $this->pengusul = User::factory()->create(['role_id' => 3]);
        $this->pengusulLain = User::factory()->create(['role_id' => 3]);
        $this->bendahara = User::factory()->create(['role_id' => 6]);
        $this->ppk = User::factory()->create(['role_id' => 4]);
    }

    // ========================================
    // HELPERS
    // ========================================

    /**
     * Create a full kegiatan fixture at LPJ stage (status 10).
     * Bendahara-LPJ = Aktif, simulating post-pencairan state.
     */
    private function createKegiatanAtLpjStage(User $pengusul, int $totalAnggaran = 5000000): Kegiatan
    {
        $kak = KAK::create([
            'nama_kegiatan' => 'Test Kegiatan LPJ',
            'deskripsi_kegiatan' => 'Test',
            'pengusul_user_id' => $pengusul->user_id,
            'status_id' => 10, // Menunggu LPJ
            'tanggal_mulai' => now()->subDays(5),
            'tanggal_selesai' => now()->subDays(1),
            'tipe_kegiatan_id' => 1,
            'mata_anggaran_id' => 1,
        ]);

        $satuan = Satuan::first();

        KAKAnggaran::create([
            'kak_id' => $kak->kak_id,
            'kategori_belanja_id' => 1,
            'uraian' => 'Honorarium Narasumber',
            'volume1' => 2,
            'satuan1_id' => $satuan->satuan_id,
            'harga_satuan' => $totalAnggaran / 2,
            'jumlah_diusulkan' => $totalAnggaran,
        ]);

        $kegiatan = Kegiatan::create([
            'kak_id' => $kak->kak_id,
            'penanggung_jawab_manual' => 'Test PJ',
            'pelaksana_manual' => 'Test Pelaksana',
        ]);

        // Create approval chain
        $steps = ['PPK', 'Wadir2', 'Bendahara-Cair', 'Bendahara-LPJ', 'Bendahara-Setor'];
        foreach ($steps as $step) {
            $status = match ($step) {
                'PPK', 'Wadir2', 'Bendahara-Cair' => 'Disetujui',
                'Bendahara-LPJ' => 'Aktif',
                default => 'Menunggu',
            };
            KegiatanApproval::create([
                'kegiatan_id' => $kegiatan->kegiatan_id,
                'approval_level' => $step,
                'status' => $status,
            ]);
        }

        return $kegiatan;
    }

    /**
     * Build valid realisasi payload for submit/resubmit endpoints.
     */
    private function buildRealisasiPayload(Kegiatan $kegiatan): array
    {
        $anggaran = KAKAnggaran::where('kak_id', $kegiatan->kak_id)->first();
        $satuan = Satuan::first();

        return [
            'realisasi' => [
                $anggaran->anggaran_id => [
                    'volume1' => '2',
                    'satuan1_id' => (string) $satuan->satuan_id,
                    'volume2' => '',
                    'satuan2_id' => '',
                    'volume3' => '',
                    'satuan3_id' => '',
                    'harga_satuan' => '2000000',
                ],
            ],
        ];
    }

    /**
     * Move kegiatan to post-submit state (Review LPJ — status 11).
     */
    private function submitLpj(Kegiatan $kegiatan): void
    {
        $kak = $kegiatan->kak;
        $kak->update(['status_id' => 11]);
        $kegiatan->update(['lpj_submitted_at' => now()]);
    }

    /**
     * Move kegiatan to post-approve state (Setor Fisik — status 13).
     * Bendahara-LPJ = Disetujui, Bendahara-Setor = Aktif.
     */
    private function approveLpj(Kegiatan $kegiatan): void
    {
        $this->submitLpj($kegiatan);
        $kak = $kegiatan->kak;
        $kak->update(['status_id' => 13]);

        KegiatanApproval::where('kegiatan_id', $kegiatan->kegiatan_id)
            ->where('approval_level', 'Bendahara-LPJ')
            ->update(['status' => 'Disetujui']);

        KegiatanApproval::where('kegiatan_id', $kegiatan->kegiatan_id)
            ->where('approval_level', 'Bendahara-Setor')
            ->update(['status' => 'Aktif']);
    }

    // ========================================
    // SUBMIT TESTS
    // ========================================

    public function test_unauthenticated_cannot_submit_lpj(): void
    {
        $kegiatan = $this->createKegiatanAtLpjStage($this->pengusul);

        $this->post(route('lpj.submit', $kegiatan))
            ->assertRedirect('/login');
    }

    public function test_pengusul_can_submit_lpj(): void
    {
        $kegiatan = $this->createKegiatanAtLpjStage($this->pengusul);
        $payload = $this->buildRealisasiPayload($kegiatan);

        $response = $this->actingAs($this->pengusul)
            ->post(route('lpj.submit', $kegiatan), $payload);

        $response->assertStatus(302);
        $response->assertSessionHas('success');

        // Verify kegiatan was updated
        $kegiatan->refresh();
        $this->assertNotNull($kegiatan->lpj_submitted_at);

        // Verify KAK status updated to 11 (Review LPJ)
        $this->assertDatabaseHas('t_kak', [
            'kak_id' => $kegiatan->kak_id,
            'status_id' => 11,
        ]);

        // Verify realization data was saved
        $anggaran = KAKAnggaran::where('kak_id', $kegiatan->kak_id)->first();
        $this->assertEquals(2000000, $anggaran->realisasi_harga_satuan);

        // Verify status log was created
        $this->assertDatabaseHas('t_kegiatan_log_status', [
            'kegiatan_id' => $kegiatan->kegiatan_id,
            'status_id_baru' => 11,
        ]);
    }

    public function test_non_owner_cannot_submit_lpj(): void
    {
        $kegiatan = $this->createKegiatanAtLpjStage($this->pengusul);
        $payload = $this->buildRealisasiPayload($kegiatan);

        $this->actingAs($this->pengusulLain)
            ->post(route('lpj.submit', $kegiatan), $payload)
            ->assertStatus(403);

        $this->actingAs($this->bendahara)
            ->post(route('lpj.submit', $kegiatan), $payload)
            ->assertStatus(403);
    }

    public function test_submit_fails_when_already_submitted(): void
    {
        $kegiatan = $this->createKegiatanAtLpjStage($this->pengusul);
        $this->submitLpj($kegiatan);

        $payload = $this->buildRealisasiPayload($kegiatan);

        $response = $this->actingAs($this->pengusul)
            ->post(route('lpj.submit', $kegiatan), $payload);

        $response->assertStatus(302);
        $response->assertSessionHasErrors(['message']);
    }

    public function test_submit_validates_realisasi_required(): void
    {
        $kegiatan = $this->createKegiatanAtLpjStage($this->pengusul);

        // Submit with empty payload
        $this->actingAs($this->pengusul)
            ->post(route('lpj.submit', $kegiatan), [])
            ->assertStatus(302)
            ->assertSessionHasErrors(['realisasi']);
    }

    public function test_submit_rolls_back_on_file_upload_failure(): void
    {
        Storage::fake('public');
        $kegiatan = $this->createKegiatanAtLpjStage($this->pengusul);
        $payload = $this->buildRealisasiPayload($kegiatan);

        // Send a file that fails validation (e.g. extension)
        $anggaran = KAKAnggaran::where('kak_id', $kegiatan->kak_id)->first();
        $payload['bukti'][$anggaran->anggaran_id] = [
            UploadedFile::fake()->create('malware.exe', 512),
        ];

        $response = $this->actingAs($this->pengusul)
            ->post(route('lpj.submit', $kegiatan), $payload);

        // MIME validation should fail
        $response->assertStatus(302);
        $response->assertSessionHasErrors(['bukti.'.$anggaran->anggaran_id.'.0']);

        // Verify clean rollback/no state change
        $kegiatan->refresh();
        $this->assertNull($kegiatan->lpj_submitted_at);
        $this->assertDatabaseMissing('t_kegiatan_log_status', [
            'kegiatan_id' => $kegiatan->kegiatan_id,
            'status_id_baru' => 11,
        ]);
    }

    public function test_concurrent_submit_is_idempotent(): void
    {
        $kegiatan = $this->createKegiatanAtLpjStage($this->pengusul);
        $payload = $this->buildRealisasiPayload($kegiatan);

        // First submit should succeed
        $response1 = $this->actingAs($this->pengusul)
            ->post(route('lpj.submit', $kegiatan), $payload);
        $response1->assertStatus(302);
        $response1->assertSessionHas('success');

        // Second submit should fail (already submitted)
        $response2 = $this->actingAs($this->pengusul)
            ->post(route('lpj.submit', $kegiatan), $payload);
        $response2->assertStatus(302);
        $response2->assertSessionHasErrors(['message']);

        // Only one log should exist
        $logCount = \App\Models\KegiatanLogStatus::where('kegiatan_id', $kegiatan->kegiatan_id)
            ->where('status_id_baru', 11)
            ->count();
        $this->assertEquals(1, $logCount);
    }

    // ========================================
    // REVIEW TESTS
    // ========================================

    public function test_bendahara_can_review_lpj(): void
    {
        $kegiatan = $this->createKegiatanAtLpjStage($this->pengusul);
        $this->submitLpj($kegiatan);

        $response = $this->actingAs($this->bendahara)
            ->getJson(route('lpj.review', $kegiatan));

        $response->assertStatus(200)
            ->assertJsonStructure([
                'kegiatan',
                'anggaran',
                'lampiran',
            ]);
    }

    public function test_pengusul_owner_can_review_lpj(): void
    {
        $kegiatan = $this->createKegiatanAtLpjStage($this->pengusul);
        $this->submitLpj($kegiatan);

        $response = $this->actingAs($this->pengusul)
            ->getJson(route('lpj.review', $kegiatan));

        $response->assertStatus(200)
            ->assertJsonStructure([
                'kegiatan',
                'anggaran',
            ]);
    }

    public function test_non_authorized_cannot_review_lpj(): void
    {
        $kegiatan = $this->createKegiatanAtLpjStage($this->pengusul);

        $this->actingAs($this->pengusulLain)
            ->getJson(route('lpj.review', $kegiatan))
            ->assertStatus(403);

        $this->actingAs($this->ppk)
            ->getJson(route('lpj.review', $kegiatan))
            ->assertStatus(403);
    }

    // ========================================
    // REVISE TESTS
    // ========================================

    public function test_bendahara_can_revise_lpj(): void
    {
        $kegiatan = $this->createKegiatanAtLpjStage($this->pengusul);
        $this->submitLpj($kegiatan);

        $response = $this->actingAs($this->bendahara)
            ->post(route('lpj.revise', $kegiatan), [
                'catatan_umum' => 'Bukti belum lengkap, mohon dilengkapi.',
            ]);

        $response->assertStatus(302);
        $response->assertSessionHas('success');

        // Approval should be in Revisi state
        $this->assertDatabaseHas('t_kegiatan_approval', [
            'kegiatan_id' => $kegiatan->kegiatan_id,
            'approval_level' => 'Bendahara-LPJ',
            'status' => 'Revisi',
        ]);

        // KAK status should be 12 (LPJ Direvisi)
        $this->assertDatabaseHas('t_kak', [
            'kak_id' => $kegiatan->kak_id,
            'status_id' => 12,
        ]);

        // Status log should be created
        $this->assertDatabaseHas('t_kegiatan_log_status', [
            'kegiatan_id' => $kegiatan->kegiatan_id,
            'status_id_baru' => 12,
        ]);
    }

    public function test_non_bendahara_cannot_revise_lpj(): void
    {
        $kegiatan = $this->createKegiatanAtLpjStage($this->pengusul);
        $this->submitLpj($kegiatan);

        $this->actingAs($this->pengusul)
            ->post(route('lpj.revise', $kegiatan), [
                'catatan_umum' => 'Test',
            ])
            ->assertStatus(403);

        $this->actingAs($this->ppk)
            ->post(route('lpj.revise', $kegiatan), [
                'catatan_umum' => 'Test',
            ])
            ->assertStatus(403);
    }

    public function test_revise_requires_catatan_umum(): void
    {
        $kegiatan = $this->createKegiatanAtLpjStage($this->pengusul);
        $this->submitLpj($kegiatan);

        $this->actingAs($this->bendahara)
            ->post(route('lpj.revise', $kegiatan), [])
            ->assertStatus(302)
            ->assertSessionHasErrors(['catatan_umum']);
    }

    // ========================================
    // RESUBMIT TESTS
    // ========================================

    public function test_pengusul_can_resubmit_lpj(): void
    {
        $kegiatan = $this->createKegiatanAtLpjStage($this->pengusul);
        $this->submitLpj($kegiatan);

        // Move to revised state
        $kak = $kegiatan->kak;
        $kak->update(['status_id' => 12]);
        KegiatanApproval::where('kegiatan_id', $kegiatan->kegiatan_id)
            ->where('approval_level', 'Bendahara-LPJ')
            ->update(['status' => 'Revisi']);

        $response = $this->actingAs($this->pengusul)
            ->post(route('lpj.resubmit', $kegiatan));

        $response->assertStatus(302);
        $response->assertSessionHas('success');

        // Approval should be back to Aktif
        $this->assertDatabaseHas('t_kegiatan_approval', [
            'kegiatan_id' => $kegiatan->kegiatan_id,
            'approval_level' => 'Bendahara-LPJ',
            'status' => 'Aktif',
        ]);

        // KAK status should be back to 11 (Review LPJ)
        $this->assertDatabaseHas('t_kak', [
            'kak_id' => $kegiatan->kak_id,
            'status_id' => 11,
        ]);

        // Status log should be created
        $this->assertDatabaseHas('t_kegiatan_log_status', [
            'kegiatan_id' => $kegiatan->kegiatan_id,
            'status_id_baru' => 11,
        ]);
    }

    public function test_non_owner_cannot_resubmit_lpj(): void
    {
        $kegiatan = $this->createKegiatanAtLpjStage($this->pengusul);
        $this->submitLpj($kegiatan);

        $this->actingAs($this->pengusulLain)
            ->post(route('lpj.resubmit', $kegiatan))
            ->assertStatus(403);

        $this->actingAs($this->bendahara)
            ->post(route('lpj.resubmit', $kegiatan))
            ->assertStatus(403);
    }

    public function test_resubmit_fails_when_not_in_revisi_state(): void
    {
        $kegiatan = $this->createKegiatanAtLpjStage($this->pengusul);
        $this->submitLpj($kegiatan); // status 11, approval = Aktif (not Revisi)

        $response = $this->actingAs($this->pengusul)
            ->post(route('lpj.resubmit', $kegiatan));

        $response->assertStatus(302);
        $response->assertSessionHasErrors(['message']);
    }

    public function test_resubmit_archives_deleted_files(): void
    {
        $kegiatan = $this->createKegiatanAtLpjStage($this->pengusul);
        $this->submitLpj($kegiatan);

        $anggaran = KAKAnggaran::where('kak_id', $kegiatan->kak_id)->first();

        // Create a lampiran to be archived
        $lampiran = KegiatanLampiran::create([
            'anggaran_id' => $anggaran->anggaran_id,
            'nama_file_asli' => 'bukti_old.pdf',
            'path_file_disimpan' => '/storage/uploads/documents/bukti_old.pdf',
            'uploader_user_id' => $this->pengusul->user_id,
            'status_lampiran' => 'active',
        ]);

        // Move to revised state
        $kak = $kegiatan->kak;
        $kak->update(['status_id' => 12]);
        KegiatanApproval::where('kegiatan_id', $kegiatan->kegiatan_id)
            ->where('approval_level', 'Bendahara-LPJ')
            ->update(['status' => 'Revisi']);

        $response = $this->actingAs($this->pengusul)
            ->post(route('lpj.resubmit', $kegiatan), [
                'files_to_delete' => [$lampiran->lampiran_id],
            ]);

        $response->assertStatus(302);
        $response->assertSessionHas('success');

        // Verify the file was archived
        $this->assertDatabaseHas('t_kegiatan_lampiran', [
            'lampiran_id' => $lampiran->lampiran_id,
            'status_lampiran' => 'archived',
        ]);
    }

    public function test_resubmit_rolls_back_on_failure(): void
    {
        $kegiatan = $this->createKegiatanAtLpjStage($this->pengusul);
        $this->submitLpj($kegiatan);

        $anggaran = KAKAnggaran::where('kak_id', $kegiatan->kak_id)->first();

        $lampiran = KegiatanLampiran::create([
            'anggaran_id' => $anggaran->anggaran_id,
            'nama_file_asli' => 'bukti.pdf',
            'path_file_disimpan' => '/storage/uploads/documents/bukti.pdf',
            'uploader_user_id' => $this->pengusul->user_id,
            'status_lampiran' => 'active',
        ]);

        // Move to revised state
        $kak = $kegiatan->kak;
        $kak->update(['status_id' => 12]);
        KegiatanApproval::where('kegiatan_id', $kegiatan->kegiatan_id)
            ->where('approval_level', 'Bendahara-LPJ')
            ->update(['status' => 'Revisi']);

        // Pass non-existent lampiran IDs to try to trigger a failure scenario
        // In a real scenario, this tests that partial archive + failure doesn't leave
        // the DB in an inconsistent state. The controller should handle gracefully.
        $response = $this->actingAs($this->pengusul)
            ->post(route('lpj.resubmit', $kegiatan), [
                'files_to_delete' => [999999],
            ]);

        // Should either succeed (ignoring non-existent) or fail cleanly
        $response->assertStatus(302);

        // Verify the existing lampiran was NOT modified by a partial failure
        $this->assertDatabaseHas('t_kegiatan_lampiran', [
            'lampiran_id' => $lampiran->lampiran_id,
            'status_lampiran' => 'active',
        ]);
    }

    // ========================================
    // APPROVE TESTS
    // ========================================

    public function test_bendahara_can_approve_lpj(): void
    {
        $kegiatan = $this->createKegiatanAtLpjStage($this->pengusul);
        $this->submitLpj($kegiatan);

        $response = $this->actingAs($this->bendahara)
            ->post(route('lpj.approve', $kegiatan));

        $response->assertStatus(302);
        $response->assertSessionHas('success');

        // Bendahara-LPJ should be Disetujui
        $this->assertDatabaseHas('t_kegiatan_approval', [
            'kegiatan_id' => $kegiatan->kegiatan_id,
            'approval_level' => 'Bendahara-LPJ',
            'status' => 'Disetujui',
        ]);

        // KAK status should be 13 (Setor Fisik Dokumen)
        $this->assertDatabaseHas('t_kak', [
            'kak_id' => $kegiatan->kak_id,
            'status_id' => 13,
        ]);

        // Status log should exist
        $this->assertDatabaseHas('t_kegiatan_log_status', [
            'kegiatan_id' => $kegiatan->kegiatan_id,
            'status_id_baru' => 13,
        ]);
    }

    public function test_non_bendahara_cannot_approve_lpj(): void
    {
        $kegiatan = $this->createKegiatanAtLpjStage($this->pengusul);
        $this->submitLpj($kegiatan);

        $this->actingAs($this->pengusul)
            ->post(route('lpj.approve', $kegiatan))
            ->assertStatus(403);

        $this->actingAs($this->ppk)
            ->post(route('lpj.approve', $kegiatan))
            ->assertStatus(403);
    }

    public function test_approve_fails_when_not_in_valid_status(): void
    {
        $kegiatan = $this->createKegiatanAtLpjStage($this->pengusul);

        // Move approval to Disetujui (already approved)
        KegiatanApproval::where('kegiatan_id', $kegiatan->kegiatan_id)
            ->where('approval_level', 'Bendahara-LPJ')
            ->update(['status' => 'Disetujui']);

        $response = $this->actingAs($this->bendahara)
            ->post(route('lpj.approve', $kegiatan));

        $response->assertStatus(302);
        $response->assertSessionHasErrors(['message']);
    }

    public function test_approve_activates_setor_step(): void
    {
        $kegiatan = $this->createKegiatanAtLpjStage($this->pengusul);
        $this->submitLpj($kegiatan);

        $this->actingAs($this->bendahara)
            ->post(route('lpj.approve', $kegiatan));

        // Bendahara-Setor should now be Aktif
        $this->assertDatabaseHas('t_kegiatan_approval', [
            'kegiatan_id' => $kegiatan->kegiatan_id,
            'approval_level' => 'Bendahara-Setor',
            'status' => 'Aktif',
        ]);
    }

    // ========================================
    // COMPLETE TESTS
    // ========================================

    public function test_bendahara_can_complete_lpj(): void
    {
        $kegiatan = $this->createKegiatanAtLpjStage($this->pengusul);
        $this->approveLpj($kegiatan);

        $response = $this->actingAs($this->bendahara)
            ->post(route('lpj.complete', $kegiatan));

        $response->assertStatus(302);
        $response->assertSessionHas('success');

        // Bendahara-Setor should be Disetujui
        $this->assertDatabaseHas('t_kegiatan_approval', [
            'kegiatan_id' => $kegiatan->kegiatan_id,
            'approval_level' => 'Bendahara-Setor',
            'status' => 'Disetujui',
        ]);

        // KAK status should be 14 (Selesai)
        $this->assertDatabaseHas('t_kak', [
            'kak_id' => $kegiatan->kak_id,
            'status_id' => 14,
        ]);

        // Status log should exist
        $this->assertDatabaseHas('t_kegiatan_log_status', [
            'kegiatan_id' => $kegiatan->kegiatan_id,
            'status_id_baru' => 14,
        ]);
    }

    public function test_non_bendahara_cannot_complete_lpj(): void
    {
        $kegiatan = $this->createKegiatanAtLpjStage($this->pengusul);
        $this->approveLpj($kegiatan);

        $this->actingAs($this->pengusul)
            ->post(route('lpj.complete', $kegiatan))
            ->assertStatus(403);

        $this->actingAs($this->ppk)
            ->post(route('lpj.complete', $kegiatan))
            ->assertStatus(403);
    }

    public function test_complete_fails_when_not_at_setor_level(): void
    {
        $kegiatan = $this->createKegiatanAtLpjStage($this->pengusul);
        $this->submitLpj($kegiatan);

        // Bendahara-LPJ is still Aktif, Bendahara-Setor is Menunggu
        $response = $this->actingAs($this->bendahara)
            ->post(route('lpj.complete', $kegiatan));

        $response->assertStatus(302);
        $response->assertSessionHasErrors(['message']);
    }
}

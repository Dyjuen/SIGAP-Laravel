<?php

namespace Tests\Feature\Api;

use App\Models\KAK;
use App\Models\KAKAnggaran;
use App\Models\Kegiatan;
use App\Models\KegiatanApproval;
use App\Models\KegiatanLampiran;
use App\Models\KegiatanLogStatus;
use App\Models\Satuan;
use App\Models\User;
use Database\Seeders\MasterDataSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class LpjApiTest extends TestCase
{
    use RefreshDatabase;

    private User $pengusul;
    private User $pengusulLain;
    private User $bendahara;
    private User $ppk;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(MasterDataSeeder::class);

        $this->pengusul = User::factory()->create(['role_id' => 3]);
        $this->pengusulLain = User::factory()->create(['role_id' => 3]);
        $this->bendahara = User::factory()->create(['role_id' => 6]);
        $this->ppk = User::factory()->create(['role_id' => 4]);
    }

    // ========================================
    // HELPERS
    // ========================================

    private function createKegiatanAtLpjStage(User $pengusul, int $totalAnggaran = 5000000): Kegiatan
    {
        $kak = KAK::create([
            'nama_kegiatan' => 'Test Kegiatan LPJ API',
            'deskripsi_kegiatan' => 'Test API',
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
            'uraian' => 'Honorarium Narasumber API',
            'volume1' => 2,
            'satuan1_id' => $satuan->satuan_id,
            'harga_satuan' => $totalAnggaran / 2,
            'jumlah_diusulkan' => $totalAnggaran,
        ]);

        $kegiatan = Kegiatan::create([
            'kak_id' => $kak->kak_id,
            'penanggung_jawab_manual' => 'Test PJ API',
            'pelaksana_manual' => 'Test Pelaksana API',
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
            'spk_kesesuaian_waktu' => 85,
            'spk_ketepatan_anggaran' => 90,
            'spk_kesesuaian_output' => 100,
            'spk_ketepatan_lpj' => 95,
        ];
    }

    private function submitLpj(Kegiatan $kegiatan): void
    {
        $kak = $kegiatan->kak;
        $kak->update(['status_id' => 11]);
        $kegiatan->update(['lpj_submitted_at' => now()]);
    }

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

        $this->postJson("/api/kegiatan/{$kegiatan->kegiatan_id}/lpj/submit")
            ->assertStatus(401);
    }

    public function test_pengusul_can_submit_lpj(): void
    {
        $kegiatan = $this->createKegiatanAtLpjStage($this->pengusul);
        $payload = $this->buildRealisasiPayload($kegiatan);

        $response = $this->actingAs($this->pengusul)
            ->postJson("/api/kegiatan/{$kegiatan->kegiatan_id}/lpj/submit", $payload);

        $response->assertStatus(201);
        $response->assertJsonPath('success', true);

        // Verify kegiatan was updated
        $kegiatan->refresh();
        $this->assertNotNull($kegiatan->lpj_submitted_at);
        $this->assertEquals(85, $kegiatan->spk_kesesuaian_waktu);
        $this->assertEquals(80, $kegiatan->spk_ketepatan_anggaran);
        $this->assertEquals(100, $kegiatan->spk_kesesuaian_output);
        $this->assertEquals(100, $kegiatan->spk_ketepatan_lpj);

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
            ->postJson("/api/kegiatan/{$kegiatan->kegiatan_id}/lpj/submit", $payload)
            ->assertStatus(403);

        $this->actingAs($this->bendahara)
            ->postJson("/api/kegiatan/{$kegiatan->kegiatan_id}/lpj/submit", $payload)
            ->assertStatus(403);
    }

    public function test_submit_fails_when_already_submitted(): void
    {
        $kegiatan = $this->createKegiatanAtLpjStage($this->pengusul);
        $this->submitLpj($kegiatan);

        $payload = $this->buildRealisasiPayload($kegiatan);

        $response = $this->actingAs($this->pengusul)
            ->postJson("/api/kegiatan/{$kegiatan->kegiatan_id}/lpj/submit", $payload);

        $response->assertStatus(422);
        $response->assertJsonPath('success', false);
    }

    public function test_submit_validates_realisasi_required(): void
    {
        $kegiatan = $this->createKegiatanAtLpjStage($this->pengusul);

        // Submit with empty payload
        $this->actingAs($this->pengusul)
            ->postJson("/api/kegiatan/{$kegiatan->kegiatan_id}/lpj/submit", [])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['realisasi']);
    }

    public function test_submit_rolls_back_on_file_upload_failure(): void
    {
        Storage::fake('supabase');
        $kegiatan = $this->createKegiatanAtLpjStage($this->pengusul);
        $payload = $this->buildRealisasiPayload($kegiatan);

        // Send a file that fails validation (e.g. extension)
        $anggaran = KAKAnggaran::where('kak_id', $kegiatan->kak_id)->first();
        $payload['bukti'][$anggaran->anggaran_id] = [
            UploadedFile::fake()->create('malware.exe', 512),
        ];

        $response = $this->actingAs($this->pengusul)
            ->postJson("/api/kegiatan/{$kegiatan->kegiatan_id}/lpj/submit", $payload);

        // MIME validation should fail
        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['bukti.'.$anggaran->anggaran_id.'.0']);

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
            ->postJson("/api/kegiatan/{$kegiatan->kegiatan_id}/lpj/submit", $payload);
        $response1->assertStatus(201);
        $response1->assertJsonPath('success', true);

        // Second submit should fail (already submitted)
        $response2 = $this->actingAs($this->pengusul)
            ->postJson("/api/kegiatan/{$kegiatan->kegiatan_id}/lpj/submit", $payload);
        $response2->assertStatus(422);

        // Only one log should exist
        $logCount = KegiatanLogStatus::where('kegiatan_id', $kegiatan->kegiatan_id)
            ->where('status_id_baru', 11)
            ->count();
        $this->assertEquals(1, $logCount);
    }

    // ========================================
    // REVIEW / SHOW TESTS
    // ========================================

    public function test_bendahara_can_review_lpj(): void
    {
        $kegiatan = $this->createKegiatanAtLpjStage($this->pengusul);
        $this->submitLpj($kegiatan);

        $response = $this->actingAs($this->bendahara)
            ->getJson("/api/lpj/{$kegiatan->kegiatan_id}");

        $response->assertStatus(200);
        $response->assertJsonPath('success', true);
    }

    public function test_pengusul_owner_can_review_lpj(): void
    {
        $kegiatan = $this->createKegiatanAtLpjStage($this->pengusul);
        $this->submitLpj($kegiatan);

        $response = $this->actingAs($this->pengusul)
            ->getJson("/api/lpj/{$kegiatan->kegiatan_id}");

        $response->assertStatus(200);
        $response->assertJsonPath('success', true);
    }

    public function test_non_authorized_cannot_review_lpj(): void
    {
        $kegiatan = $this->createKegiatanAtLpjStage($this->pengusul);

        $this->actingAs($this->pengusulLain)
            ->getJson("/api/lpj/{$kegiatan->kegiatan_id}")
            ->assertStatus(403);

        $this->actingAs($this->ppk)
            ->getJson("/api/lpj/{$kegiatan->kegiatan_id}")
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
            ->postJson("/api/kegiatan/{$kegiatan->kegiatan_id}/lpj/revise", [
                'anggaran_comments' => [
                    ['id' => $kegiatan->kak->anggaran->first()->anggaran_id, 'catatan_reviewer' => 'Revisi anggaran ini.'],
                ],
            ]);

        $response->assertStatus(200);
        $response->assertJsonPath('success', true);

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
            ->postJson("/api/kegiatan/{$kegiatan->kegiatan_id}/lpj/revise", [])
            ->assertStatus(403);

        $this->actingAs($this->ppk)
            ->postJson("/api/kegiatan/{$kegiatan->kegiatan_id}/lpj/revise", [])
            ->assertStatus(403);
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

        $payload = $this->buildRealisasiPayload($kegiatan);
        $response = $this->actingAs($this->pengusul)
            ->postJson("/api/kegiatan/{$kegiatan->kegiatan_id}/lpj/resubmit", $payload);

        $response->assertStatus(200);
        $response->assertJsonPath('success', true);

        // Verify kegiatan was updated with SPK
        $kegiatan->refresh();
        $this->assertEquals(85, $kegiatan->spk_kesesuaian_waktu);
        $this->assertEquals(80, $kegiatan->spk_ketepatan_anggaran);
        $this->assertEquals(100, $kegiatan->spk_kesesuaian_output);
        $this->assertEquals(100, $kegiatan->spk_ketepatan_lpj);

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
            ->postJson("/api/kegiatan/{$kegiatan->kegiatan_id}/lpj/resubmit")
            ->assertStatus(403);

        $this->actingAs($this->bendahara)
            ->postJson("/api/kegiatan/{$kegiatan->kegiatan_id}/lpj/resubmit")
            ->assertStatus(403);
    }

    public function test_resubmit_fails_when_not_in_revisi_state(): void
    {
        $kegiatan = $this->createKegiatanAtLpjStage($this->pengusul);
        $this->submitLpj($kegiatan); // status 11, approval = Aktif (not Revisi)

        $payload = $this->buildRealisasiPayload($kegiatan);
        $response = $this->actingAs($this->pengusul)
            ->postJson("/api/kegiatan/{$kegiatan->kegiatan_id}/lpj/resubmit", $payload);

        $response->assertStatus(422);
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
            'status_lampiran' => 'pending',
        ]);

        // Move to revised state
        $kak = $kegiatan->kak;
        $kak->update(['status_id' => 12]);
        KegiatanApproval::where('kegiatan_id', $kegiatan->kegiatan_id)
            ->where('approval_level', 'Bendahara-LPJ')
            ->update(['status' => 'Revisi']);

        $payload = array_merge($this->buildRealisasiPayload($kegiatan), [
            'files_to_delete' => [$lampiran->lampiran_id],
        ]);
        $response = $this->actingAs($this->pengusul)
            ->postJson("/api/kegiatan/{$kegiatan->kegiatan_id}/lpj/resubmit", $payload);

        $response->assertStatus(200);
        $response->assertJsonPath('success', true);

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
            'status_lampiran' => 'pending',
        ]);

        // Move to revised state
        $kak = $kegiatan->kak;
        $kak->update(['status_id' => 12]);
        KegiatanApproval::where('kegiatan_id', $kegiatan->kegiatan_id)
            ->where('approval_level', 'Bendahara-LPJ')
            ->update(['status' => 'Revisi']);

        // Pass non-existent lampiran IDs to try to trigger a failure scenario
        $payload = array_merge($this->buildRealisasiPayload($kegiatan), [
            'files_to_delete' => [999999],
        ]);
        $response = $this->actingAs($this->pengusul)
            ->postJson("/api/kegiatan/{$kegiatan->kegiatan_id}/lpj/resubmit", $payload);

        // Standard laravel form requests validate exists constraint: so it will return 422!
        $response->assertStatus(422);

        // Verify the existing lampiran was NOT modified by a partial failure
        $this->assertDatabaseHas('t_kegiatan_lampiran', [
            'lampiran_id' => $lampiran->lampiran_id,
            'status_lampiran' => 'pending',
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
            ->postJson("/api/kegiatan/{$kegiatan->kegiatan_id}/lpj/approve");

        $response->assertStatus(200);
        $response->assertJsonPath('success', true);

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

        // Verify approver_user_id
        $this->assertDatabaseHas('t_kegiatan_approval', [
            'kegiatan_id' => $kegiatan->kegiatan_id,
            'approval_level' => 'Bendahara-LPJ',
            'status' => 'Disetujui',
            'approver_user_id' => $this->bendahara->user_id,
        ]);
    }

    public function test_revise_lpj_clears_old_notes(): void
    {
        $kegiatan = $this->createKegiatanAtLpjStage($this->pengusul);
        $this->submitLpj($kegiatan);

        $anggaran = $kegiatan->kak->anggaran->first();
        $anggaran->update(['catatan_verifikator' => 'Old comment']);

        $lampiran = KegiatanLampiran::create([
            'anggaran_id' => $anggaran->anggaran_id,
            'nama_file_asli' => 'bukti.pdf',
            'path_file_disimpan' => '/storage/uploads/documents/bukti.pdf',
            'uploader_user_id' => $this->pengusul->user_id,
            'status_lampiran' => 'pending',
            'catatan_reviewer' => 'Old lampiran comment',
        ]);

        $this->actingAs($this->bendahara)
            ->postJson("/api/kegiatan/{$kegiatan->kegiatan_id}/lpj/revise", [
                'anggaran_comments' => [
                    ['id' => $anggaran->anggaran_id, 'catatan_reviewer' => 'New comment'],
                ],
            ]);

        // Verify old notes were replaced/cleared
        $anggaran->refresh();
        $this->assertEquals('New comment', $anggaran->catatan_verifikator);

        $lampiran->refresh();
        $this->assertNull($lampiran->catatan_reviewer);
    }

    public function test_non_bendahara_cannot_approve_lpj(): void
    {
        $kegiatan = $this->createKegiatanAtLpjStage($this->pengusul);
        $this->submitLpj($kegiatan);

        $this->actingAs($this->pengusul)
            ->postJson("/api/kegiatan/{$kegiatan->kegiatan_id}/lpj/approve")
            ->assertStatus(403);

        $this->actingAs($this->ppk)
            ->postJson("/api/kegiatan/{$kegiatan->kegiatan_id}/lpj/approve")
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
            ->postJson("/api/kegiatan/{$kegiatan->kegiatan_id}/lpj/approve");

        $response->assertStatus(422);
    }

    public function test_approve_activates_setor_step(): void
    {
        $kegiatan = $this->createKegiatanAtLpjStage($this->pengusul);
        $this->submitLpj($kegiatan);

        $this->actingAs($this->bendahara)
            ->postJson("/api/kegiatan/{$kegiatan->kegiatan_id}/lpj/approve");

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
            ->postJson("/api/kegiatan/{$kegiatan->kegiatan_id}/lpj/complete");

        $response->assertStatus(200);
        $response->assertJsonPath('success', true);

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
            ->postJson("/api/kegiatan/{$kegiatan->kegiatan_id}/lpj/complete")
            ->assertStatus(403);

        $this->actingAs($this->ppk)
            ->postJson("/api/kegiatan/{$kegiatan->kegiatan_id}/lpj/complete")
            ->assertStatus(403);
    }

    public function test_complete_fails_when_not_at_setor_level(): void
    {
        $kegiatan = $this->createKegiatanAtLpjStage($this->pengusul);
        $this->submitLpj($kegiatan);

        // Bendahara-LPJ is still Aktif, Bendahara-Setor is Menunggu
        $response = $this->actingAs($this->bendahara)
            ->postJson("/api/kegiatan/{$kegiatan->kegiatan_id}/lpj/complete");

        $response->assertStatus(422);
    }
}

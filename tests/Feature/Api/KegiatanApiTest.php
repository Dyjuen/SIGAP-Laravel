<?php

namespace Tests\Feature\Api;

use App\Mail\KAKWorkflowMail;
use App\Models\KAK;
use App\Models\Kegiatan;
use App\Models\KegiatanApproval;
use App\Models\User;
use Database\Seeders\MasterDataSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class KegiatanApiTest extends TestCase
{
    use RefreshDatabase;

    private User $pengusul;

    private User $ppk;

    private User $wadir;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(MasterDataSeeder::class);

        $this->pengusul = User::factory()->create(['role_id' => 3]);
        $this->ppk = User::factory()->create(['role_id' => 4]);
        $this->wadir = User::factory()->create(['role_id' => 5]);
    }

    private function createApprovedKak(User $pengusul): KAK
    {
        return KAK::create([
            'nama_kegiatan' => 'Test KAK',
            'deskripsi_kegiatan' => 'Test Deskripsi',
            'pengusul_user_id' => $pengusul->user_id,
            'status_id' => 3, // Disetujui Verifikator
            'tanggal_mulai' => now()->addDays(1),
            'tanggal_selesai' => now()->addDays(5),
            'tipe_kegiatan_id' => 1,
            'mata_anggaran_id' => 1,
        ]);
    }

    public function test_api_index_kegiatan_returns_correct_data()
    {
        $kak = $this->createApprovedKak($this->pengusul);
        $token = $this->pengusul->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer '.$token,
            'Accept' => 'application/json',
        ])->getJson('/api/kegiatan');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'approvedKaks',
            'pendingKegiatan',
        ]);
    }

    public function test_api_store_kegiatan_works()
    {
        Storage::fake('supabase');
        $kak = $this->createApprovedKak($this->pengusul);
        $token = $this->pengusul->createToken('test-token')->plainTextToken;
        $file = UploadedFile::fake()->create('surat.pdf', 100);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer '.$token,
            'Accept' => 'application/json',
        ])->postJson('/api/kegiatan', [
            'kak_id' => $kak->kak_id,
            'penanggung_jawab_manual' => 'John Doe',
            'pelaksana_manual' => 'Jane Doe',
            'surat_pengantar' => $file,
        ]);

        $response->assertStatus(201);
        $response->assertJson([
            'message' => 'Kegiatan berhasil diajukan.',
        ]);

        $this->assertDatabaseHas('t_kegiatan', [
            'kak_id' => $kak->kak_id,
            'penanggung_jawab_manual' => 'John Doe',
        ]);
    }

    public function test_api_show_kegiatan_returns_details()
    {
        $kak = $this->createApprovedKak($this->pengusul);
        $kegiatan = Kegiatan::create(['kak_id' => $kak->kak_id]);
        $token = $this->pengusul->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer '.$token,
            'Accept' => 'application/json',
        ])->getJson('/api/kegiatan/'.$kegiatan->kegiatan_id);

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'kegiatan' => [
                'kegiatan_id',
                'kak' => [
                    'nama_kegiatan',
                ],
            ],
        ]);
    }

    public function test_api_update_kegiatan_works()
    {
        $kak = $this->createApprovedKak($this->pengusul);
        $kegiatan = Kegiatan::create([
            'kak_id' => $kak->kak_id,
            'penanggung_jawab_manual' => 'Old PJ',
            'pelaksana_manual' => 'Old PL',
        ]);
        $token = $this->pengusul->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer '.$token,
            'Accept' => 'application/json',
        ])->putJson('/api/kegiatan/'.$kegiatan->kegiatan_id, [
            'kak_id' => $kak->kak_id,
            'nama_kegiatan' => 'Updated KAK Name',
            'deskripsi_kegiatan' => 'Updated Desc that must have at least fifty characters in total to satisfy the Laravel validation rules.',
            'tanggal_mulai' => now()->addDays(2)->format('Y-m-d'),
            'tanggal_selesai' => now()->addDays(6)->format('Y-m-d'),
            'lokasi' => 'Updated Location',
            'mata_anggaran_id' => 1,
            'penanggung_jawab_manual' => 'New PJ',
            'pelaksana_manual' => 'New PL',
            'surat_pengantar' => UploadedFile::fake()->create('surat.pdf', 100),
        ]);

        $response->assertStatus(200);
        $response->assertJson([
            'message' => 'Kegiatan berhasil diperbarui.',
        ]);

        $kegiatan->refresh();
        $this->assertEquals('New PJ', $kegiatan->penanggung_jawab_manual);
        $this->assertEquals('New PL', $kegiatan->pelaksana_manual);
    }

    public function test_api_approve_kegiatan_works()
    {
        $kak = $this->createApprovedKak($this->pengusul);
        $kegiatan = Kegiatan::create(['kak_id' => $kak->kak_id]);
        KegiatanApproval::create([
            'kegiatan_id' => $kegiatan->kegiatan_id,
            'approval_level' => 'PPK',
            'status' => 'Aktif',
        ]);

        $token = $this->ppk->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer '.$token,
            'Accept' => 'application/json',
        ])->postJson('/api/kegiatan/'.$kegiatan->kegiatan_id.'/approve', [
            'catatan' => 'Lanjut',
        ]);

        $response->assertStatus(200);
        $response->assertJson([
            'message' => 'Kegiatan berhasil disetujui.',
        ]);

        $this->assertDatabaseHas('t_kegiatan_approval', [
            'kegiatan_id' => $kegiatan->kegiatan_id,
            'approval_level' => 'PPK',
            'status' => 'Disetujui',
        ]);
    }

    public function test_api_monitoring_returns_list()
    {
        $kak = $this->createApprovedKak($this->pengusul);
        $kegiatan = Kegiatan::create(['kak_id' => $kak->kak_id]);
        $token = $this->pengusul->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer '.$token,
            'Accept' => 'application/json',
        ])->getJson('/api/kegiatan/monitoring');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'data',
            'stats',
        ]);
    }

    public function test_api_pengusul_cannot_submit_from_unapproved_kak()
    {
        $kak = KAK::create([
            'nama_kegiatan' => 'Test Draft KAK',
            'deskripsi_kegiatan' => 'Test Deskripsi',
            'pengusul_user_id' => $this->pengusul->user_id,
            'status_id' => 1, // Draft
            'tanggal_mulai' => now()->addDays(1),
            'tanggal_selesai' => now()->addDays(5),
            'tipe_kegiatan_id' => 1,
            'mata_anggaran_id' => 1,
        ]);
        $token = $this->pengusul->createToken('test-token')->plainTextToken;
        $file = UploadedFile::fake()->create('surat.pdf', 100);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer '.$token,
            'Accept' => 'application/json',
        ])->postJson('/api/kegiatan', [
            'kak_id' => $kak->kak_id,
            'penanggung_jawab_manual' => 'John Doe',
            'pelaksana_manual' => 'Jane Doe',
            'surat_pengantar' => $file,
        ]);

        $response->assertStatus(422);
        $response->assertJsonFragment([
            'message' => 'KAK belum disetujui Verifikator.',
        ]);
    }

    public function test_api_pengusul_cannot_submit_duplicate_kegiatan()
    {
        Storage::fake('supabase');
        $kak = $this->createApprovedKak($this->pengusul);
        $token = $this->pengusul->createToken('test-token')->plainTextToken;
        $file = UploadedFile::fake()->create('surat.pdf', 100);

        // First submit
        $this->withHeaders([
            'Authorization' => 'Bearer '.$token,
            'Accept' => 'application/json',
        ])->postJson('/api/kegiatan', [
            'kak_id' => $kak->kak_id,
            'penanggung_jawab_manual' => 'John Doe',
            'pelaksana_manual' => 'Jane Doe',
            'surat_pengantar' => $file,
        ]);

        // Second submit
        $response = $this->withHeaders([
            'Authorization' => 'Bearer '.$token,
            'Accept' => 'application/json',
        ])->postJson('/api/kegiatan', [
            'kak_id' => $kak->kak_id,
            'penanggung_jawab_manual' => 'John Doe',
            'pelaksana_manual' => 'Jane Doe',
            'surat_pengantar' => UploadedFile::fake()->create('surat2.pdf', 100),
        ]);

        $response->assertStatus(422);
        $response->assertJsonFragment([
            'message' => 'Kegiatan untuk KAK ini sudah diajukan.',
        ]);
    }

    public function test_api_submit_validation_fails()
    {
        $kak = $this->createApprovedKak($this->pengusul);
        $token = $this->pengusul->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer '.$token,
            'Accept' => 'application/json',
        ])->postJson('/api/kegiatan', [
            'kak_id' => $kak->kak_id,
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['penanggung_jawab_manual', 'pelaksana_manual', 'surat_pengantar']);
    }

    public function test_api_oversized_file_rejection()
    {
        Storage::fake('supabase');
        $kak = $this->createApprovedKak($this->pengusul);
        $token = $this->pengusul->createToken('test-token')->plainTextToken;
        $file = UploadedFile::fake()->create('surat.pdf', 6000); // 6MB

        $response = $this->withHeaders([
            'Authorization' => 'Bearer '.$token,
            'Accept' => 'application/json',
        ])->postJson('/api/kegiatan', [
            'kak_id' => $kak->kak_id,
            'penanggung_jawab_manual' => 'John Doe',
            'pelaksana_manual' => 'Jane Doe',
            'surat_pengantar' => $file,
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['surat_pengantar']);
    }

    public function test_api_invalid_file_type_rejection()
    {
        Storage::fake('supabase');
        $kak = $this->createApprovedKak($this->pengusul);
        $token = $this->pengusul->createToken('test-token')->plainTextToken;
        $file = UploadedFile::fake()->create('surat.exe', 100);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer '.$token,
            'Accept' => 'application/json',
        ])->postJson('/api/kegiatan', [
            'kak_id' => $kak->kak_id,
            'penanggung_jawab_manual' => 'John Doe',
            'pelaksana_manual' => 'Jane Doe',
            'surat_pengantar' => $file,
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['surat_pengantar']);
    }

    public function test_api_wadir_cannot_approve_while_at_ppk_level()
    {
        $kak = $this->createApprovedKak($this->pengusul);
        $kegiatan = Kegiatan::create(['kak_id' => $kak->kak_id]);
        KegiatanApproval::create([
            'kegiatan_id' => $kegiatan->kegiatan_id,
            'approval_level' => 'PPK',
            'status' => 'Aktif',
        ]);
        $token = $this->wadir->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer '.$token,
            'Accept' => 'application/json',
        ])->postJson('/api/kegiatan/'.$kegiatan->kegiatan_id.'/approve', [
            'catatan' => 'OK',
        ]);

        $response->assertStatus(403);
    }

    public function test_api_pengusul_cannot_approve()
    {
        $kak = $this->createApprovedKak($this->pengusul);
        $kegiatan = Kegiatan::create(['kak_id' => $kak->kak_id]);
        KegiatanApproval::create([
            'kegiatan_id' => $kegiatan->kegiatan_id,
            'approval_level' => 'PPK',
            'status' => 'Aktif',
        ]);
        $token = $this->pengusul->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer '.$token,
            'Accept' => 'application/json',
        ])->postJson('/api/kegiatan/'.$kegiatan->kegiatan_id.'/approve', [
            'catatan' => 'OK',
        ]);

        $response->assertStatus(403);
    }

    public function test_api_wadir_can_approve_after_ppk()
    {
        Storage::fake('supabase');
        $kak = $this->createApprovedKak($this->pengusul);
        $kegiatan = Kegiatan::create(['kak_id' => $kak->kak_id]);
        KegiatanApproval::create([
            'kegiatan_id' => $kegiatan->kegiatan_id,
            'approval_level' => 'PPK',
            'status' => 'Disetujui',
        ]);
        KegiatanApproval::create([
            'kegiatan_id' => $kegiatan->kegiatan_id,
            'approval_level' => 'Wadir2',
            'status' => 'Aktif',
        ]);

        $token = $this->wadir->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer '.$token,
            'Accept' => 'application/json',
        ])->postJson('/api/kegiatan/'.$kegiatan->kegiatan_id.'/approve', [
            'catatan' => 'ACC',
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('t_kegiatan_approval', [
            'kegiatan_id' => $kegiatan->kegiatan_id,
            'approval_level' => 'Wadir2',
            'status' => 'Disetujui',
        ]);
    }

    public function test_api_store_kegiatan_is_atomic()
    {
        Storage::fake('supabase');
        $kak = $this->createApprovedKak($this->pengusul);
        $file = UploadedFile::fake()->create('surat.pdf', 100);

        KegiatanApproval::creating(function () {
            throw new \Exception('Simulated DB Failure');
        });

        $token = $this->pengusul->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer '.$token,
            'Accept' => 'application/json',
        ])->postJson('/api/kegiatan', [
            'kak_id' => $kak->kak_id,
            'penanggung_jawab_manual' => 'John Doe',
            'pelaksana_manual' => 'Jane Doe',
            'surat_pengantar' => $file,
        ]);

        $response->assertStatus(500);
        $this->assertDatabaseCount('t_kegiatan', 0);
        $this->assertDatabaseHas('t_kak', [
            'kak_id' => $kak->kak_id,
            'status_id' => 3,
        ]);

        KegiatanApproval::flushEventListeners();
    }

    public function test_api_ppk_cannot_approve_wadir_step()
    {
        $kak = $this->createApprovedKak($this->pengusul);
        $kegiatan = Kegiatan::create(['kak_id' => $kak->kak_id]);
        KegiatanApproval::create([
            'kegiatan_id' => $kegiatan->kegiatan_id,
            'approval_level' => 'Wadir2',
            'status' => 'Aktif',
        ]);
        $token = $this->ppk->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer '.$token,
            'Accept' => 'application/json',
        ])->postJson('/api/kegiatan/'.$kegiatan->kegiatan_id.'/approve', [
            'catatan' => 'OK',
        ]);

        $response->assertStatus(403);
    }

    public function test_api_approve_fails_if_no_active_step()
    {
        $kak = $this->createApprovedKak($this->pengusul);
        $kegiatan = Kegiatan::create(['kak_id' => $kak->kak_id]);
        $token = $this->ppk->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer '.$token,
            'Accept' => 'application/json',
        ])->postJson('/api/kegiatan/'.$kegiatan->kegiatan_id.'/approve', [
            'catatan' => 'OK',
        ]);

        $response->assertStatus(422);
        $response->assertJsonFragment([
            'message' => 'Tidak ada langkah persetujuan yang aktif.',
        ]);
    }

    public function test_api_wadir_approve_triggers_email()
    {
        Mail::fake();
        $kak = $this->createApprovedKak($this->pengusul);
        $kegiatan = Kegiatan::create(['kak_id' => $kak->kak_id]);
        KegiatanApproval::create([
            'kegiatan_id' => $kegiatan->kegiatan_id,
            'approval_level' => 'Wadir2',
            'status' => 'Aktif',
        ]);
        $token = $this->wadir->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer '.$token,
            'Accept' => 'application/json',
        ])->postJson('/api/kegiatan/'.$kegiatan->kegiatan_id.'/approve', [
            'catatan' => 'ACC',
        ]);

        $response->assertStatus(200);
        Mail::assertQueued(KAKWorkflowMail::class);
    }

    public function test_api_pengusul_can_only_see_own_kegiatan()
    {
        $pengusul2 = User::factory()->create(['role_id' => 3]);

        $kak1 = KAK::factory()->create(['pengusul_user_id' => $this->pengusul->user_id]);
        $kak2 = KAK::factory()->create(['pengusul_user_id' => $pengusul2->user_id]);

        $kegiatan1 = Kegiatan::create(['kak_id' => $kak1->kak_id]);
        $kegiatan2 = Kegiatan::create(['kak_id' => $kak2->kak_id]);

        $token = $this->pengusul->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer '.$token,
            'Accept' => 'application/json',
        ])->getJson('/api/kegiatan/monitoring');

        $response->assertStatus(200);
        $response->assertJsonCount(1, 'data.data');
        $this->assertEquals($kegiatan1->kegiatan_id, $response->json('data.data.0.kegiatan_id'));
    }

    public function test_api_unauthorized_roles_cannot_access_monitoring()
    {
        $bendahara = User::factory()->create(['role_id' => 6]);
        $rektorat = User::factory()->create(['role_id' => 7]);

        $bendaharaToken = $bendahara->createToken('test-token')->plainTextToken;
        $rektoratToken = $rektorat->createToken('test-token')->plainTextToken;

        // Bendahara
        $this->withHeaders([
            'Authorization' => 'Bearer '.$bendaharaToken,
            'Accept' => 'application/json',
        ])->getJson('/api/kegiatan/monitoring')->assertStatus(403);

        // Rektorat
        $this->withHeaders([
            'Authorization' => 'Bearer '.$rektoratToken,
            'Accept' => 'application/json',
        ])->getJson('/api/kegiatan/monitoring')->assertStatus(403);
    }

    public function test_api_verifikator_can_only_see_matching_tipe_kegiatan()
    {
        $verifikator1 = User::factory()->create(['role_id' => 2, 'username' => 'verifikator1']);

        $kak1 = KAK::factory()->create(['pengusul_user_id' => $this->pengusul->user_id, 'tipe_kegiatan_id' => 1]);
        $kak2 = KAK::factory()->create(['pengusul_user_id' => $this->pengusul->user_id, 'tipe_kegiatan_id' => 2]);

        $kegiatan1 = Kegiatan::create(['kak_id' => $kak1->kak_id]);
        $kegiatan2 = Kegiatan::create(['kak_id' => $kak2->kak_id]);

        $token = $verifikator1->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer '.$token,
            'Accept' => 'application/json',
        ])->getJson('/api/kegiatan/monitoring');

        $response->assertStatus(200);
        $response->assertJsonCount(1, 'data.data');
        $this->assertEquals($kegiatan1->kegiatan_id, $response->json('data.data.0.kegiatan_id'));
    }

    public function test_api_admin_can_see_all_kegiatan()
    {
        $admin = User::factory()->create(['role_id' => 1]);

        $kak1 = KAK::factory()->create(['pengusul_user_id' => $this->pengusul->user_id, 'tipe_kegiatan_id' => 1]);
        $kak2 = KAK::factory()->create(['pengusul_user_id' => $this->pengusul->user_id, 'tipe_kegiatan_id' => 2]);

        $kegiatan1 = Kegiatan::create(['kak_id' => $kak1->kak_id]);
        $kegiatan2 = Kegiatan::create(['kak_id' => $kak2->kak_id]);

        $token = $admin->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer '.$token,
            'Accept' => 'application/json',
        ])->getJson('/api/kegiatan/monitoring');

        $response->assertStatus(200);
        $response->assertJsonCount(2, 'data.data');
    }

    public function test_api_monitoring_search_by_kak_name()
    {
        $admin = User::factory()->create(['role_id' => 1]);
        $kak1 = KAK::factory()->create(['nama_kegiatan' => 'Workshop IT']);
        $kak2 = KAK::factory()->create(['nama_kegiatan' => 'Seminar Bisnis']);

        Kegiatan::create(['kak_id' => $kak1->kak_id]);
        Kegiatan::create(['kak_id' => $kak2->kak_id]);

        $token = $admin->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer '.$token,
            'Accept' => 'application/json',
        ])->getJson('/api/kegiatan/monitoring?search=Workshop');

        $response->assertStatus(200);
        $response->assertJsonCount(1, 'data.data');
        $this->assertEquals('Workshop IT', $response->json('data.data.0.nama_kegiatan'));
    }

    public function test_api_stepper_status_computation()
    {
        $kak = KAK::factory()->create(['pengusul_user_id' => $this->pengusul->user_id]);
        $kegiatan = Kegiatan::create(['kak_id' => $kak->kak_id]);

        KegiatanApproval::create([
            'kegiatan_id' => $kegiatan->kegiatan_id,
            'approval_level' => 'PPK',
            'status' => 'Disetujui',
            'updated_at' => now(),
        ]);

        KegiatanApproval::create([
            'kegiatan_id' => $kegiatan->kegiatan_id,
            'approval_level' => 'Wadir2',
            'status' => 'Aktif',
            'updated_at' => now(),
        ]);

        $token = $this->pengusul->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer '.$token,
            'Accept' => 'application/json',
        ])->getJson('/api/kegiatan/monitoring');

        $response->assertStatus(200);
        $response->assertJsonPath('data.data.0.status', 2); // Step 2 (Wadir2) is active
    }

    public function test_api_pengusul_cannot_show_others_kegiatan()
    {
        $otherPengusul = User::factory()->create(['role_id' => 3]);
        $kak = $this->createApprovedKak($otherPengusul);
        $kegiatan = Kegiatan::create(['kak_id' => $kak->kak_id]);

        $token = $this->pengusul->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer '.$token,
            'Accept' => 'application/json',
        ])->getJson('/api/kegiatan/'.$kegiatan->kegiatan_id);

        $response->assertStatus(403);
    }

    public function test_api_pengusul_cannot_update_others_kegiatan()
    {
        $otherPengusul = User::factory()->create(['role_id' => 3]);
        $kak = $this->createApprovedKak($otherPengusul);
        $kegiatan = Kegiatan::create([
            'kak_id' => $kak->kak_id,
            'penanggung_jawab_manual' => 'Old PJ',
            'pelaksana_manual' => 'Old PL',
        ]);

        $token = $this->pengusul->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer '.$token,
            'Accept' => 'application/json',
        ])->putJson('/api/kegiatan/'.$kegiatan->kegiatan_id, [
            'kak_id' => $kak->kak_id,
            'nama_kegiatan' => 'Hacked KAK Name',
            'deskripsi_kegiatan' => 'Updated Desc that must have at least fifty characters in total to satisfy the Laravel validation rules.',
            'tanggal_mulai' => now()->addDays(2)->format('Y-m-d'),
            'tanggal_selesai' => now()->addDays(6)->format('Y-m-d'),
            'lokasi' => 'Updated Location',
            'mata_anggaran_id' => 1,
            'penanggung_jawab_manual' => 'Hack PJ',
            'pelaksana_manual' => 'Hack PL',
        ]);

        $response->assertStatus(403);
    }

    public function test_api_unauthorized_roles_cannot_access_kegiatan_routes()
    {
        $verifikator = User::factory()->create(['role_id' => 2, 'username' => 'verifikator1']);
        $bendahara = User::factory()->create(['role_id' => 6]);
        $rektorat = User::factory()->create(['role_id' => 7]);

        $verifToken = $verifikator->createToken('test-token')->plainTextToken;
        $bendaharaToken = $bendahara->createToken('test-token')->plainTextToken;
        $rektoratToken = $rektorat->createToken('test-token')->plainTextToken;

        // Verifikator, Bendahara, Rektorat cannot access GET /api/kegiatan
        $this->withHeaders(['Authorization' => 'Bearer '.$verifToken, 'Accept' => 'application/json'])
            ->getJson('/api/kegiatan')->assertStatus(403);
        $this->withHeaders(['Authorization' => 'Bearer '.$bendaharaToken, 'Accept' => 'application/json'])
            ->getJson('/api/kegiatan')->assertStatus(403);
        $this->withHeaders(['Authorization' => 'Bearer '.$rektoratToken, 'Accept' => 'application/json'])
            ->getJson('/api/kegiatan')->assertStatus(403);

        // Create a kegiatan
        $kak = $this->createApprovedKak($this->pengusul);
        $kegiatan = Kegiatan::create(['kak_id' => $kak->kak_id]);

        // Verifikator and Rektorat cannot access GET /api/kegiatan/{kegiatan}
        $this->withHeaders(['Authorization' => 'Bearer '.$verifToken, 'Accept' => 'application/json'])
            ->getJson('/api/kegiatan/'.$kegiatan->kegiatan_id)->assertStatus(403);
        $this->withHeaders(['Authorization' => 'Bearer '.$rektoratToken, 'Accept' => 'application/json'])
            ->getJson('/api/kegiatan/'.$kegiatan->kegiatan_id)->assertStatus(403);
    }

    public function test_api_bendahara_can_access_kegiatan_show_route()
    {
        $bendahara = User::factory()->create(['role_id' => 6]);
        $kak = $this->createApprovedKak($this->pengusul);
        $kegiatan = Kegiatan::create(['kak_id' => $kak->kak_id]);

        $bendaharaToken = $bendahara->createToken('test-token')->plainTextToken;

        $this->withHeaders(['Authorization' => 'Bearer '.$bendaharaToken, 'Accept' => 'application/json'])
            ->getJson('/api/kegiatan/'.$kegiatan->kegiatan_id)->assertStatus(200);
    }
}

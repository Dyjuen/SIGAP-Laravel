<?php

namespace Tests\Feature\Api;

use App\Mail\KAKWorkflowMail;
use App\Models\KAK;
use App\Models\KAKAnggaran;
use App\Models\KAKManfaat;
use App\Models\User;
use Database\Seeders\MasterDataSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class KakApiTest extends TestCase
{
    use RefreshDatabase;

    protected User $pengusul;

    protected User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(MasterDataSeeder::class);

        // Create Users with exact seeded role_ids
        $this->pengusul = User::factory()->create([
            'role_id' => 3,
            'username' => 'pengusul1',
        ]);

        $this->admin = User::factory()->create([
            'role_id' => 1,
            'username' => 'admin1',
        ]);
    }

    public function test_pengusul_can_list_own_kaks()
    {
        $kak = KAK::create([
            'nama_kegiatan' => 'Kegiatan Mandiri Pengusul',
            'deskripsi_kegiatan' => 'Deskripsi kegiatan mandiri pengusul.',
            'metode_pelaksanaan' => 'Metode pelaksanaan detail.',
            'tanggal_mulai' => now()->toDateString(),
            'tanggal_selesai' => now()->addDays(5)->toDateString(),
            'kurun_waktu_pelaksanaan' => '6 Hari',
            'lokasi' => 'Gedung Serba Guna PNJ',
            'tipe_kegiatan_id' => 1,
            'sasaran_utama' => 'Mahasiswa Baru',
            'pengusul_user_id' => $this->pengusul->user_id,
            'status_id' => 1,
        ]);

        // Other pengusul's KAK
        $otherPengusul = User::factory()->create(['role_id' => 3]);
        KAK::create([
            'nama_kegiatan' => 'Kegiatan Orang Lain',
            'deskripsi_kegiatan' => 'Deskripsi kegiatan orang lain.',
            'metode_pelaksanaan' => 'Metode pelaksanaan.',
            'tanggal_mulai' => now()->toDateString(),
            'tanggal_selesai' => now()->addDays(2)->toDateString(),
            'kurun_waktu_pelaksanaan' => '3 Hari',
            'lokasi' => 'Jurusan TI',
            'tipe_kegiatan_id' => 1,
            'sasaran_utama' => 'Mahasiswa TI',
            'pengusul_user_id' => $otherPengusul->user_id,
            'status_id' => 1,
        ]);

        $response = $this->actingAs($this->pengusul, 'sanctum')
            ->getJson('/api/kak');

        $response->assertStatus(200);
        $response->assertJsonCount(1, 'data');
        $response->assertJsonFragment([
            'nama_kegiatan' => 'Kegiatan Mandiri Pengusul',
        ]);
    }

    public function test_pengusul_dashboard_stats()
    {
        KAK::create([
            'nama_kegiatan' => 'Kegiatan Draft',
            'deskripsi_kegiatan' => 'Deskripsi kegiatan draft.',
            'metode_pelaksanaan' => 'Metode pelaksanaan.',
            'tanggal_mulai' => now()->toDateString(),
            'tanggal_selesai' => now()->addDays(2)->toDateString(),
            'kurun_waktu_pelaksanaan' => '3 Hari',
            'lokasi' => 'Ruang Kelas',
            'tipe_kegiatan_id' => 1,
            'sasaran_utama' => 'Umum',
            'pengusul_user_id' => $this->pengusul->user_id,
            'status_id' => 1,
        ]);

        $response = $this->actingAs($this->pengusul, 'sanctum')
            ->getJson('/api/pengusul/stats');

        $response->assertStatus(200);
        $response->assertJson([
            'total_kak' => 1,
            'draft_kak' => 1,
            'review_kak' => 0,
            'approved_kak' => 0,
        ]);
    }

    public function test_pengusul_can_store_kak_with_nesting()
    {
        $response = $this->actingAs($this->pengusul, 'sanctum')
            ->postJson('/api/kak', [
                'nama_kegiatan' => 'Workshop UI/UX Pemula',
                'deskripsi_kegiatan' => 'Belajar desain antarmuka mobile and web.',
                'metode_pelaksanaan' => 'Pelatihan langsung and mentoring online.',
                'tanggal_mulai' => now()->addDays(1)->toDateString(),
                'tanggal_selesai' => now()->addDays(4)->toDateString(),
                'lokasi' => 'Lab Komputer 3',
                'tipe_kegiatan_id' => 1,
                'sasaran_utama' => 'Mahasiswa Tingkat Akhir',
                'output_kegiatan' => 'Sertifikat dan Portofolio',
                'manfaat' => [
                    ['value' => 'Meningkatkan skill UI/UX'],
                    ['value' => 'Mempersiapkan portofolio kerja'],
                ],
                'tahapan' => [
                    ['nama_tahapan' => 'Persiapan Lab and Software'],
                    ['nama_tahapan' => 'Penyampaian Teori Dasar'],
                ],
                'rab' => [
                    [
                        'uraian' => 'Honor Narasumber Utama',
                        'volume1' => 2,
                        'harga_satuan' => 500000,
                        'kategori_belanja_id' => 1,
                    ],
                ],
            ]);

        $response->assertStatus(201);
        $response->assertJsonStructure(['message', 'kak_id']);

        $this->assertDatabaseHas('t_kak', [
            'nama_kegiatan' => 'Workshop UI/UX Pemula',
            'pengusul_user_id' => $this->pengusul->user_id,
            'status_id' => 1,
        ]);
    }

    public function test_pengusul_can_submit_kak_to_review()
    {
        $kak = KAK::create([
            'nama_kegiatan' => 'Kegiatan Untuk Diajukan',
            'deskripsi_kegiatan' => 'Deskripsi.',
            'metode_pelaksanaan' => 'Metode.',
            'tanggal_mulai' => now()->toDateString(),
            'tanggal_selesai' => now()->addDays(2)->toDateString(),
            'kurun_waktu_pelaksanaan' => '3 Hari',
            'lokasi' => 'Aula PNJ',
            'tipe_kegiatan_id' => 1,
            'sasaran_utama' => 'Tendik',
            'pengusul_user_id' => $this->pengusul->user_id,
            'status_id' => 1, // Draft
        ]);

        $response = $this->actingAs($this->pengusul, 'sanctum')
            ->postJson("/api/kak/{$kak->kak_id}/submit");

        $response->assertStatus(200);
        $this->assertDatabaseHas('t_kak', [
            'kak_id' => $kak->kak_id,
            'status_id' => 2, // Review Verifikator
        ]);
    }

    public function test_pengusul_can_delete_draft_kak()
    {
        $kak = KAK::create([
            'nama_kegiatan' => 'Kegiatan Untuk Dihapus',
            'deskripsi_kegiatan' => 'Deskripsi.',
            'metode_pelaksanaan' => 'Metode.',
            'tanggal_mulai' => now()->toDateString(),
            'tanggal_selesai' => now()->addDays(2)->toDateString(),
            'kurun_waktu_pelaksanaan' => '3 Hari',
            'lokasi' => 'Aula PNJ',
            'tipe_kegiatan_id' => 1,
            'sasaran_utama' => 'Tendik',
            'pengusul_user_id' => $this->pengusul->user_id,
            'status_id' => 1, // Draft
        ]);

        $response = $this->actingAs($this->pengusul, 'sanctum')
            ->deleteJson("/api/kak/{$kak->kak_id}");

        $response->assertStatus(200);
        $this->assertDatabaseMissing('t_kak', [
            'kak_id' => $kak->kak_id,
        ]);
    }

    public function test_verifikator_can_request_revision()
    {
        $verifikator = User::factory()->create([
            'role_id' => 2,
            'username' => 'verifikator1',
        ]);
        $kak = KAK::create([
            'nama_kegiatan' => 'Kegiatan Untuk Direvisi',
            'deskripsi_kegiatan' => 'Deskripsi.',
            'metode_pelaksanaan' => 'Metode.',
            'tanggal_mulai' => now()->toDateString(),
            'tanggal_selesai' => now()->addDays(2)->toDateString(),
            'kurun_waktu_pelaksanaan' => '3 Hari',
            'lokasi' => 'Aula PNJ',
            'tipe_kegiatan_id' => 1,
            'sasaran_utama' => 'Tendik',
            'pengusul_user_id' => $this->pengusul->user_id,
            'status_id' => 2, // Review Verifikator
        ]);

        $response = $this->actingAs($verifikator, 'sanctum')
            ->postJson("/api/kak/{$kak->kak_id}/revise", [
                'catatan' => 'Perbaiki RAB',
            ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('t_kak', [
            'kak_id' => $kak->kak_id,
            'status_id' => 5, // Revisi
        ]);
    }

    public function test_pengusul_can_resubmit_revised_kak()
    {
        $kak = KAK::create([
            'nama_kegiatan' => 'Kegiatan Untuk Diajukan Kembali',
            'deskripsi_kegiatan' => 'Deskripsi.',
            'metode_pelaksanaan' => 'Metode.',
            'tanggal_mulai' => now()->toDateString(),
            'tanggal_selesai' => now()->addDays(2)->toDateString(),
            'kurun_waktu_pelaksanaan' => '3 Hari',
            'lokasi' => 'Aula PNJ',
            'tipe_kegiatan_id' => 1,
            'sasaran_utama' => 'Tendik',
            'pengusul_user_id' => $this->pengusul->user_id,
            'status_id' => 5, // Revisi
        ]);

        $response = $this->actingAs($this->pengusul, 'sanctum')
            ->postJson("/api/kak/{$kak->kak_id}/resubmit");

        $response->assertStatus(200);
        $this->assertDatabaseHas('t_kak', [
            'kak_id' => $kak->kak_id,
            'status_id' => 2, // Review Verifikator
        ]);
    }

    public function test_api_pengusul_cannot_submit_approved_kak()
    {
        $kak = KAK::create([
            'nama_kegiatan' => 'Approved KAK',
            'deskripsi_kegiatan' => 'Deskripsi.',
            'metode_pelaksanaan' => 'Metode.',
            'tanggal_mulai' => now()->toDateString(),
            'tanggal_selesai' => now()->addDays(2)->toDateString(),
            'kurun_waktu_pelaksanaan' => '3 Hari',
            'lokasi' => 'Aula PNJ',
            'tipe_kegiatan_id' => 1,
            'sasaran_utama' => 'Tendik',
            'pengusul_user_id' => $this->pengusul->user_id,
            'status_id' => 3, // Approved
        ]);

        $response = $this->actingAs($this->pengusul, 'sanctum')
            ->postJson("/api/kak/{$kak->kak_id}/submit");

        $response->assertStatus(422);
    }

    public function test_api_pengusul_cannot_submit_rejected_kak()
    {
        $kak = KAK::create([
            'nama_kegiatan' => 'Rejected KAK',
            'deskripsi_kegiatan' => 'Deskripsi.',
            'metode_pelaksanaan' => 'Metode.',
            'tanggal_mulai' => now()->toDateString(),
            'tanggal_selesai' => now()->addDays(2)->toDateString(),
            'kurun_waktu_pelaksanaan' => '3 Hari',
            'lokasi' => 'Aula PNJ',
            'tipe_kegiatan_id' => 1,
            'sasaran_utama' => 'Tendik',
            'pengusul_user_id' => $this->pengusul->user_id,
            'status_id' => 4, // Rejected
        ]);

        $response = $this->actingAs($this->pengusul, 'sanctum')
            ->postJson("/api/kak/{$kak->kak_id}/submit");

        $response->assertStatus(422);
    }

    public function test_api_verifikator_can_approve_kak()
    {
        $verifikator = User::factory()->create(['role_id' => 2, 'username' => 'verifikator1']);
        $kak = KAK::create([
            'nama_kegiatan' => 'To Approve',
            'deskripsi_kegiatan' => 'Deskripsi.',
            'metode_pelaksanaan' => 'Metode.',
            'tanggal_mulai' => now()->toDateString(),
            'tanggal_selesai' => now()->addDays(2)->toDateString(),
            'kurun_waktu_pelaksanaan' => '3 Hari',
            'lokasi' => 'Aula PNJ',
            'tipe_kegiatan_id' => 1,
            'sasaran_utama' => 'Tendik',
            'pengusul_user_id' => $this->pengusul->user_id,
            'status_id' => 2, // Review Verifikator
        ]);

        $response = $this->actingAs($verifikator, 'sanctum')
            ->postJson("/api/kak/{$kak->kak_id}/approve", [
                'kode_anggaran' => 'NEW-MAK-2026',
                'nama_sumber_dana' => 'Dana Baru',
                'tahun_anggaran' => 2026,
                'total_pagu' => 1000000000,
            ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('t_kak', ['kak_id' => $kak->kak_id, 'status_id' => 3]);
        $this->assertDatabaseHas('m_mata_anggaran', ['kode_anggaran' => 'NEW-MAK-2026']);
    }

    public function test_api_verifikator_cannot_approve_own_kak()
    {
        $verifikator = User::factory()->create(['role_id' => 2, 'username' => 'verifikator1']);
        $kak = KAK::create([
            'nama_kegiatan' => 'Own KAK',
            'deskripsi_kegiatan' => 'Deskripsi.',
            'metode_pelaksanaan' => 'Metode.',
            'tanggal_mulai' => now()->toDateString(),
            'tanggal_selesai' => now()->addDays(2)->toDateString(),
            'kurun_waktu_pelaksanaan' => '3 Hari',
            'lokasi' => 'Aula PNJ',
            'tipe_kegiatan_id' => 1,
            'sasaran_utama' => 'Tendik',
            'pengusul_user_id' => $verifikator->user_id, // Own
            'status_id' => 2, // Review Verifikator
        ]);

        $response = $this->actingAs($verifikator, 'sanctum')
            ->postJson("/api/kak/{$kak->kak_id}/approve", [
                'kode_anggaran' => 'MAK-X',
                'nama_sumber_dana' => 'X',
                'tahun_anggaran' => 2026,
                'total_pagu' => 0,
            ]);

        $response->assertStatus(403);
    }

    public function test_api_verifikator_can_reject_kak()
    {
        $verifikator = User::factory()->create(['role_id' => 2, 'username' => 'verifikator1']);
        $kak = KAK::create([
            'nama_kegiatan' => 'To Reject',
            'deskripsi_kegiatan' => 'Deskripsi.',
            'metode_pelaksanaan' => 'Metode.',
            'tanggal_mulai' => now()->toDateString(),
            'tanggal_selesai' => now()->addDays(2)->toDateString(),
            'kurun_waktu_pelaksanaan' => '3 Hari',
            'lokasi' => 'Aula PNJ',
            'tipe_kegiatan_id' => 1,
            'sasaran_utama' => 'Tendik',
            'pengusul_user_id' => $this->pengusul->user_id,
            'status_id' => 2,
        ]);

        $response = $this->actingAs($verifikator, 'sanctum')
            ->postJson("/api/kak/{$kak->kak_id}/reject", [
                'catatan' => 'Rejected reason api',
            ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('t_kak', ['kak_id' => $kak->kak_id, 'status_id' => 4]);
    }

    public function test_api_verifikator_cannot_reject_without_catatan()
    {
        $verifikator = User::factory()->create(['role_id' => 2, 'username' => 'verifikator1']);
        $kak = KAK::create([
            'nama_kegiatan' => 'To Reject',
            'deskripsi_kegiatan' => 'Deskripsi.',
            'metode_pelaksanaan' => 'Metode.',
            'tanggal_mulai' => now()->toDateString(),
            'tanggal_selesai' => now()->addDays(2)->toDateString(),
            'kurun_waktu_pelaksanaan' => '3 Hari',
            'lokasi' => 'Aula PNJ',
            'tipe_kegiatan_id' => 1,
            'sasaran_utama' => 'Tendik',
            'pengusul_user_id' => $this->pengusul->user_id,
            'status_id' => 2,
        ]);

        $response = $this->actingAs($verifikator, 'sanctum')
            ->postJson("/api/kak/{$kak->kak_id}/reject", [
                'catatan' => '',
            ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['catatan']);
    }

    public function test_api_verifikator_can_request_revision_with_nested_notes()
    {
        $verifikator = User::factory()->create(['role_id' => 2, 'username' => 'verifikator1']);
        $kak = KAK::create([
            'nama_kegiatan' => 'To Revise',
            'deskripsi_kegiatan' => 'Deskripsi.',
            'metode_pelaksanaan' => 'Metode.',
            'tanggal_mulai' => now()->toDateString(),
            'tanggal_selesai' => now()->addDays(2)->toDateString(),
            'kurun_waktu_pelaksanaan' => '3 Hari',
            'lokasi' => 'Aula PNJ',
            'tipe_kegiatan_id' => 1,
            'sasaran_utama' => 'Tendik',
            'pengusul_user_id' => $this->pengusul->user_id,
            'status_id' => 2,
        ]);

        $anggaran = KAKAnggaran::create([
            'kak_id' => $kak->kak_id,
            'kategori_belanja_id' => 1,
            'uraian' => 'Test Uraian',
        ]);
        $manfaat = KAKManfaat::create([
            'kak_id' => $kak->kak_id,
            'manfaat' => 'Test Manfaat',
        ]);

        $response = $this->actingAs($verifikator, 'sanctum')
            ->postJson("/api/kak/{$kak->kak_id}/revise", [
                'catatan' => 'General revision note',
                'catatan_kak' => [
                    'nama_kegiatan' => 'Fix Name',
                    'deskripsi_kegiatan' => 'Fix Desc',
                ],
                'anak' => [
                    't_kak_anggaran' => [
                        ['id' => $anggaran->anggaran_id, 'catatan_verifikator' => 'RAB terlalu mahal'],
                    ],
                    't_kak_manfaat' => [
                        ['id' => $manfaat->manfaat_id, 'catatan_manfaat' => 'Manfaat kurang jelas'],
                    ],
                ],
            ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('t_kak', ['kak_id' => $kak->kak_id, 'status_id' => 5]);
        $this->assertDatabaseHas('t_kak', ['kak_id' => $kak->kak_id, 'catatan_nama_kegiatan' => 'Fix Name']);
        $this->assertDatabaseHas('t_kak_anggaran', ['anggaran_id' => $anggaran->anggaran_id, 'catatan_verifikator' => 'RAB terlalu mahal']);
    }

    public function test_api_approve_clears_catatan_fields()
    {
        $verifikator = User::factory()->create(['role_id' => 2, 'username' => 'verifikator1']);
        $kak = KAK::create([
            'nama_kegiatan' => 'To Approve Clear',
            'deskripsi_kegiatan' => 'Deskripsi.',
            'metode_pelaksanaan' => 'Metode.',
            'tanggal_mulai' => now()->toDateString(),
            'tanggal_selesai' => now()->addDays(2)->toDateString(),
            'kurun_waktu_pelaksanaan' => '3 Hari',
            'lokasi' => 'Aula PNJ',
            'tipe_kegiatan_id' => 1,
            'sasaran_utama' => 'Tendik',
            'pengusul_user_id' => $this->pengusul->user_id,
            'status_id' => 2,
            'catatan_nama_kegiatan' => 'Old Note to Clear',
        ]);

        $response = $this->actingAs($verifikator, 'sanctum')
            ->postJson("/api/kak/{$kak->kak_id}/approve", [
                'kode_anggaran' => 'MAK-CLEAR',
                'nama_sumber_dana' => 'Clear Source',
                'tahun_anggaran' => 2026,
                'total_pagu' => 100000,
            ]);

        $response->assertStatus(200);
        $this->assertNull($kak->fresh()->catatan_nama_kegiatan);
    }

    public function test_api_concurrent_submit_and_approve_prevented()
    {
        $verifikator = User::factory()->create(['role_id' => 2, 'username' => 'verifikator1']);
        $kak = KAK::create([
            'nama_kegiatan' => 'Concurrent Check',
            'deskripsi_kegiatan' => 'Deskripsi.',
            'metode_pelaksanaan' => 'Metode.',
            'tanggal_mulai' => now()->toDateString(),
            'tanggal_selesai' => now()->addDays(2)->toDateString(),
            'kurun_waktu_pelaksanaan' => '3 Hari',
            'lokasi' => 'Aula PNJ',
            'tipe_kegiatan_id' => 1,
            'sasaran_utama' => 'Tendik',
            'pengusul_user_id' => $this->pengusul->user_id,
            'status_id' => 1, // Draft
        ]);

        $response = $this->actingAs($verifikator, 'sanctum')
            ->postJson("/api/kak/{$kak->kak_id}/approve", [
                'kode_anggaran' => 'X',
                'nama_sumber_dana' => 'X',
                'tahun_anggaran' => 2026,
                'total_pagu' => 0,
            ]);

        $response->assertStatus(422);
    }

    public function test_api_workflow_creates_log_entry_on_every_transition()
    {
        $verifikator = User::factory()->create(['role_id' => 2, 'username' => 'verifikator1']);
        $kak = KAK::create([
            'nama_kegiatan' => 'Log Test',
            'deskripsi_kegiatan' => 'Deskripsi.',
            'metode_pelaksanaan' => 'Metode.',
            'tanggal_mulai' => now()->toDateString(),
            'tanggal_selesai' => now()->addDays(2)->toDateString(),
            'kurun_waktu_pelaksanaan' => '3 Hari',
            'lokasi' => 'Aula PNJ',
            'tipe_kegiatan_id' => 1,
            'sasaran_utama' => 'Tendik',
            'pengusul_user_id' => $this->pengusul->user_id,
            'status_id' => 2,
        ]);

        $this->actingAs($verifikator, 'sanctum')
            ->postJson("/api/kak/{$kak->kak_id}/reject", ['catatan' => 'Reason api']);

        $this->assertDatabaseHas('t_kak_log_status', [
            'kak_id' => $kak->kak_id,
            'status_id_lama' => 2,
            'status_id_baru' => 4,
            'actor_user_id' => $verifikator->user_id,
        ]);
    }

    public function test_api_verifikator_cannot_access_mismatched_tipe_kaks()
    {
        $verifikator = User::factory()->create(['role_id' => 2, 'username' => 'verifikator1']); // Tipe 1
        $kak = KAK::create([
            'nama_kegiatan' => 'Mismatched Tipe KAK',
            'deskripsi_kegiatan' => 'Deskripsi.',
            'metode_pelaksanaan' => 'Metode.',
            'tanggal_mulai' => now()->toDateString(),
            'tanggal_selesai' => now()->addDays(2)->toDateString(),
            'kurun_waktu_pelaksanaan' => '3 Hari',
            'lokasi' => 'Aula PNJ',
            'tipe_kegiatan_id' => 2, // Tipe 2
            'sasaran_utama' => 'Tendik',
            'pengusul_user_id' => $this->pengusul->user_id,
            'status_id' => 2,
        ]);

        $response = $this->actingAs($verifikator, 'sanctum')
            ->postJson("/api/kak/{$kak->kak_id}/approve", [
                'kode_anggaran' => 'X',
                'nama_sumber_dana' => 'X',
                'tahun_anggaran' => 2026,
                'total_pagu' => 0,
            ]);

        $response->assertStatus(403);
    }

    public function test_api_pengusul_cannot_access_others_kaks()
    {
        $otherPengusul = User::factory()->create(['role_id' => 3]);
        $kak = KAK::create([
            'nama_kegiatan' => 'Other Pengusul KAK',
            'deskripsi_kegiatan' => 'Deskripsi.',
            'metode_pelaksanaan' => 'Metode.',
            'tanggal_mulai' => now()->toDateString(),
            'tanggal_selesai' => now()->addDays(2)->toDateString(),
            'kurun_waktu_pelaksanaan' => '3 Hari',
            'lokasi' => 'Aula PNJ',
            'tipe_kegiatan_id' => 1,
            'sasaran_utama' => 'Tendik',
            'pengusul_user_id' => $otherPengusul->user_id,
            'status_id' => 1,
        ]);

        $response = $this->actingAs($this->pengusul, 'sanctum')
            ->getJson("/api/kak/{$kak->kak_id}");

        $response->assertStatus(403);
    }

    public function test_api_verifikator_cannot_create_update_delete_kaks()
    {
        $verifikator = User::factory()->create(['role_id' => 2, 'username' => 'verifikator1']);
        $kak = KAK::create([
            'nama_kegiatan' => 'To Edit',
            'deskripsi_kegiatan' => 'Deskripsi.',
            'metode_pelaksanaan' => 'Metode.',
            'tanggal_mulai' => now()->toDateString(),
            'tanggal_selesai' => now()->addDays(2)->toDateString(),
            'kurun_waktu_pelaksanaan' => '3 Hari',
            'lokasi' => 'Aula PNJ',
            'tipe_kegiatan_id' => 1,
            'sasaran_utama' => 'Tendik',
            'pengusul_user_id' => $this->pengusul->user_id,
            'status_id' => 1,
        ]);

        // Create
        $this->actingAs($verifikator, 'sanctum')
            ->postJson('/api/kak', ['nama_kegiatan' => 'New KAK'])
            ->assertStatus(403);

        // Update
        $this->actingAs($verifikator, 'sanctum')
            ->putJson("/api/kak/{$kak->kak_id}", ['nama_kegiatan' => 'Update'])
            ->assertStatus(403);

        // Delete
        $this->actingAs($verifikator, 'sanctum')
            ->deleteJson("/api/kak/{$kak->kak_id}")
            ->assertStatus(403);
    }

    public function test_api_pengusul_cannot_approve_reject_revise()
    {
        $kak = KAK::create([
            'nama_kegiatan' => 'To Moderate',
            'deskripsi_kegiatan' => 'Deskripsi.',
            'metode_pelaksanaan' => 'Metode.',
            'tanggal_mulai' => now()->toDateString(),
            'tanggal_selesai' => now()->addDays(2)->toDateString(),
            'kurun_waktu_pelaksanaan' => '3 Hari',
            'lokasi' => 'Aula PNJ',
            'tipe_kegiatan_id' => 1,
            'sasaran_utama' => 'Tendik',
            'pengusul_user_id' => $this->pengusul->user_id,
            'status_id' => 2,
        ]);

        $this->actingAs($this->pengusul, 'sanctum')
            ->postJson("/api/kak/{$kak->kak_id}/approve")
            ->assertStatus(403);

        $this->actingAs($this->pengusul, 'sanctum')
            ->postJson("/api/kak/{$kak->kak_id}/reject", ['catatan' => 'No'])
            ->assertStatus(403);

        $this->actingAs($this->pengusul, 'sanctum')
            ->postJson("/api/kak/{$kak->kak_id}/revise", ['catatan' => 'Yes'])
            ->assertStatus(403);
    }

    public function test_api_admin_can_access_any_kak()
    {
        $kak = KAK::create([
            'nama_kegiatan' => 'Secret Admin KAK',
            'deskripsi_kegiatan' => 'Deskripsi.',
            'metode_pelaksanaan' => 'Metode.',
            'tanggal_mulai' => now()->toDateString(),
            'tanggal_selesai' => now()->addDays(2)->toDateString(),
            'kurun_waktu_pelaksanaan' => '3 Hari',
            'lokasi' => 'Aula PNJ',
            'tipe_kegiatan_id' => 1,
            'sasaran_utama' => 'Tendik',
            'pengusul_user_id' => $this->pengusul->user_id,
            'status_id' => 1,
        ]);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson("/api/kak/{$kak->kak_id}");

        $response->assertStatus(200);
        $response->assertJsonFragment(['nama_kegiatan' => 'Secret Admin KAK']);
    }

    public function test_api_workflow_triggers_notifications_and_emails()
    {
        Mail::fake();
        $verifikator = User::factory()->create(['role_id' => 2, 'username' => 'verifikator1', 'email' => 'verif@pnj.ac.id']);

        $kak = KAK::create([
            'nama_kegiatan' => 'Notify KAK',
            'deskripsi_kegiatan' => 'Deskripsi.',
            'metode_pelaksanaan' => 'Metode.',
            'tanggal_mulai' => now()->toDateString(),
            'tanggal_selesai' => now()->addDays(2)->toDateString(),
            'kurun_waktu_pelaksanaan' => '3 Hari',
            'lokasi' => 'Aula PNJ',
            'tipe_kegiatan_id' => 1,
            'sasaran_utama' => 'Tendik',
            'pengusul_user_id' => $this->pengusul->user_id,
            'status_id' => 1,
        ]);

        // Submit triggers email & notification to verifikator
        $response = $this->actingAs($this->pengusul, 'sanctum')
            ->postJson("/api/kak/{$kak->kak_id}/submit");

        $response->assertStatus(200);
        Mail::assertQueued(KAKWorkflowMail::class);
        $this->assertDatabaseHas('t_notifikasi', [
            'penerima_user_id' => $verifikator->user_id,
            'is_read' => 0,
        ]);
    }

    public function test_api_verifikator_can_approve_kak_with_mata_anggaran()
    {
        $verifikator = User::factory()->create(['role_id' => 2, 'username' => 'verifikator1']);
        $kak = KAK::create([
            'nama_kegiatan' => 'Approve with Mata Anggaran',
            'deskripsi_kegiatan' => 'Deskripsi.',
            'metode_pelaksanaan' => 'Metode.',
            'tanggal_mulai' => now()->toDateString(),
            'tanggal_selesai' => now()->addDays(2)->toDateString(),
            'kurun_waktu_pelaksanaan' => '3 Hari',
            'lokasi' => 'Aula PNJ',
            'tipe_kegiatan_id' => 1,
            'sasaran_utama' => 'Tendik',
            'pengusul_user_id' => $this->pengusul->user_id,
            'status_id' => 2, // Review Verifikator
        ]);

        $response = $this->actingAs($verifikator, 'sanctum')
            ->postJson("/api/kak/{$kak->kak_id}/approve", [
                'mata_anggaran_id' => 1,
            ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('t_kak', [
            'kak_id' => $kak->kak_id,
            'status_id' => 3, // Disetujui Verifikator
            'mata_anggaran_id' => 1,
        ]);
    }

    public function test_api_verifikator_cannot_approve_without_budget_data()
    {
        $verifikator = User::factory()->create(['role_id' => 2, 'username' => 'verifikator1']);
        $kak = KAK::create([
            'nama_kegiatan' => 'Approve with No Budget',
            'deskripsi_kegiatan' => 'Deskripsi.',
            'metode_pelaksanaan' => 'Metode.',
            'tanggal_mulai' => now()->toDateString(),
            'tanggal_selesai' => now()->addDays(2)->toDateString(),
            'kurun_waktu_pelaksanaan' => '3 Hari',
            'lokasi' => 'Aula PNJ',
            'tipe_kegiatan_id' => 1,
            'sasaran_utama' => 'Tendik',
            'pengusul_user_id' => $this->pengusul->user_id,
            'status_id' => 2,
        ]);

        $response = $this->actingAs($verifikator, 'sanctum')
            ->postJson("/api/kak/{$kak->kak_id}/approve", []);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['kode_anggaran']);
    }

    public function test_api_verifikator_cannot_reject_with_short_catatan()
    {
        $verifikator = User::factory()->create(['role_id' => 2, 'username' => 'verifikator1']);
        $kak = KAK::create([
            'nama_kegiatan' => 'To Reject Short Note',
            'deskripsi_kegiatan' => 'Deskripsi.',
            'metode_pelaksanaan' => 'Metode.',
            'tanggal_mulai' => now()->toDateString(),
            'tanggal_selesai' => now()->addDays(2)->toDateString(),
            'kurun_waktu_pelaksanaan' => '3 Hari',
            'lokasi' => 'Aula PNJ',
            'tipe_kegiatan_id' => 1,
            'sasaran_utama' => 'Tendik',
            'pengusul_user_id' => $this->pengusul->user_id,
            'status_id' => 2,
        ]);

        $response = $this->actingAs($verifikator, 'sanctum')
            ->postJson("/api/kak/{$kak->kak_id}/reject", [
                'catatan' => 'no', // < 5 chars
            ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['catatan']);
    }

    public function test_api_preview_pdf_blob()
    {
        $kak = KAK::create([
            'nama_kegiatan' => 'PDF Blob Test KAK',
            'deskripsi_kegiatan' => 'Deskripsi.',
            'metode_pelaksanaan' => 'Metode.',
            'tanggal_mulai' => now()->toDateString(),
            'tanggal_selesai' => now()->addDays(2)->toDateString(),
            'kurun_waktu_pelaksanaan' => '3 Hari',
            'lokasi' => 'Aula PNJ',
            'tipe_kegiatan_id' => 1,
            'sasaran_utama' => 'Tendik',
            'pengusul_user_id' => $this->pengusul->user_id,
            'status_id' => 1,
        ]);

        $response = $this->actingAs($this->pengusul, 'sanctum')
            ->getJson("/api/kak/{$kak->kak_id}/pdf/preview-blob");

        $response->assertStatus(200);
        $response->assertJsonStructure(['fileName', 'mimeType', 'base64']);
    }

    public function test_api_preview_pdf_with_bearer_token()
    {
        $kak = KAK::create([
            'nama_kegiatan' => 'PDF Preview Test KAK',
            'deskripsi_kegiatan' => 'Deskripsi.',
            'metode_pelaksanaan' => 'Metode.',
            'tanggal_mulai' => now()->toDateString(),
            'tanggal_selesai' => now()->addDays(2)->toDateString(),
            'kurun_waktu_pelaksanaan' => '3 Hari',
            'lokasi' => 'Aula PNJ',
            'tipe_kegiatan_id' => 1,
            'sasaran_utama' => 'Tendik',
            'pengusul_user_id' => $this->pengusul->user_id,
            'status_id' => 1,
        ]);

        $response = $this->actingAs($this->pengusul, 'sanctum')
            ->get("/api/kak/{$kak->kak_id}/pdf/preview");

        $response->assertStatus(200);
        $this->assertEquals('application/pdf', $response->headers->get('Content-Type'));
    }

    public function test_api_download_pdf_with_query_token()
    {
        $kak = KAK::create([
            'nama_kegiatan' => 'PDF Download Test KAK',
            'deskripsi_kegiatan' => 'Deskripsi.',
            'metode_pelaksanaan' => 'Metode.',
            'tanggal_mulai' => now()->toDateString(),
            'tanggal_selesai' => now()->addDays(2)->toDateString(),
            'kurun_waktu_pelaksanaan' => '3 Hari',
            'lokasi' => 'Aula PNJ',
            'tipe_kegiatan_id' => 1,
            'sasaran_utama' => 'Tendik',
            'pengusul_user_id' => $this->pengusul->user_id,
            'status_id' => 1,
        ]);

        // Generate personal access token
        $tokenResult = $this->pengusul->createToken('test-token');
        $token = $tokenResult->plainTextToken;

        $response = $this->get("/api/kak/{$kak->kak_id}/pdf/download?token={$token}");

        $response->assertStatus(200);
        $this->assertEquals('application/pdf', $response->headers->get('Content-Type'));
        $this->assertStringContainsString('attachment', $response->headers->get('Content-Disposition'));
    }

    public function test_api_pdf_unauthenticated()
    {
        $kak = KAK::create([
            'nama_kegiatan' => 'PDF Unauth KAK',
            'deskripsi_kegiatan' => 'Deskripsi.',
            'metode_pelaksanaan' => 'Metode.',
            'tanggal_mulai' => now()->toDateString(),
            'tanggal_selesai' => now()->addDays(2)->toDateString(),
            'kurun_waktu_pelaksanaan' => '3 Hari',
            'lokasi' => 'Aula PNJ',
            'tipe_kegiatan_id' => 1,
            'sasaran_utama' => 'Tendik',
            'pengusul_user_id' => $this->pengusul->user_id,
            'status_id' => 1,
        ]);

        $this->getJson("/api/kak/{$kak->kak_id}/pdf/preview-blob")
            ->assertStatus(401);
    }
}

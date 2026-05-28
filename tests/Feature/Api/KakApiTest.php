<?php

namespace Tests\Feature\Api;

use App\Models\User;
use App\Models\KAK;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class KakApiTest extends TestCase
{
    use RefreshDatabase;

    protected User $pengusul;
    protected User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        // Seed Roles using DB to bypass guarded attributes
        DB::table('m_roles')->insert([
            ['role_id' => 1, 'nama_role' => 'Admin'],
            ['role_id' => 2, 'nama_role' => 'Verifikator'],
            ['role_id' => 3, 'nama_role' => 'Pengusul'],
        ]);

        // Seed Tipe Kegiatan
        DB::table('m_tipe_kegiatan')->insert([
            ['tipe_kegiatan_id' => 1, 'nama_tipe' => 'Bidang 1 - Akademik'],
        ]);

        // Seed Status
        DB::table('m_kegiatan_status')->insert([
            ['status_id' => 1, 'nama_status' => 'Draft'],
            ['status_id' => 2, 'nama_status' => 'Review Verifikator'],
        ]);

        // Seed Kategori Belanja
        DB::table('m_kategori_belanja')->insert([
            [
                'kategori_belanja_id' => 1,
                'kode' => 'BRG',
                'nama' => 'Belanja Barang',
                'is_active' => true,
                'urutan' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        // Seed Satuan
        DB::table('m_satuan')->insert([
            ['satuan_id' => 1, 'nama_satuan' => 'OJ'],
        ]);

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
        $response->assertJsonCount(1);
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
}

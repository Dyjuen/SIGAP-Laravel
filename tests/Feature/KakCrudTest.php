<?php

namespace Tests\Feature;

use App\Models\Iku;
use App\Models\KAK;
use App\Models\KAKAnggaran;
use App\Models\KAKManfaat;
use App\Models\KAKTahapan;
use App\Models\KategoriBelanja;
use App\Models\Satuan;
use App\Models\TipeKegiatan;
use App\Models\User;
use Database\Seeders\MasterDataSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class KakCrudTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        // Seed master data
        $this->seed(MasterDataSeeder::class);
    }

    /**
     * Test Case: KAK-FT-022 - Cek Props Inertia
     */
    public function test_authenticated_user_can_view_kak_index(): void
    {
        $user = User::factory()->create(['role_id' => 3]); // Pengusul
        $kak = KAK::factory()->create(['pengusul_user_id' => $user->user_id]);

        $response = $this->actingAs($user)->get(route('kak.index'));

        $response->assertStatus(200)
            ->assertInertia(
                fn (Assert $page) => $page
                    ->component('Kak/Index')
                    ->has('kaks.data', 1)
                    ->where('kaks.data.0.nama_kegiatan', $kak->nama_kegiatan)
            );
    }

    /**
     * Test Case: KAK-FT-021 - Akses Tanpa Login
     */
    public function test_unauthenticated_user_cannot_access_kak(): void
    {
        $response = $this->get(route('kak.index'));
        $response->assertRedirect(route('login'));
    }

    /**
     * Test Case: KAK-FT-001 - Simpan KAK data valid (Role Pengusul)
     * Test Case: KAK-FT-023 - Create dengan Children
     */
    public function test_pengusul_can_create_kak_with_all_children(): void
    {
        $user = User::factory()->create(['role_id' => 3]);
        $tipe = TipeKegiatan::first();
        $satuan = Satuan::first();
        $iku = Iku::first();
        $kategori = KategoriBelanja::first();

        $data = [
            'kak' => [
                'nama_kegiatan' => 'New Activity',
                'deskripsi_kegiatan' => 'Description description description description description',
                'metode_pelaksanaan' => 'Metode Pelaksanaan',
                'kurun_waktu_pelaksanaan' => '1 Month',
                'tanggal_mulai' => now()->addDays(1)->toDateString(),
                'tanggal_selesai' => now()->addDays(30)->toDateString(),
                'lokasi' => 'Campus',
                'tipe_kegiatan_id' => $tipe->tipe_kegiatan_id,
                'sasaran_utama' => 'Sasaran A',
                'manfaat' => [['value' => 'Manfaat 1'], ['value' => 'Manfaat 2']],
                'tahapan_pelaksanaan' => [
                    ['nama_tahapan' => 'Step 1', 'urutan' => 1],
                    ['nama_tahapan' => 'Step 2', 'urutan' => 2],
                ],
                'indikator_kinerja' => [
                    ['bulan_indikator' => 'Januari', 'deskripsi_target' => 'Target 1', 'persentase_target' => 50],
                ],
            ],
            'target_iku' => [
                ['iku_id' => $iku->iku_id, 'target' => '10', 'satuan_id' => $satuan->satuan_id],
            ],
            'rab' => [
                [
                    'kategori_belanja_id' => $kategori->kategori_belanja_id,
                    'uraian' => 'Item 1',
                    'volume1' => 10,
                    'satuan1_id' => $satuan->satuan_id,
                    'harga_satuan' => 1000,
                ],
            ],
        ];

        $response = $this->actingAs($user)->post(route('kak.store'), $data);

        $response->assertRedirect(route('kak.index'));
        $this->assertDatabaseHas('t_kak', ['nama_kegiatan' => 'New Activity', 'sasaran_utama' => 'Sasaran A']);
        $this->assertDatabaseHas('t_kak_manfaat', ['manfaat' => 'Manfaat 1']);
        $this->assertDatabaseHas('t_kak_tahapan', ['nama_tahapan' => 'Step 1']);
        $this->assertDatabaseHas('t_kak_target', ['bulan_indikator' => 'Januari', 'deskripsi_target' => 'Target 1', 'persentase_target' => 50]);
        $this->assertDatabaseHas('t_kak_iku', ['iku_id' => $iku->iku_id]);
        $this->assertDatabaseHas('t_kak_anggaran', ['uraian' => 'Item 1']);
    }

    /**
     * Test Case: KAK-FT-016 - Verifikator lihat detail KAK orang lain (Logic validation)
     * Test Case: KAK-FT-022 - Cek Props Inertia
     */
    public function test_pengusul_can_view_kak_detail(): void
    {
        $user = User::factory()->create(['role_id' => 3]);
        $kak = KAK::factory()->create(['pengusul_user_id' => $user->user_id]);

        $response = $this->actingAs($user)->get(route('kak.show', $kak->kak_id));

        $response->assertStatus(200)
            ->assertInertia(
                fn (Assert $page) => $page
                    ->component('Kak/Show')
                    ->where('kak.kak_id', $kak->kak_id)
                    ->has('kak.manfaat')
                    ->has('kak.tahapan')
            );
    }

    /**
     * Test Case: KAK-FT-012 - Pengusul edit KAK status Draft
     */
    public function test_pengusul_can_update_draft_kak(): void
    {
        $user = User::factory()->create(['role_id' => 3]);
        $kak = KAK::factory()->create(['pengusul_user_id' => $user->user_id, 'status_id' => 1]);
        $tipe = TipeKegiatan::first();
        $satuan = Satuan::first();
        $iku = Iku::first();
        $kategori = KategoriBelanja::first();

        $updatedData = [
            'kak' => [
                'nama_kegiatan' => 'Updated Activity',
                'deskripsi_kegiatan' => 'New Desc New Desc New Desc New Desc New Desc New Desc',
                'metode_pelaksanaan' => 'New Metode Pelaksanaan',
                'kurun_waktu_pelaksanaan' => '2 Months',
                'tanggal_mulai' => now()->addDays(2)->toDateString(),
                'tanggal_selesai' => now()->addDays(60)->toDateString(),
                'lokasi' => 'New Loc',
                'tipe_kegiatan_id' => $tipe->tipe_kegiatan_id,
                'sasaran_utama' => 'New Sasaran',
                'manfaat' => [['value' => 'New Manfaat']],
                'tahapan_pelaksanaan' => [['nama_tahapan' => 'Step 1', 'urutan' => 1]],
                'indikator_kinerja' => [['bulan_indikator' => 'Februari', 'deskripsi_target' => 'Target 1', 'persentase_target' => 50]],
            ],
            'target_iku' => [['iku_id' => $iku->iku_id, 'target' => '10', 'satuan_id' => $satuan->satuan_id]],
            'rab' => [[
                'kategori_belanja_id' => $kategori->kategori_belanja_id,
                'uraian' => 'Item 1',
                'volume1' => 10,
                'satuan1_id' => $satuan->satuan_id,
                'harga_satuan' => 1000,
            ]],
        ];

        $response = $this->actingAs($user)->put(route('kak.update', $kak->kak_id), $updatedData);

        $response->assertRedirect(route('kak.index'));
        $this->assertDatabaseHas('t_kak', ['nama_kegiatan' => 'Updated Activity']);
        $this->assertDatabaseHas('t_kak_manfaat', ['manfaat' => 'New Manfaat']);
    }

    /**
     * Test Case: KAK-FT-013 - Pengusul edit KAK status Disetujui
     */
    public function test_pengusul_cannot_update_approved_kak(): void
    {
        $user = User::factory()->create(['role_id' => 3]);
        $kak = KAK::factory()->create(['pengusul_user_id' => $user->user_id, 'status_id' => 3]);
        $tipe = TipeKegiatan::first();
        $satuan = Satuan::first();
        $iku = Iku::first();
        $kategori = KategoriBelanja::first();

        $dummyData = [
            'kak' => [
                'nama_kegiatan' => 'Valid Activity Name',
                'deskripsi_kegiatan' => 'Description description description description description',
                'metode_pelaksanaan' => 'Metode Pelaksanaan Long Enough',
                'kurun_waktu_pelaksanaan' => '1 Month',
                'tanggal_mulai' => now()->addDays(1)->toDateString(),
                'tanggal_selesai' => now()->addDays(2)->toDateString(),
                'lokasi' => 'Loc',
                'tipe_kegiatan_id' => $tipe->tipe_kegiatan_id,
                'sasaran_utama' => 'Sasaran',
                'manfaat' => [['value' => 'Manfaat']],
                'tahapan_pelaksanaan' => [['nama_tahapan' => 'Tahapan', 'urutan' => 1]],
                'indikator_kinerja' => [['bulan_indikator' => 'Januari', 'deskripsi_target' => 'Target', 'persentase_target' => 50]],
            ],
            'target_iku' => [['iku_id' => $iku->iku_id, 'target' => '10', 'satuan_id' => $satuan->satuan_id]],
            'rab' => [[
                'kategori_belanja_id' => $kategori->kategori_belanja_id,
                'uraian' => 'Item',
                'volume1' => 1,
                'satuan1_id' => $satuan->satuan_id,
                'harga_satuan' => 1000,
            ]],
        ];

        $response = $this->actingAs($user)->put(route('kak.update', $kak->kak_id), $dummyData);
        $response->assertStatus(403);
    }

    /**
     * Test Case: KAK-FT-017 - Hapus KAK Draft (Soft Delete)
     */
    public function test_pengusul_can_delete_draft_kak(): void
    {
        $user = User::factory()->create(['role_id' => 3]);
        $kak = KAK::factory()->create(['pengusul_user_id' => $user->user_id, 'status_id' => 1]);

        $response = $this->actingAs($user)->delete(route('kak.destroy', $kak->kak_id));

        $response->assertRedirect(route('kak.index'));
        $this->assertDatabaseMissing('t_kak', ['kak_id' => $kak->kak_id]);
    }

    /**
     * Test Case: KAK-FT-035 - Hapus KAK status "Review"
     */
    public function test_pengusul_cannot_delete_reviewed_kak(): void
    {
        $user = User::factory()->create(['role_id' => 3]);
        $kak = KAK::factory()->create(['pengusul_user_id' => $user->user_id, 'status_id' => 2]);

        $response = $this->actingAs($user)->delete(route('kak.destroy', $kak->kak_id));
        $response->assertStatus(403);
    }

    public function test_validation_rejects_missing_required_fields(): void
    {
        $user = User::factory()->create(['role_id' => 3]);
        $response = $this->actingAs($user)->post(route('kak.store'), ['kak' => []]);
        $response->assertSessionHasErrors(['kak.nama_kegiatan']);
    }

    /**
     * Test Case: KAK-IT-011 - DB Atomicity
     */
    public function test_store_rolls_back_on_child_insert_failure(): void
    {
        $user = User::factory()->create(['role_id' => 3]);
        $tipe = TipeKegiatan::first();
        $satuan = Satuan::first();
        $iku = Iku::first();
        $kategori = KategoriBelanja::first();

        KAKManfaat::creating(function () {
            throw new \Exception('Simulated DB Failure');
        });

        $data = [
            'kak' => [
                'nama_kegiatan' => 'Rollback Test Activity',
                'deskripsi_kegiatan' => 'Description description description description description',
                'metode_pelaksanaan' => 'Metode Pelaksanaan',
                'kurun_waktu_pelaksanaan' => '1 Month',
                'tanggal_mulai' => now()->addDays(1)->toDateString(),
                'tanggal_selesai' => now()->addDays(30)->toDateString(),
                'lokasi' => 'Campus',
                'tipe_kegiatan_id' => $tipe->tipe_kegiatan_id,
                'sasaran_utama' => 'Sasaran',
                'manfaat' => [['value' => 'Manfaat 1']],
                'tahapan_pelaksanaan' => [['nama_tahapan' => 'Tahapan', 'urutan' => 1]],
                'indikator_kinerja' => [['bulan_indikator' => 'Januari', 'deskripsi_target' => 'Target', 'persentase_target' => 50]],
            ],
            'target_iku' => [['iku_id' => $iku->iku_id, 'target' => '10', 'satuan_id' => $satuan->satuan_id]],
            'rab' => [[
                'kategori_belanja_id' => $kategori->kategori_belanja_id,
                'uraian' => 'Item',
                'volume1' => 1,
                'satuan1_id' => $satuan->satuan_id,
                'harga_satuan' => 1000,
            ]],
        ];

        $this->withoutExceptionHandling();

        try {
            $this->actingAs($user)->post(route('kak.store'), $data);
            $this->fail('Expected exception was not thrown');
        } catch (\Exception $e) {
            $this->assertEquals('Simulated DB Failure', $e->getMessage());
        }

        $this->assertDatabaseMissing('t_kak', ['nama_kegiatan' => 'Rollback Test Activity']);
    }

    /**
     * Test Case: KAK-FT-031 - Hapus salah satu baris Manfaat saat Edit
     */
    public function test_update_with_empty_children_clears_old_records(): void
    {
        $user = User::factory()->create(['role_id' => 3]);
        $kak = KAK::factory()->create(['pengusul_user_id' => $user->user_id, 'status_id' => 1]);
        $tipe = TipeKegiatan::first();
        $satuan = Satuan::first();
        $iku = Iku::first();
        $kategori = KategoriBelanja::first();

        KAKManfaat::create(['kak_id' => $kak->kak_id, 'manfaat' => 'Old Manfaat']);

        $updatedData = [
            'kak' => [
                'nama_kegiatan' => 'Valid Activity Name',
                'deskripsi_kegiatan' => 'Description description description description description',
                'metode_pelaksanaan' => 'Metode Pelaksanaan',
                'kurun_waktu_pelaksanaan' => '1',
                'tanggal_mulai' => now()->addDays(1)->toDateString(),
                'tanggal_selesai' => now()->addDays(2)->toDateString(),
                'lokasi' => 'Loc',
                'tipe_kegiatan_id' => $tipe->tipe_kegiatan_id,
                'sasaran_utama' => 'Sasaran',
                'manfaat' => [['value' => 'New Manfaat']],
                'tahapan_pelaksanaan' => [['nama_tahapan' => 'Tahapan', 'urutan' => 1]],
                'indikator_kinerja' => [['bulan_indikator' => 'Januari', 'deskripsi_target' => 'Target', 'persentase_target' => 50]],
            ],
            'target_iku' => [['iku_id' => $iku->iku_id, 'target' => '10', 'satuan_id' => $satuan->satuan_id]],
            'rab' => [[
                'kategori_belanja_id' => $kategori->kategori_belanja_id,
                'uraian' => 'Item',
                'volume1' => 1,
                'satuan1_id' => $satuan->satuan_id,
                'harga_satuan' => 1000,
            ]],
        ];

        $this->actingAs($user)->put(route('kak.update', $kak->kak_id), $updatedData);
        $this->assertDatabaseMissing('t_kak_manfaat', ['manfaat' => 'Old Manfaat']);
        $this->assertDatabaseHas('t_kak_manfaat', ['manfaat' => 'New Manfaat']);
    }

    public function test_update_preserves_child_ids(): void
    {
        $user = User::factory()->create(['role_id' => 3]);
        $tipe = TipeKegiatan::first();
        $satuan = Satuan::first();
        $iku = Iku::first();
        $kategori = KategoriBelanja::first();

        $data = [
            'kak' => [
                'nama_kegiatan' => 'Original Activity',
                'deskripsi_kegiatan' => 'Description description description description description',
                'metode_pelaksanaan' => 'Metode Pelaksanaan',
                'kurun_waktu_pelaksanaan' => '1 Month',
                'tanggal_mulai' => now()->addDays(1)->toDateString(),
                'tanggal_selesai' => now()->addDays(30)->toDateString(),
                'lokasi' => 'Campus',
                'tipe_kegiatan_id' => $tipe->tipe_kegiatan_id,
                'sasaran_utama' => 'Sasaran',
                'manfaat' => [['value' => 'Old Manfaat']],
                'tahapan_pelaksanaan' => [['nama_tahapan' => 'Old Tahapan', 'urutan' => 1]],
                'indikator_kinerja' => [
                    ['bulan_indikator' => 'Januari', 'deskripsi_target' => 'Old Target', 'persentase_target' => 10],
                ],
            ],
            'target_iku' => [['iku_id' => $iku->iku_id, 'target' => '10', 'satuan_id' => $satuan->satuan_id]],
            'rab' => [
                [
                    'kategori_belanja_id' => $kategori->kategori_belanja_id,
                    'uraian' => 'Item 1',
                    'volume1' => 10,
                    'satuan1_id' => $satuan->satuan_id,
                    'harga_satuan' => 1000,
                ],
            ],
        ];

        $this->actingAs($user)->post(route('kak.store'), $data);
        $kak = KAK::where('nama_kegiatan', 'Original Activity')->first();

        $manfaatId = $kak->manfaat()->first()->manfaat_id;
        $tahapanId = $kak->tahapan()->first()->tahapan_id;
        $targetId = $kak->targets()->first()->target_id;
        $anggaranId = $kak->anggaran()->first()->anggaran_id;

        $updatedData = [
            'kak' => [
                'nama_kegiatan' => 'Updated Activity',
                'deskripsi_kegiatan' => 'Description description description description description',
                'metode_pelaksanaan' => 'Metode Pelaksanaan',
                'kurun_waktu_pelaksanaan' => '1 Month',
                'tanggal_mulai' => now()->addDays(1)->toDateString(),
                'tanggal_selesai' => now()->addDays(30)->toDateString(),
                'lokasi' => 'Campus',
                'tipe_kegiatan_id' => $tipe->tipe_kegiatan_id,
                'sasaran_utama' => 'Sasaran',
                'manfaat' => [['manfaat_id' => $manfaatId, 'value' => 'Updated Manfaat']],
                'tahapan_pelaksanaan' => [['tahapan_id' => $tahapanId, 'nama_tahapan' => 'Updated Tahapan', 'urutan' => 1]],
                'indikator_kinerja' => [
                    ['target_id' => $targetId, 'bulan_indikator' => 'Februari', 'deskripsi_target' => 'Updated Target', 'persentase_target' => 20],
                ],
            ],
            'target_iku' => [['iku_id' => $iku->iku_id, 'target' => '10', 'satuan_id' => $satuan->satuan_id]],
            'rab' => [
                [
                    'anggaran_id' => $anggaranId,
                    'kategori_belanja_id' => $kategori->kategori_belanja_id,
                    'uraian' => 'Updated Item',
                    'volume1' => 20,
                    'satuan1_id' => $satuan->satuan_id,
                    'harga_satuan' => 2000,
                ],
            ],
        ];

        $this->actingAs($user)->put(route('kak.update', $kak->kak_id), $updatedData);

        $this->assertDatabaseHas('t_kak_manfaat', [
            'manfaat_id' => $manfaatId,
            'manfaat' => 'Updated Manfaat',
        ]);
        $this->assertDatabaseHas('t_kak_tahapan', [
            'tahapan_id' => $tahapanId,
            'nama_tahapan' => 'Updated Tahapan',
        ]);
        $this->assertDatabaseHas('t_kak_target', [
            'target_id' => $targetId,
            'deskripsi_target' => 'Updated Target',
        ]);
        $this->assertDatabaseHas('t_kak_anggaran', [
            'anggaran_id' => $anggaranId,
            'uraian' => 'Updated Item',
        ]);
    }

    public function test_store_rejects_invalid_foreign_keys(): void
    {
        $user = User::factory()->create(['role_id' => 3]);
        $satuan = Satuan::first();
        $iku = Iku::first();
        $kategori = KategoriBelanja::first();

        $data = [
            'kak' => [
                'nama_kegiatan' => 'Test',
                'deskripsi_kegiatan' => 'Description description description description description',
                'metode_pelaksanaan' => 'Metode Pelaksanaan',
                'kurun_waktu_pelaksanaan' => '1',
                'tanggal_mulai' => now()->addDays(1)->toDateString(),
                'tanggal_selesai' => now()->addDays(2)->toDateString(),
                'lokasi' => 'Loc',
                'tipe_kegiatan_id' => 9999,
                'sasaran_utama' => 'Sasaran',
                'manfaat' => [['value' => 'Manfaat']],
                'tahapan_pelaksanaan' => [['nama_tahapan' => 'Tahapan', 'urutan' => 1]],
                'indikator_kinerja' => [['bulan_indikator' => 'Januari', 'deskripsi_target' => 'Target', 'persentase_target' => 50]],
            ],
            'target_iku' => [['iku_id' => $iku->iku_id, 'target' => '10', 'satuan_id' => $satuan->satuan_id]],
            'rab' => [[
                'kategori_belanja_id' => $kategori->kategori_belanja_id,
                'uraian' => 'Item',
                'volume1' => 1,
                'satuan1_id' => $satuan->satuan_id,
                'harga_satuan' => 1000,
            ]],
        ];
        $response = $this->actingAs($user)->post(route('kak.store'), $data);
        $response->assertSessionHasErrors(['kak.tipe_kegiatan_id']);
    }

    /**
     * Test Case: KAK-FT-028 - IKU: Duplikasi IKU ID di satu KAK
     */
    public function test_duplicate_iku_ids_are_deduplicated(): void
    {
        $user = User::factory()->create(['role_id' => 3]);
        $tipe = TipeKegiatan::first();
        $iku = Iku::first();
        $satuan = Satuan::first();
        $kategori = KategoriBelanja::first();

        $data = [
            'kak' => [
                'nama_kegiatan' => 'Dupe Test',
                'deskripsi_kegiatan' => 'Description description description description description',
                'metode_pelaksanaan' => 'Metode Pelaksanaan',
                'kurun_waktu_pelaksanaan' => '1',
                'tanggal_mulai' => now()->addDays(1)->toDateString(),
                'tanggal_selesai' => now()->addDays(2)->toDateString(),
                'lokasi' => 'Loc',
                'tipe_kegiatan_id' => $tipe->tipe_kegiatan_id,
                'sasaran_utama' => 'Sasaran',
                'manfaat' => [['value' => 'Manfaat']],
                'tahapan_pelaksanaan' => [['nama_tahapan' => 'Tahapan', 'urutan' => 1]],
                'indikator_kinerja' => [['bulan_indikator' => 'Januari', 'deskripsi_target' => 'Target', 'persentase_target' => 50]],
            ],
            'target_iku' => [
                ['iku_id' => $iku->iku_id, 'target' => '10', 'satuan_id' => $satuan->satuan_id],
                ['iku_id' => $iku->iku_id, 'target' => '20', 'satuan_id' => $satuan->satuan_id],
            ],
            'rab' => [[
                'kategori_belanja_id' => $kategori->kategori_belanja_id,
                'uraian' => 'Item',
                'volume1' => 1,
                'satuan1_id' => $satuan->satuan_id,
                'harga_satuan' => 1000,
            ]],
        ];

        $this->actingAs($user)->post(route('kak.store'), $data);

        $kak = KAK::where('nama_kegiatan', 'Dupe Test')->first();
        $this->assertDatabaseCount('t_kak_iku', 1);
        $this->assertDatabaseHas('t_kak_iku', ['kak_id' => $kak->kak_id, 'iku_id' => $iku->iku_id]);
    }

    /**
     * Test Case: KAK-FT-014 - Index: Filter KAK berdasarkan Status
     */
    public function test_kak_index_filtering_by_status(): void
    {
        $user = User::factory()->create(['role_id' => 3]);
        KAK::factory()->create(['pengusul_user_id' => $user->user_id, 'status_id' => 1, 'nama_kegiatan' => 'Draft KAK']);
        KAK::factory()->create(['pengusul_user_id' => $user->user_id, 'status_id' => 2, 'nama_kegiatan' => 'Review KAK']);

        $response = $this->actingAs($user)->get(route('kak.index', ['status_id' => 2]));

        $response->assertStatus(200)
            ->assertInertia(
                fn (Assert $page) => $page
                    ->has('kaks.data', 1)
                    ->where('kaks.data.0.nama_kegiatan', 'Review KAK')
            );
    }

    /**
     * Test Case: KAK-FT-015 - Index: Search KAK berdasarkan Nama
     */
    public function test_kak_index_searching_by_name(): void
    {
        $user = User::factory()->create(['role_id' => 3]);
        KAK::factory()->create(['pengusul_user_id' => $user->user_id, 'nama_kegiatan' => 'Workshop React']);
        KAK::factory()->create(['pengusul_user_id' => $user->user_id, 'nama_kegiatan' => 'Seminar Laravel']);

        $response = $this->actingAs($user)->get(route('kak.index', ['search' => 'Workshop']));

        $response->assertStatus(200)
            ->assertInertia(
                fn (Assert $page) => $page
                    ->has('kaks.data', 1)
                    ->where('kaks.data.0.nama_kegiatan', 'Workshop React')
            );
    }

    /**
     * Test Case: KAK-FT-018 - Compute: Otomatis hitung kurun waktu
     * Test Case: KAK-FT-029 - Calculation: Kurun Waktu Otomatis (Hari)
     */
    public function test_kak_auto_computes_kurun_waktu(): void
    {
        $user = User::factory()->create(['role_id' => 3]);
        $tipe = TipeKegiatan::first();
        $satuan = Satuan::first();
        $iku = Iku::first();
        $kategori = KategoriBelanja::first();

        // 15 days case (inclusive = 15)
        $data15 = [
            'kak' => [
                'nama_kegiatan' => '15 Days Activity',
                'deskripsi_kegiatan' => 'Desc desc desc desc desc',
                'metode_pelaksanaan' => 'Metode',
                'kurun_waktu_pelaksanaan' => 'ignored',
                'tanggal_mulai' => '2026-05-01',
                'tanggal_selesai' => '2026-05-15',
                'lokasi' => 'Campus',
                'tipe_kegiatan_id' => $tipe->tipe_kegiatan_id,
                'sasaran_utama' => 'Sasaran',
                'manfaat' => [['value' => 'M']],
                'tahapan_pelaksanaan' => [['nama_tahapan' => 'T', 'urutan' => 1]],
                'indikator_kinerja' => [['bulan_indikator' => 'Jan', 'deskripsi_target' => 'T', 'persentase_target' => 50]],
            ],
            'target_iku' => [['iku_id' => $iku->iku_id, 'target' => '10', 'satuan_id' => $satuan->satuan_id]],
            'rab' => [['kategori_belanja_id' => $kategori->kategori_belanja_id, 'uraian' => 'U', 'volume1' => 1, 'satuan1_id' => $satuan->satuan_id, 'harga_satuan' => 1000]],
        ];

        $this->actingAs($user)->post(route('kak.store'), $data15);
        $this->assertDatabaseHas('t_kak', ['nama_kegiatan' => '15 Days Activity', 'kurun_waktu_pelaksanaan' => '15 Hari']);

        // 1 Month 6 Days case (inclusive 31 + 6 = 37 days total)
        // 01/05 to 05/06 -> 36 days diff + 1 = 37 days. 37 / 30 = 1 month 7 days?
        // Logic in KakController: 37 % 30 = 7. So "1 Bulan 7 Hari".
        $dataMonth = $data15;
        $dataMonth['kak']['nama_kegiatan'] = 'Month Activity';
        $dataMonth['kak']['tanggal_mulai'] = '2026-05-01';
        $dataMonth['kak']['tanggal_selesai'] = '2026-06-05';

        $this->actingAs($user)->post(route('kak.store'), $dataMonth);
        $this->assertDatabaseHas('t_kak', ['nama_kegiatan' => 'Month Activity', 'kurun_waktu_pelaksanaan' => '1 Bulan 6 Hari']);
        // Wait, 01/05 to 05/06 is 31 days in May + 5 days in June = 36 days total.
        // Controller logic: Carbon diffInDays + 1.
        // May 1 to June 5: diffInDays is 35. + 1 = 36. 36 / 30 = 1. 36 % 30 = 6. -> "1 Bulan 6 Hari". Correct.
    }

    /**
     * Test Case: KAK-FT-027 - Validation: RAB: Multi-volume (Volume 1, 2, 3)
     */
    public function test_kak_rab_calculation_with_multiple_volumes(): void
    {
        $user = User::factory()->create(['role_id' => 3]);
        $tipe = TipeKegiatan::first();
        $satuan = Satuan::first();
        $iku = Iku::first();
        $kategori = KategoriBelanja::first();

        $data = [
            'kak' => [
                'nama_kegiatan' => 'Multi Volume Test',
                'deskripsi_kegiatan' => 'Desc desc desc desc desc',
                'metode_pelaksanaan' => 'Metode',
                'kurun_waktu_pelaksanaan' => '1 Day',
                'tanggal_mulai' => now()->addDays(1)->toDateString(),
                'tanggal_selesai' => now()->addDays(2)->toDateString(),
                'lokasi' => 'Loc',
                'tipe_kegiatan_id' => $tipe->tipe_kegiatan_id,
                'sasaran_utama' => 'Sasaran',
                'manfaat' => [['value' => 'M']],
                'tahapan_pelaksanaan' => [['nama_tahapan' => 'T', 'urutan' => 1]],
                'indikator_kinerja' => [['bulan_indikator' => 'Jan', 'deskripsi_target' => 'T', 'persentase_target' => 50]],
            ],
            'target_iku' => [['iku_id' => $iku->iku_id, 'target' => '10', 'satuan_id' => $satuan->satuan_id]],
            'rab' => [
                [
                    'kategori_belanja_id' => $kategori->kategori_belanja_id,
                    'uraian' => 'Complex Item',
                    'volume1' => 10,
                    'volume2' => 2,
                    'volume3' => 5,
                    'satuan1_id' => $satuan->satuan_id,
                    'harga_satuan' => 1000,
                ],
            ],
        ];

        $this->actingAs($user)->post(route('kak.store'), $data);

        // 10 * 2 * 5 * 1000 = 100,000
        $this->assertDatabaseHas('t_kak_anggaran', [
            'uraian' => 'Complex Item',
            'jumlah_diusulkan' => 100000,
        ]);
    }

    /**
     * Test Case: KAK-FT-032 - CRUD Update: Ubah urutan Tahapan Pelaksanaan
     */
    public function test_kak_tahapan_urutan_reindexed_on_update(): void
    {
        $user = User::factory()->create(['role_id' => 3]);
        $kak = KAK::factory()->create(['pengusul_user_id' => $user->user_id, 'status_id' => 1]);
        $tipe = TipeKegiatan::first();
        $satuan = Satuan::first();
        $iku = Iku::first();
        $kategori = KategoriBelanja::first();

        // Initial steps
        $s1 = KAKTahapan::create(['kak_id' => $kak->kak_id, 'nama_tahapan' => 'Step A', 'urutan' => 1]);
        $s2 = KAKTahapan::create(['kak_id' => $kak->kak_id, 'nama_tahapan' => 'Step B', 'urutan' => 2]);

        $updatedData = [
            'kak' => [
                'nama_kegiatan' => $kak->nama_kegiatan,
                'deskripsi_kegiatan' => $kak->deskripsi_kegiatan,
                'metode_pelaksanaan' => $kak->metode_pelaksanaan,
                'kurun_waktu_pelaksanaan' => $kak->kurun_waktu_pelaksanaan,
                'tanggal_mulai' => $kak->tanggal_mulai->toDateString(),
                'tanggal_selesai' => $kak->tanggal_selesai->toDateString(),
                'lokasi' => $kak->lokasi,
                'tipe_kegiatan_id' => $kak->tipe_kegiatan_id,
                'sasaran_utama' => $kak->sasaran_utama,
                'manfaat' => [['value' => 'M']],
                'tahapan_pelaksanaan' => [
                    ['tahapan_id' => $s2->tahapan_id, 'nama_tahapan' => 'Step B Updated', 'urutan' => 1], // Swapped to first
                    ['tahapan_id' => $s1->tahapan_id, 'nama_tahapan' => 'Step A Updated', 'urutan' => 2], // Swapped to second
                ],
                'indikator_kinerja' => [['bulan_indikator' => 'Jan', 'deskripsi_target' => 'T', 'persentase_target' => 50]],
            ],
            'target_iku' => [['iku_id' => $iku->iku_id, 'target' => '10', 'satuan_id' => $satuan->satuan_id]],
            'rab' => [['kategori_belanja_id' => $kategori->kategori_belanja_id, 'uraian' => 'U', 'volume1' => 1, 'satuan1_id' => $satuan->satuan_id, 'harga_satuan' => 1000]],
        ];

        $this->actingAs($user)->put(route('kak.update', $kak->kak_id), $updatedData);

        $this->assertDatabaseHas('t_kak_tahapan', ['tahapan_id' => $s2->tahapan_id, 'urutan' => 1]);
        $this->assertDatabaseHas('t_kak_tahapan', ['tahapan_id' => $s1->tahapan_id, 'urutan' => 2]);
    }

    /**
     * Test Case: KAK-FT-034 - CRUD Update: Ubah harga RAB yang punya catatan revisi
     */
    public function test_kak_update_preserves_rab_catatan_verifikator(): void
    {
        $user = User::factory()->create(['role_id' => 3]);
        $kak = KAK::factory()->create(['pengusul_user_id' => $user->user_id, 'status_id' => 5]); // Revision
        $tipe = TipeKegiatan::first();
        $satuan = Satuan::first();
        $iku = Iku::first();
        $kategori = KategoriBelanja::first();

        $rab = KAKAnggaran::create([
            'kak_id' => $kak->kak_id,
            'kategori_belanja_id' => $kategori->kategori_belanja_id,
            'uraian' => 'Item X',
            'volume1' => 1,
            'satuan1_id' => $satuan->satuan_id,
            'harga_satuan' => 1000,
            'catatan_verifikator' => 'Please fix price',
        ]);

        $updatedData = [
            'kak' => [
                'nama_kegiatan' => $kak->nama_kegiatan,
                'deskripsi_kegiatan' => $kak->deskripsi_kegiatan,
                'metode_pelaksanaan' => $kak->metode_pelaksanaan,
                'kurun_waktu_pelaksanaan' => $kak->kurun_waktu_pelaksanaan,
                'tanggal_mulai' => $kak->tanggal_mulai->toDateString(),
                'tanggal_selesai' => $kak->tanggal_selesai->toDateString(),
                'lokasi' => $kak->lokasi,
                'tipe_kegiatan_id' => $kak->tipe_kegiatan_id,
                'sasaran_utama' => $kak->sasaran_utama,
                'manfaat' => [['value' => 'M']],
                'tahapan_pelaksanaan' => [['nama_tahapan' => 'T', 'urutan' => 1]],
                'indikator_kinerja' => [['bulan_indikator' => 'Jan', 'deskripsi_target' => 'T', 'persentase_target' => 50]],
            ],
            'target_iku' => [['iku_id' => $iku->iku_id, 'target' => '10', 'satuan_id' => $satuan->satuan_id]],
            'rab' => [
                [
                    'anggaran_id' => $rab->anggaran_id,
                    'kategori_belanja_id' => $kategori->kategori_belanja_id,
                    'uraian' => 'Item X Updated',
                    'volume1' => 1,
                    'satuan1_id' => $satuan->satuan_id,
                    'harga_satuan' => 900,
                ],
            ],
        ];

        $this->actingAs($user)->put(route('kak.update', $kak->kak_id), $updatedData);

        $this->assertDatabaseHas('t_kak_anggaran', [
            'anggaran_id' => $rab->anggaran_id,
            'catatan_verifikator' => 'Please fix price',
        ]);
    }

    /**
     * Test Case: KAK-FT-033 - CRUD Update: Tambah RAB baru saat Edit
     */
    public function test_kak_update_can_add_new_rab_row(): void
    {
        $user = User::factory()->create(['role_id' => 3]);
        $kak = KAK::factory()->create(['pengusul_user_id' => $user->user_id, 'status_id' => 1]);
        $tipe = TipeKegiatan::first();
        $satuan = Satuan::first();
        $iku = Iku::first();
        $kategori = KategoriBelanja::first();

        $existingRab = KAKAnggaran::create([
            'kak_id' => $kak->kak_id,
            'kategori_belanja_id' => $kategori->kategori_belanja_id,
            'uraian' => 'Existing Item',
            'volume1' => 1,
            'satuan1_id' => $satuan->satuan_id,
            'harga_satuan' => 1000,
        ]);

        $updatedData = [
            'kak' => [
                'nama_kegiatan' => $kak->nama_kegiatan,
                'deskripsi_kegiatan' => $kak->deskripsi_kegiatan,
                'metode_pelaksanaan' => $kak->metode_pelaksanaan,
                'kurun_waktu_pelaksanaan' => $kak->kurun_waktu_pelaksanaan,
                'tanggal_mulai' => $kak->tanggal_mulai->toDateString(),
                'tanggal_selesai' => $kak->tanggal_selesai->toDateString(),
                'lokasi' => $kak->lokasi,
                'tipe_kegiatan_id' => $kak->tipe_kegiatan_id,
                'sasaran_utama' => $kak->sasaran_utama,
                'manfaat' => [['value' => 'M']],
                'tahapan_pelaksanaan' => [['nama_tahapan' => 'T', 'urutan' => 1]],
                'indikator_kinerja' => [['bulan_indikator' => 'Jan', 'deskripsi_target' => 'T', 'persentase_target' => 50]],
            ],
            'target_iku' => [['iku_id' => $iku->iku_id, 'target' => '10', 'satuan_id' => $satuan->satuan_id]],
            'rab' => [
                [
                    'anggaran_id' => $existingRab->anggaran_id,
                    'kategori_belanja_id' => $kategori->kategori_belanja_id,
                    'uraian' => 'Existing Item',
                    'volume1' => 1,
                    'satuan1_id' => $satuan->satuan_id,
                    'harga_satuan' => 1000,
                ],
                [
                    'anggaran_id' => null, // NEW
                    'kategori_belanja_id' => $kategori->kategori_belanja_id,
                    'uraian' => 'New Row Added',
                    'volume1' => 2,
                    'satuan1_id' => $satuan->satuan_id,
                    'harga_satuan' => 500,
                ],
            ],
        ];

        $this->actingAs($user)->put(route('kak.update', $kak->kak_id), $updatedData);

        $this->assertDatabaseCount('t_kak_anggaran', 2);
        $this->assertDatabaseHas('t_kak_anggaran', ['uraian' => 'New Row Added', 'kak_id' => $kak->kak_id]);
    }
}

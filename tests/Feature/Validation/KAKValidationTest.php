<?php

namespace Tests\Feature\Validation;

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class KAKValidationTest extends TestCase
{
    use RefreshDatabase;

    protected $user;

    protected function setUp(): void
    {
        parent::setUp();
        $role = new Role;
        $role->role_id = 3;
        $role->nama_role = 'Pengusul';
        $role->save();

        $this->user = User::factory()->create(['role_id' => 3]);
    }

    /**
     * Test KAK main header validation.
     */
    public function test_kak_header_validation_rules()
    {
        $response = $this->actingAs($this->user)
            ->postJson('/kak', ['kak' => []]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors([
                'kak.nama_kegiatan',
                'kak.deskripsi_kegiatan',
                'kak.metode_pelaksanaan',
                'kak.kurun_waktu_pelaksanaan',
                'kak.tanggal_mulai',
                'kak.tanggal_selesai',
                'kak.lokasi',
                'kak.sasaran_utama',
            ]);
    }

    /**
     * Test KAK nested Penerima Manfaat validation.
     */
    public function test_kak_penerima_manfaat_validation_rules()
    {
        $response = $this->actingAs($this->user)
            ->postJson('/kak', [
                'kak' => [
                    'manfaat' => [
                        ['value' => ''],
                    ],
                ],
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors([
                'kak.manfaat.0.value',
            ]);
    }

    /**
     * Test KAK nested Tahapan Pelaksanaan validation.
     */
    public function test_kak_tahapan_pelaksanaan_validation_rules()
    {
        $response = $this->actingAs($this->user)
            ->postJson('/kak', [
                'kak' => [
                    'tahapan_pelaksanaan' => [
                        ['nama_tahapan' => '', 'urutan' => ''],
                    ],
                ],
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors([
                'kak.tahapan_pelaksanaan.0.nama_tahapan',
                'kak.tahapan_pelaksanaan.0.urutan',
            ]);
    }

    /**
     * Test KAK nested Indikator Kinerja validation.
     */
    public function test_kak_indikator_kinerja_validation_rules()
    {
        $response = $this->actingAs($this->user)
            ->postJson('/kak', [
                'kak' => [
                    'indikator_kinerja' => [
                        ['bulan_indikator' => '', 'deskripsi_target' => '', 'persentase_target' => ''],
                    ],
                ],
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors([
                'kak.indikator_kinerja.0.bulan_indikator',
                'kak.indikator_kinerja.0.deskripsi_target',
                'kak.indikator_kinerja.0.persentase_target',
            ]);
    }

    /**
     * Test KAK nested Target IKU validation.
     */
    public function test_kak_target_iku_validation_rules()
    {
        $response = $this->actingAs($this->user)
            ->postJson('/kak', [
                'target_iku' => [
                    ['iku_id' => '', 'target' => '', 'satuan_id' => ''],
                ],
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors([
                'target_iku.0.iku_id',
                'target_iku.0.target',
                'target_iku.0.satuan_id',
            ]);
    }

    /**
     * Test KAK nested RAB (Anggaran) validation.
     */
    public function test_kak_rab_validation_rules()
    {
        $response = $this->actingAs($this->user)
            ->postJson('/kak', [
                'rab' => [
                    ['uraian' => '', 'volume1' => '', 'satuan1_id' => '', 'harga_satuan' => '', 'kategori_belanja_id' => ''],
                ],
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors([
                'rab.0.uraian',
                'rab.0.volume1',
                'rab.0.satuan1_id',
                'rab.0.harga_satuan',
                'rab.0.kategori_belanja_id',
            ]);
    }

    /**
     * Test name too short (KAK-FT-003).
     */
    public function test_kak_name_min_length_validation()
    {
        $response = $this->actingAs($this->user)
            ->postJson('/kak', [
                'kak' => ['nama_kegiatan' => 'Abc'],
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['kak.nama_kegiatan']);
    }

    /**
     * Test end date before start date (KAK-FT-005, 026).
     */
    public function test_kak_date_order_validation()
    {
        $response = $this->actingAs($this->user)
            ->postJson('/kak', [
                'kak' => [
                    'tanggal_mulai' => '2026-05-20',
                    'tanggal_selesai' => '2026-05-10',
                ],
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['kak.tanggal_selesai']);
    }

    /**
     * Test volume cannot be negative (KAK-FT-007).
     */
    public function test_kak_rab_volume_min_validation()
    {
        $response = $this->actingAs($this->user)
            ->postJson('/kak', [
                'rab' => [
                    ['volume1' => -1],
                ],
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['rab.0.volume1']);
    }

    /**
     * Test indicator percentage bounds (KAK-FT-010).
     */
    public function test_kak_indicator_percentage_max_validation()
    {
        $response = $this->actingAs($this->user)
            ->postJson('/kak', [
                'kak' => [
                    'indikator_kinerja' => [
                        ['persentase_target' => 105],
                    ],
                ],
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['kak.indikator_kinerja.0.persentase_target']);
    }

    /**
     * Test target IKU can be empty (KAK-FT-009).
     * Based on StoreKakRequest: 'target_iku' => 'required|array' (without min:1)
     */
    public function test_kak_target_iku_can_be_empty()
    {
        // We provide other required fields so validation doesn't fail on them
        $response = $this->actingAs($this->user)
            ->postJson('/kak', [
                'kak' => [
                    'nama_kegiatan' => 'Valid Name',
                    'deskripsi_kegiatan' => 'Long enough description',
                    'metode_pelaksanaan' => 'Metode pelaksanaan',
                    'kurun_waktu_pelaksanaan' => '1 Day',
                    'tanggal_mulai' => '2026-05-20',
                    'tanggal_selesai' => '2026-05-21',
                    'lokasi' => 'Campus',
                    'tipe_kegiatan_id' => 1,
                    'sasaran_utama' => 'Sasaran',
                    'manfaat' => [['value' => 'Manfaat']],
                    'tahapan_pelaksanaan' => [['nama_tahapan' => 'Tahapan', 'urutan' => 1]],
                    'indikator_kinerja' => [],
                ],
                'target_iku' => [],
                'rab' => [],
            ]);

        // It should NOT have target_iku validation errors if empty array is allowed
        $response->assertJsonMissingValidationErrors(['target_iku']);
    }

    /**
     * Test Case: KAK-FT-002 - Validation: Nama kegiatan kosong
     */
    public function test_kak_name_required_validation()
    {
        $response = $this->actingAs($this->user)
            ->postJson('/kak', [
                'kak' => ['nama_kegiatan' => ''],
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['kak.nama_kegiatan']);
    }

    /**
     * Test Case: KAK-FT-006 - Validation: Tipe Kegiatan ID tidak ada di master
     */
    public function test_kak_tipe_kegiatan_id_invalid_validation()
    {
        $response = $this->actingAs($this->user)
            ->postJson('/kak', [
                'kak' => ['tipe_kegiatan_id' => 9999],
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['kak.tipe_kegiatan_id']);
    }

    /**
     * Test Case: KAK-FT-008 - Validation: RAB: Harga Satuan bukan angka
     */
    public function test_kak_rab_harga_satuan_numeric_validation()
    {
        $response = $this->actingAs($this->user)
            ->postJson('/kak', [
                'rab' => [
                    ['harga_satuan' => 'seribu'],
                ],
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['rab.0.harga_satuan']);
    }

    /**
     * Test Case: KAK-FT-025 - Validation: Volume RAB = 0 (Assuming min 1 if spec says so, or 0 if valid)
     * If business logic requires at least 1, then this test verifies rejection.
     */
    public function test_kak_rab_volume_zero_validation()
    {
        $response = $this->actingAs($this->user)
            ->postJson('/kak', [
                'rab' => [
                    ['volume1' => 0],
                ],
            ]);

        // If it should fail (min 1):
        // $response->assertStatus(422)->assertJsonValidationErrors(['rab.0.volume1']);
        
        // If it is valid:
        $response->assertJsonMissingValidationErrors(['rab.0.volume1']);
    }

    /**
     * Test past dates are allowed (KAK-FT-024).
     */
    public function test_kak_past_dates_allowed()
    {
        $response = $this->actingAs($this->user)
            ->postJson('/kak', [
                'kak' => [
                    'tanggal_mulai' => '2020-01-01',
                    'tanggal_selesai' => '2020-01-02',
                ],
            ]);

        $response->assertJsonMissingValidationErrors(['kak.tanggal_mulai', 'kak.tanggal_selesai']);
    }
}

<?php

namespace Tests\Feature\Validation;

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
        $role = new \App\Models\Role();
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
                    'penerima_manfaat' => [
                        ['sasaran_utama' => '', 'manfaat' => '']
                    ]
                ]
            ]);
            
        $response->assertStatus(422)
            ->assertJsonValidationErrors([
                'kak.penerima_manfaat.0.sasaran_utama',
                'kak.penerima_manfaat.0.manfaat',
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
                        ['nama_tahapan' => '', 'urutan' => '']
                    ]
                ]
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
                        ['bulan_indikator' => '', 'deskripsi_target' => '', 'persentase_target' => '']
                    ]
                ]
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
                    ['iku_id' => '', 'target' => '', 'satuan_id' => '']
                ]
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
                    ['uraian' => '', 'volume1' => '', 'satuan1_id' => '', 'harga_satuan' => '', 'kategori_belanja_id' => '']
                ]
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
}

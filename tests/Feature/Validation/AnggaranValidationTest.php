<?php

namespace Tests\Feature\Validation;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AnggaranValidationTest extends TestCase
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

    protected function getBasePayload()
    {
        return [
            'kak' => [
                'nama_kegiatan' => 'Test',
                'deskripsi_kegiatan' => 'Test',
                'metode_pelaksanaan' => 'Test',
                'kurun_waktu_pelaksanaan' => 'Test',
                'tanggal_mulai' => now()->toDateString(),
                'tanggal_selesai' => now()->addDays(1)->toDateString(),
                'lokasi' => 'Test',
                'tipe_kegiatan_id' => 1,
                'penerima_manfaat' => [
                    ['sasaran_utama' => 'Test', 'manfaat' => 'Test']
                ],
                'tahapan_pelaksanaan' => [
                    ['nama_tahapan' => 'Test', 'urutan' => 1]
                ],
                'indikator_kinerja' => [
                    ['bulan_indikator' => 1, 'deskripsi_target' => 'Test', 'persentase_target' => 100]
                ],
            ],
            'target_iku' => [
                ['iku_id' => 1, 'target' => 100, 'satuan_id' => 1]
            ],
            'rab' => []
        ];
    }

    /**
     * Test Anggaran (RAB) item validation rules.
     */
    public function test_anggaran_item_validation_rules()
    {
        // 1. Required fields
        $payload = $this->getBasePayload();
        $payload['rab'] = [
            ['uraian' => '', 'volume1' => '', 'satuan1_id' => '', 'harga_satuan' => '', 'kategori_belanja_id' => '']
        ];
        
        $response = $this->actingAs($this->user)
            ->postJson('/kak', $payload);
            
        $response->assertStatus(422)
            ->assertJsonValidationErrors([
                'rab.0.uraian',
                'rab.0.volume1',
                'rab.0.satuan1_id',
                'rab.0.harga_satuan',
                'rab.0.kategori_belanja_id',
            ]);

        // 2. Positive numeric values
        $payload = $this->getBasePayload();
        $payload['rab'] = [
            [
                'uraian' => 'Item A',
                'volume1' => -1,
                'satuan1_id' => 1,
                'harga_satuan' => -1000,
                'kategori_belanja_id' => 1,
            ]
        ];
        
        $response = $this->actingAs($this->user)
            ->postJson('/kak', $payload);
            
        $response->assertStatus(422)
            ->assertJsonValidationErrors([
                'rab.0.volume1',
                'rab.0.harga_satuan',
            ]);
    }
}

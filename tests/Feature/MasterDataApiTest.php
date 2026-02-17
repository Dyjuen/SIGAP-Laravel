<?php

namespace Tests\Feature;

use App\Models\Iku;
use App\Models\KategoriBelanja;
use App\Models\MataAnggaran;
use App\Models\Satuan;
use App\Models\TipeKegiatan;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MasterDataApiTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test getting IKU data.
     */
    public function test_can_get_iku_list(): void
    {
        Iku::factory()->count(3)->create();

        $response = $this->get('/api/master/iku');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    '*' => ['iku_id', 'kode_iku', 'nama_iku'],
                ],
                'message',
            ]);
    }

    /**
     * Test getting Satuan data.
     */
    public function test_can_get_satuan_list(): void
    {
        Satuan::factory()->count(3)->create();

        $response = $this->get('/api/master/satuan');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    '*' => ['satuan_id', 'nama_satuan'],
                ],
                'message',
            ]);
    }

    /**
     * Test getting Tipe Kegiatan data.
     */
    public function test_can_get_tipe_kegiatan_list(): void
    {
        TipeKegiatan::factory()->count(3)->create();

        $response = $this->get('/api/master/tipe-kegiatan');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    '*' => ['tipe_kegiatan_id', 'nama_tipe'],
                ],
                'message',
            ]);
    }

    /**
     * Test getting Kategori Belanja data.
     */
    public function test_can_get_kategori_belanja_list(): void
    {
        KategoriBelanja::factory()->count(5)->create(['is_active' => true]);
        KategoriBelanja::factory()->create(['is_active' => false]); // Should not be returned

        $response = $this->get('/api/master/kategori-belanja');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    '*' => ['kategori_belanja_id', 'kode', 'nama', 'is_active'],
                ],
                'message',
            ])
            ->assertJsonCount(5, 'data');
    }

    /**
     * Test getting Mata Anggaran data.
     */
    public function test_can_get_mata_anggaran_list(): void
    {
        MataAnggaran::factory()->count(3)->create();

        $response = $this->get('/api/master/mata-anggaran');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    '*' => ['mata_anggaran_id', 'kode_anggaran', 'nama_sumber_dana'],
                ],
                'message',
            ]);
    }
}

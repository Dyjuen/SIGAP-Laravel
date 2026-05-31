<?php

namespace Tests\Unit\Services;

use App\Models\KAK;
use App\Models\User;
use App\Services\KakService;
use Database\Seeders\MasterDataSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class KakServiceTest extends TestCase
{
    use RefreshDatabase;

    private KakService $service;

    private User $pengusul;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(MasterDataSeeder::class);
        $this->service = new KakService;
        $this->pengusul = User::factory()->create(['role_id' => 3]);
    }

    public function test_it_creates_kak_with_nested_relations(): void
    {
        $data = [
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
            'tahapan_pelaksanaan' => [
                ['nama_tahapan' => 'Persiapan Lab and Software', 'urutan' => 1],
                ['nama_tahapan' => 'Penyampaian Teori Dasar', 'urutan' => 2],
            ],
            'indikator_kinerja' => [
                ['bulan_indikator' => 'Januari', 'deskripsi_target' => 'Target 1', 'persentase_target' => 80],
            ],
            'target_iku' => [
                ['iku_id' => 1, 'target' => '100%', 'satuan_id' => 1],
            ],
            'rab' => [
                [
                    'uraian' => 'Honor Narasumber Utama',
                    'volume1' => 2,
                    'satuan1_id' => 1,
                    'harga_satuan' => 500000,
                    'kategori_belanja_id' => 1,
                ],
            ],
        ];

        $kak = $this->service->create($data, $this->pengusul);

        $this->assertDatabaseHas('t_kak', [
            'kak_id' => $kak->kak_id,
            'nama_kegiatan' => 'Workshop UI/UX Pemula',
            'pengusul_user_id' => $this->pengusul->user_id,
            'status_id' => 1, // Draft
        ]);

        $this->assertCount(2, $kak->manfaat);
        $this->assertCount(2, $kak->tahapan);
        $this->assertCount(1, $kak->targets);
        $this->assertCount(1, $kak->ikus);
        $this->assertCount(1, $kak->anggaran);
    }

    public function test_it_updates_kak_with_nested_relations(): void
    {
        $kak = KAK::factory()->create([
            'pengusul_user_id' => $this->pengusul->user_id,
            'status_id' => 1,
            'nama_kegiatan' => 'Old Name',
        ]);

        $data = [
            'nama_kegiatan' => 'New Name',
            'deskripsi_kegiatan' => 'Belajar desain antarmuka mobile and web.',
            'metode_pelaksanaan' => 'Pelatihan langsung and mentoring online.',
            'tanggal_mulai' => now()->addDays(1)->toDateString(),
            'tanggal_selesai' => now()->addDays(4)->toDateString(),
            'lokasi' => 'Lab Komputer 3',
            'tipe_kegiatan_id' => 1,
            'sasaran_utama' => 'Mahasiswa Tingkat Akhir',
            'manfaat' => [
                ['value' => 'New Manfaat'],
            ],
            'tahapan_pelaksanaan' => [
                ['nama_tahapan' => 'New Tahapan', 'urutan' => 1],
            ],
            'indikator_kinerja' => [],
            'target_iku' => [],
            'rab' => [],
        ];

        $this->service->update($kak, $data);

        $this->assertDatabaseHas('t_kak', [
            'kak_id' => $kak->kak_id,
            'nama_kegiatan' => 'New Name',
        ]);

        $kak->refresh();
        $this->assertCount(1, $kak->manfaat);
        $this->assertEquals('New Manfaat', $kak->manfaat->first()->manfaat);
    }
}

<?php

namespace Tests\Feature\Api;

use App\Models\KAK;
use App\Models\KAKAnggaran;
use App\Models\Kegiatan;
use App\Models\KegiatanApproval;
use App\Models\User;
use Database\Seeders\MasterDataSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PencairanApiTest extends TestCase
{
    use RefreshDatabase;

    private User $pengusul;
    private User $bendahara;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(MasterDataSeeder::class);

        $this->pengusul = User::factory()->create(['role_id' => 3]);
        $this->bendahara = User::factory()->create(['role_id' => 6]);
    }

    private function createKegiatanAtBendaharaCair(User $pengusul, int $totalAnggaran = 5000000): Kegiatan
    {
        $kak = KAK::create([
            'nama_kegiatan' => 'Test Kegiatan Pencairan',
            'deskripsi_kegiatan' => 'Test',
            'pengusul_user_id' => $pengusul->user_id,
            'status_id' => 8, // Proses Pencairan
            'tanggal_mulai' => now()->addDays(1),
            'tanggal_selesai' => now()->addDays(5),
            'tipe_kegiatan_id' => 1,
            'mata_anggaran_id' => 1,
        ]);

        KAKAnggaran::create([
            'kak_id' => $kak->kak_id,
            'kategori_belanja_id' => 1,
            'uraian' => 'Test Anggaran',
            'volume1' => 1,
            'satuan1_id' => 1,
            'harga_satuan' => $totalAnggaran,
            'jumlah_diusulkan' => $totalAnggaran,
        ]);

        $kegiatan = Kegiatan::create([
            'kak_id' => $kak->kak_id,
            'penanggung_jawab_manual' => 'Test PJ',
            'pelaksana_manual' => 'Test Pelaksana',
        ]);

        $steps = ['PPK', 'Wadir2', 'Bendahara-Cair', 'Bendahara-LPJ', 'Bendahara-Setor'];
        foreach ($steps as $step) {
            $status = match ($step) {
                'PPK', 'Wadir2' => 'Disetujui',
                'Bendahara-Cair' => 'Aktif',
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

    public function test_api_index_pencairan_returns_data()
    {
        $this->createKegiatanAtBendaharaCair($this->pengusul);
        $token = $this->bendahara->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer '.$token,
            'Accept' => 'application/json',
        ])->getJson('/api/pencairan');

        $response->assertStatus(200);
        $response->assertJsonCount(1);
    }

    public function test_api_sisa_dana_returns_correct_details()
    {
        $kegiatan = $this->createKegiatanAtBendaharaCair($this->pengusul, 5000000);
        $token = $this->bendahara->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer '.$token,
            'Accept' => 'application/json',
        ])->getJson('/api/kegiatan/'.$kegiatan->kegiatan_id.'/pencairan/sisa-dana');

        $response->assertStatus(200);
        $response->assertJsonPath('total_anggaran_disetujui', 5000000);
        $response->assertJsonPath('total_dicairkan', 0);
        $response->assertJsonPath('sisa_dana', 5000000);
    }

    public function test_api_store_pencairan_works()
    {
        $kegiatan = $this->createKegiatanAtBendaharaCair($this->pengusul, 5000000);
        $token = $this->bendahara->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer '.$token,
            'Accept' => 'application/json',
        ])->postJson('/api/kegiatan/'.$kegiatan->kegiatan_id.'/pencairan', [
            'nominal_pencairan' => 2000000,
            'keterangan' => 'Termin 1',
        ]);

        $response->assertStatus(200);
        $response->assertJson([
            'message' => 'Pencairan dana berhasil dicatat.',
        ]);

        $this->assertDatabaseHas('t_pencairan_dana', [
            'kegiatan_id' => $kegiatan->kegiatan_id,
            'jumlah_dicairkan' => 2000000,
        ]);
    }

    public function test_api_selesai_pencairan_works()
    {
        $kegiatan = $this->createKegiatanAtBendaharaCair($this->pengusul);
        $token = $this->bendahara->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer '.$token,
            'Accept' => 'application/json',
        ])->postJson('/api/kegiatan/'.$kegiatan->kegiatan_id.'/pencairan/selesai');

        $response->assertStatus(200);
        $response->assertJson([
            'message' => 'Proses pencairan berhasil diselesaikan dan tahap LPJ telah dimulai.',
        ]);

        $this->assertDatabaseHas('t_kegiatan_approval', [
            'kegiatan_id' => $kegiatan->kegiatan_id,
            'approval_level' => 'Bendahara-Cair',
            'status' => 'Disetujui',
        ]);
    }

    public function test_api_non_bendahara_cannot_access_index()
    {
        $token = $this->pengusul->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer '.$token,
            'Accept' => 'application/json',
        ])->getJson('/api/pencairan');

        $response->assertStatus(403);
    }

    public function test_api_non_bendahara_cannot_store_pencairan()
    {
        $kegiatan = $this->createKegiatanAtBendaharaCair($this->pengusul, 5000000);
        $token = $this->pengusul->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer '.$token,
            'Accept' => 'application/json',
        ])->postJson('/api/kegiatan/'.$kegiatan->kegiatan_id.'/pencairan', [
            'nominal_pencairan' => 1000000,
        ]);

        $response->assertStatus(403);
    }

    public function test_api_non_bendahara_cannot_selesai_pencairan()
    {
        $kegiatan = $this->createKegiatanAtBendaharaCair($this->pengusul);
        $token = $this->pengusul->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer '.$token,
            'Accept' => 'application/json',
        ])->postJson('/api/kegiatan/'.$kegiatan->kegiatan_id.'/pencairan/selesai');

        $response->assertStatus(403);
    }

    public function test_api_pengusul_cannot_view_other_sisa_dana()
    {
        $otherPengusul = User::factory()->create(['role_id' => 3]);
        $kegiatan = $this->createKegiatanAtBendaharaCair($this->pengusul);
        $token = $otherPengusul->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer '.$token,
            'Accept' => 'application/json',
        ])->getJson('/api/kegiatan/'.$kegiatan->kegiatan_id.'/pencairan/sisa-dana');

        $response->assertStatus(403);
    }

    public function test_api_store_fails_when_approval_not_active()
    {
        $kak = KAK::create([
            'nama_kegiatan' => 'Kegiatan PPK Stage',
            'deskripsi_kegiatan' => 'Test',
            'pengusul_user_id' => $this->pengusul->user_id,
            'status_id' => 6,
            'tanggal_mulai' => now()->addDays(1),
            'tanggal_selesai' => now()->addDays(5),
            'tipe_kegiatan_id' => 1,
            'mata_anggaran_id' => 1,
        ]);
        $kegiatan = Kegiatan::create([
            'kak_id' => $kak->kak_id,
            'penanggung_jawab_manual' => 'PJ',
            'pelaksana_manual' => 'Pelaksana',
        ]);
        KegiatanApproval::create([
            'kegiatan_id' => $kegiatan->kegiatan_id,
            'approval_level' => 'PPK',
            'status' => 'Aktif',
        ]);

        $token = $this->bendahara->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer '.$token,
            'Accept' => 'application/json',
        ])->postJson('/api/kegiatan/'.$kegiatan->kegiatan_id.'/pencairan', [
            'nominal_pencairan' => 1000000,
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['nominal_pencairan']);
    }

    public function test_api_store_fails_when_exceeding_sisa_dana()
    {
        $kegiatan = $this->createKegiatanAtBendaharaCair($this->pengusul, 2000000);
        $token = $this->bendahara->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer '.$token,
            'Accept' => 'application/json',
        ])->postJson('/api/kegiatan/'.$kegiatan->kegiatan_id.'/pencairan', [
            'nominal_pencairan' => 3000000,
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['nominal_pencairan']);
    }

    public function test_api_store_validation_rejects_invalid_data()
    {
        $kegiatan = $this->createKegiatanAtBendaharaCair($this->pengusul);
        $token = $this->bendahara->createToken('test-token')->plainTextToken;

        // Zero nominal
        $response = $this->withHeaders([
            'Authorization' => 'Bearer '.$token,
            'Accept' => 'application/json',
        ])->postJson('/api/kegiatan/'.$kegiatan->kegiatan_id.'/pencairan', [
            'nominal_pencairan' => 0,
        ]);
        $response->assertStatus(422);

        // Missing nominal
        $response = $this->withHeaders([
            'Authorization' => 'Bearer '.$token,
            'Accept' => 'application/json',
        ])->postJson('/api/kegiatan/'.$kegiatan->kegiatan_id.'/pencairan', []);
        $response->assertStatus(422);
    }

    public function test_api_store_pencairan_is_atomic()
    {
        $kegiatan = $this->createKegiatanAtBendaharaCair($this->pengusul, 5000000);
        $token = $this->bendahara->createToken('test-token')->plainTextToken;

        \App\Models\PencairanDana::creating(function() {
            throw new \Exception('Simulated DB Failure');
        });

        $response = $this->withHeaders([
            'Authorization' => 'Bearer '.$token,
            'Accept' => 'application/json',
        ])->postJson('/api/kegiatan/'.$kegiatan->kegiatan_id.'/pencairan', [
            'nominal_pencairan' => 1000000,
        ]);

        $response->assertStatus(500);
        $this->assertDatabaseCount('t_pencairan_dana', 0);
        
        \App\Models\PencairanDana::flushEventListeners();
    }

    public function test_api_store_pencairan_at_max_limit()
    {
        $kegiatan = $this->createKegiatanAtBendaharaCair($this->pengusul, 2000000);
        $token = $this->bendahara->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer '.$token,
            'Accept' => 'application/json',
        ])->postJson('/api/kegiatan/'.$kegiatan->kegiatan_id.'/pencairan', [
            'nominal_pencairan' => 2000000,
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseCount('t_pencairan_dana', 1);
    }

    public function test_api_selesai_fails_when_bendahara_cair_not_active()
    {
        $kak = KAK::create([
            'nama_kegiatan' => 'Kegiatan LPJ Stage',
            'deskripsi_kegiatan' => 'Test',
            'pengusul_user_id' => $this->pengusul->user_id,
            'status_id' => 10,
            'tanggal_mulai' => now()->addDays(1),
            'tanggal_selesai' => now()->addDays(5),
            'tipe_kegiatan_id' => 1,
            'mata_anggaran_id' => 1,
        ]);
        $kegiatan = Kegiatan::create([
            'kak_id' => $kak->kak_id,
            'penanggung_jawab_manual' => 'PJ',
            'pelaksana_manual' => 'Pelaksana',
        ]);
        KegiatanApproval::create([
            'kegiatan_id' => $kegiatan->kegiatan_id,
            'approval_level' => 'Bendahara-Cair',
            'status' => 'Disetujui',
        ]);

        $token = $this->bendahara->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer '.$token,
            'Accept' => 'application/json',
        ])->postJson('/api/kegiatan/'.$kegiatan->kegiatan_id.'/pencairan/selesai');

        $response->assertStatus(500);
    }
}

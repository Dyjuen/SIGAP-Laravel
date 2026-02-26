<?php

namespace Tests\Feature;

use App\Models\KAK;
use App\Models\KAKAnggaran;
use App\Models\Kegiatan;
use App\Models\KegiatanApproval;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PencairanTest extends TestCase
{
    use RefreshDatabase;

    private User $pengusul;

    private User $pengusulLain;

    private User $bendahara;

    private User $ppk;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\MasterDataSeeder::class);

        $this->pengusul = User::factory()->create(['role_id' => 3]);
        $this->pengusulLain = User::factory()->create(['role_id' => 3]);
        $this->bendahara = User::factory()->create(['role_id' => 6]);
        $this->ppk = User::factory()->create(['role_id' => 4]);
    }

    // ========================================
    // HELPERS
    // ========================================

    /**
     * Create a full kegiatan fixture where Bendahara-Cair is Aktif.
     * This replicates the state after Wadir approves.
     */
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

        // Create KAK Anggaran to define the total budget
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

        // Create approval chain
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

    // ========================================
    // INDEX TESTS
    // ========================================

    public function test_unauthenticated_cannot_access_pencairan_index(): void
    {
        $this->get(route('pencairan.index'))->assertRedirect('/login');
    }

    public function test_bendahara_can_view_pencairan_index(): void
    {
        $this->createKegiatanAtBendaharaCair($this->pengusul);

        $response = $this->actingAs($this->bendahara)->get(route('pencairan.index'));

        $response->assertStatus(200);
        $response->assertInertia(
            fn ($page) => $page
                ->component('Pencairan/Index')
                ->has('kegiatans', 1)
        );
    }

    public function test_index_only_shows_kegiatan_at_bendahara_cair_aktif(): void
    {
        // Kegiatan at Bendahara-Cair Aktif — should appear
        $this->createKegiatanAtBendaharaCair($this->pengusul);

        // Kegiatan at PPK stage — should NOT appear
        $kak2 = KAK::create([
            'nama_kegiatan' => 'Kegiatan PPK',
            'deskripsi_kegiatan' => 'Test',
            'pengusul_user_id' => $this->pengusulLain->user_id,
            'status_id' => 6,
            'tanggal_mulai' => now()->addDays(1),
            'tanggal_selesai' => now()->addDays(5),
            'tipe_kegiatan_id' => 1,
            'mata_anggaran_id' => 1,
        ]);
        $kegiatan2 = Kegiatan::create([
            'kak_id' => $kak2->kak_id,
            'penanggung_jawab_manual' => 'PJ2',
            'pelaksana_manual' => 'Pelaksana2',
        ]);
        KegiatanApproval::create([
            'kegiatan_id' => $kegiatan2->kegiatan_id,
            'approval_level' => 'PPK',
            'status' => 'Aktif',
        ]);

        $response = $this->actingAs($this->bendahara)->get(route('pencairan.index'));

        $response->assertInertia(
            fn ($page) => $page
                ->component('Pencairan/Index')
                ->has('kegiatans', 1) // Only 1 kegiatan, not 2
        );
    }

    public function test_non_bendahara_cannot_view_pencairan_index(): void
    {
        $this->actingAs($this->ppk)->get(route('pencairan.index'))->assertStatus(403);
        $this->actingAs($this->pengusul)->get(route('pencairan.index'))->assertStatus(403);
    }

    // ========================================
    // SISA DANA TESTS
    // ========================================

    public function test_bendahara_can_view_sisa_dana(): void
    {
        $kegiatan = $this->createKegiatanAtBendaharaCair($this->pengusul, 5000000);

        $response = $this->actingAs($this->bendahara)
            ->getJson(route('pencairan.sisa-dana', $kegiatan));

        $response->assertStatus(200)
            ->assertJsonPath('total_anggaran_disetujui', 5000000)
            ->assertJsonPath('total_dicairkan', 0)
            ->assertJsonPath('sisa_dana', 5000000);
    }

    public function test_pengusul_can_view_own_sisa_dana(): void
    {
        $kegiatan = $this->createKegiatanAtBendaharaCair($this->pengusul);

        $this->actingAs($this->pengusul)
            ->getJson(route('pencairan.sisa-dana', $kegiatan))
            ->assertStatus(200);
    }

    public function test_pengusul_cannot_view_other_kegiatan_sisa_dana(): void
    {
        $kegiatan = $this->createKegiatanAtBendaharaCair($this->pengusul);

        $this->actingAs($this->pengusulLain)
            ->getJson(route('pencairan.sisa-dana', $kegiatan))
            ->assertStatus(403);
    }

    // ========================================
    // STORE TESTS
    // ========================================

    public function test_bendahara_can_store_pencairan(): void
    {
        $kegiatan = $this->createKegiatanAtBendaharaCair($this->pengusul, 5000000);

        $response = $this->actingAs($this->bendahara)
            ->postJson(route('pencairan.store', $kegiatan), [
                'nominal_pencairan' => 2000000,
                'keterangan' => 'Pencairan tahap pertama',
            ]);

        $response->assertStatus(201);

        $this->assertDatabaseHas('t_pencairan_dana', [
            'kegiatan_id' => $kegiatan->kegiatan_id,
            'jumlah_dicairkan' => 2000000,
            'created_by' => $this->bendahara->user_id,
        ]);
    }

    public function test_non_bendahara_cannot_store_pencairan(): void
    {
        $kegiatan = $this->createKegiatanAtBendaharaCair($this->pengusul);

        $this->actingAs($this->ppk)
            ->postJson(route('pencairan.store', $kegiatan), ['nominal_pencairan' => 1000000])
            ->assertStatus(403);

        $this->actingAs($this->pengusul)
            ->postJson(route('pencairan.store', $kegiatan), ['nominal_pencairan' => 1000000])
            ->assertStatus(403);
    }

    public function test_store_fails_when_approval_not_active(): void
    {
        // Create a kegiatan where Bendahara-Cair is NOT Aktif (at PPK stage)
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
        KegiatanApproval::create([
            'kegiatan_id' => $kegiatan->kegiatan_id,
            'approval_level' => 'Bendahara-Cair',
            'status' => 'Menunggu',
        ]);

        $response = $this->actingAs($this->bendahara)
            ->postJson(route('pencairan.store', $kegiatan), ['nominal_pencairan' => 1000000]);

        $response->assertStatus(400);
        $this->assertDatabaseCount('t_pencairan_dana', 0);
    }

    public function test_store_fails_when_exceeding_sisa_dana(): void
    {
        $kegiatan = $this->createKegiatanAtBendaharaCair($this->pengusul, 2000000);

        $response = $this->actingAs($this->bendahara)
            ->postJson(route('pencairan.store', $kegiatan), [
                'nominal_pencairan' => 3000000, // Exceeds budget of 2M
            ]);

        $response->assertStatus(422)
            ->assertJsonPath('message', fn ($msg) => str_contains($msg, 'sisa dana'));

        $this->assertDatabaseCount('t_pencairan_dana', 0);
    }

    public function test_store_validation_rejects_invalid_data(): void
    {
        $kegiatan = $this->createKegiatanAtBendaharaCair($this->pengusul);

        // Missing nominal_pencairan
        $this->actingAs($this->bendahara)
            ->postJson(route('pencairan.store', $kegiatan), [])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['nominal_pencairan']);

        // Zero value
        $this->actingAs($this->bendahara)
            ->postJson(route('pencairan.store', $kegiatan), ['nominal_pencairan' => 0])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['nominal_pencairan']);
    }

    // ========================================
    // SELESAI TESTS
    // ========================================

    public function test_bendahara_can_selesai_pencairan(): void
    {
        $kegiatan = $this->createKegiatanAtBendaharaCair($this->pengusul);

        $response = $this->actingAs($this->bendahara)
            ->postJson(route('pencairan.selesai', $kegiatan));

        $response->assertStatus(200);

        // Bendahara-Cair should now be Disetujui
        $this->assertDatabaseHas('t_kegiatan_approval', [
            'kegiatan_id' => $kegiatan->kegiatan_id,
            'approval_level' => 'Bendahara-Cair',
            'status' => 'Disetujui',
        ]);

        // Bendahara-LPJ should now be Aktif
        $this->assertDatabaseHas('t_kegiatan_approval', [
            'kegiatan_id' => $kegiatan->kegiatan_id,
            'approval_level' => 'Bendahara-LPJ',
            'status' => 'Aktif',
        ]);

        // KAK status should be updated to 10 (Menunggu LPJ)
        $this->assertDatabaseHas('t_kak', [
            'kak_id' => $kegiatan->kak_id,
            'status_id' => 10,
        ]);

        // Status log should be created
        $this->assertDatabaseHas('t_kegiatan_log_status', [
            'kegiatan_id' => $kegiatan->kegiatan_id,
            'status_id_baru' => 10,
        ]);
    }

    public function test_non_bendahara_cannot_selesai_pencairan(): void
    {
        $kegiatan = $this->createKegiatanAtBendaharaCair($this->pengusul);

        $this->actingAs($this->ppk)
            ->postJson(route('pencairan.selesai', $kegiatan))
            ->assertStatus(403);

        $this->actingAs($this->pengusul)
            ->postJson(route('pencairan.selesai', $kegiatan))
            ->assertStatus(403);
    }

    public function test_selesai_fails_when_bendahara_cair_not_active(): void
    {
        // Create a kegiatan where Bendahara-Cair is already Disetujui (already completed)
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
        KegiatanApproval::create([
            'kegiatan_id' => $kegiatan->kegiatan_id,
            'approval_level' => 'Bendahara-LPJ',
            'status' => 'Aktif',
        ]);

        $response = $this->actingAs($this->bendahara)
            ->postJson(route('pencairan.selesai', $kegiatan));

        $response->assertStatus(400);
    }
}

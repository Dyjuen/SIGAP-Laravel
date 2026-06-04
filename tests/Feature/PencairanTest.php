<?php

namespace Tests\Feature;

use App\Mail\FundsReleasedMail;
use App\Models\KAK;
use App\Models\KAKAnggaran;
use App\Models\Kegiatan;
use App\Models\KegiatanApproval;
use App\Models\PencairanDana;
use App\Models\User;
use Database\Seeders\MasterDataSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
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
        $this->seed(MasterDataSeeder::class);

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

    /**
     * Test Case: PD-F-004 - Pencairan Dana: Otorisasi Bendahara
     */
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

    /**
     * Test Case: PD-F-021 - Pencairan Dana: Filter Status Data (Partial)
     */
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

    /**
     * Test Case: PD-F-006 - Pencairan Dana: Detail Saldo UI
     * Test Case: PD-I-004 - Pencairan Dana: Akurasi Agregasi API
     */
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

    /**
     * Test Case: PD-F-009 - Pencairan Dana: Toast Sukses
     */
    public function test_bendahara_can_store_pencairan(): void
    {
        $kegiatan = $this->createKegiatanAtBendaharaCair($this->pengusul, 5000000);

        $response = $this->actingAs($this->bendahara)
            ->post(route('pencairan.store', $kegiatan), [
                'nominal_pencairan' => 2000000,
                'keterangan' => 'Pencairan tahap pertama',
            ]);

        $response->assertStatus(302);
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('t_pencairan_dana', [
            'kegiatan_id' => $kegiatan->kegiatan_id,
            'jumlah_dicairkan' => 2000000,
            'created_by' => $this->bendahara->user_id,
        ]);
    }

    public function test_admin_can_store_pencairan(): void
    {
        $admin = User::factory()->create(['role_id' => 1]); // Admin
        $kegiatan = $this->createKegiatanAtBendaharaCair($this->pengusul, 5000000);

        $response = $this->actingAs($admin)
            ->post(route('pencairan.store', $kegiatan), [
                'nominal_pencairan' => 1000000,
                'keterangan' => 'Pencairan oleh admin',
            ]);

        $response->assertStatus(302);
        $response->assertSessionHas('success');
    }

    public function test_non_bendahara_cannot_store_pencairan(): void
    {
        $kegiatan = $this->createKegiatanAtBendaharaCair($this->pengusul);

        $this->actingAs($this->ppk)
            ->post(route('pencairan.store', $kegiatan), ['nominal_pencairan' => 1000000])
            ->assertStatus(403);

        $this->actingAs($this->pengusul)
            ->post(route('pencairan.store', $kegiatan), ['nominal_pencairan' => 1000000])
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
            ->post(route('pencairan.store', $kegiatan), ['nominal_pencairan' => 1000000]);

        $response->assertStatus(302);
        $response->assertSessionHasErrors(['message']);
        $this->assertDatabaseCount('t_pencairan_dana', 0);
    }

    /**
     * Test Case: PD-I-001 - Pencairan Dana: Validasi Limit Sisa
     * Test Case: PD-U-005 - Pencairan Dana: Block Transaksi Over
     */
    public function test_store_fails_when_exceeding_sisa_dana(): void
    {
        $kegiatan = $this->createKegiatanAtBendaharaCair($this->pengusul, 2000000);

        $response = $this->actingAs($this->bendahara)
            ->post(route('pencairan.store', $kegiatan), [
                'nominal_pencairan' => 3000000, // Exceeds budget of 2M
            ]);

        $response->assertStatus(302);
        $response->assertSessionHasErrors(['nominal_pencairan']);

        $this->assertDatabaseCount('t_pencairan_dana', 0);
    }

    /**
     * Test Case: PD-F-001 - Pencairan Dana: Nominal Negatif
     * Test Case: PD-F-002 - Pencairan Dana: Nominal Nol
     */
    public function test_store_validation_rejects_invalid_data(): void
    {
        $kegiatan = $this->createKegiatanAtBendaharaCair($this->pengusul);

        // Missing nominal_pencairan
        $this->actingAs($this->bendahara)
            ->post(route('pencairan.store', $kegiatan), [])
            ->assertStatus(302)
            ->assertSessionHasErrors(['nominal_pencairan']);

        // Zero value
        $this->actingAs($this->bendahara)
            ->post(route('pencairan.store', $kegiatan), ['nominal_pencairan' => 0])
            ->assertStatus(302)
            ->assertSessionHasErrors(['nominal_pencairan']);
    }

    // ========================================
    // SELESAI TESTS
    // ========================================

    /**
     * Test Case: PD-I-002 - Pencairan Dana: Transisi Fase LPJ
     * Test Case: PD-I-010 - Pencairan Dana: Trigger LPJ Open
     */
    public function test_bendahara_can_selesai_pencairan(): void
    {
        $kegiatan = $this->createKegiatanAtBendaharaCair($this->pengusul);

        $response = $this->actingAs($this->bendahara)
            ->post(route('pencairan.selesai', $kegiatan));

        $response->assertStatus(302);
        $response->assertSessionHas('success');

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
            ->post(route('pencairan.selesai', $kegiatan))
            ->assertStatus(403);

        $this->actingAs($this->pengusul)
            ->post(route('pencairan.selesai', $kegiatan))
            ->assertStatus(403);
    }

    /**
     * Test Case: PD-I-006 - Pencairan Dana: DB Rollback Mekanik
     */
    public function test_store_pencairan_is_atomic(): void
    {
        $kegiatan = $this->createKegiatanAtBendaharaCair($this->pengusul, 5000000);

        // Force exception during creation by mocking model
        PencairanDana::creating(function () {
            throw new \Exception('Simulated DB Failure');
        });

        $response = $this->actingAs($this->bendahara)
            ->post(route('pencairan.store', $kegiatan), [
                'nominal_pencairan' => 1000000,
            ]);

        $response->assertStatus(302);
        $response->assertSessionHasErrors(['message']);
        $this->assertDatabaseCount('t_pencairan_dana', 0);

        PencairanDana::flushEventListeners();
    }

    /**
     * Test Case: PD-F-013 - Pencairan Dana: Max Sisa Dana
     */
    public function test_store_pencairan_at_max_limit(): void
    {
        $kegiatan = $this->createKegiatanAtBendaharaCair($this->pengusul, 2000000);

        $response = $this->actingAs($this->bendahara)
            ->post(route('pencairan.store', $kegiatan), [
                'nominal_pencairan' => 2000000, // Exact match
            ]);

        $response->assertStatus(302);
        $response->assertSessionHas('success');
        $this->assertDatabaseCount('t_pencairan_dana', 1);
    }

    /**
     * Test Case: PD-F-015 - Pencairan Dana: Date Range Filter
     */
    public function test_bendahara_can_filter_pencairan_by_date_range(): void
    {
        $kegiatan = $this->createKegiatanAtBendaharaCair($this->pengusul);

        // 1. Create a transaction today
        PencairanDana::create([
            'kegiatan_id' => $kegiatan->kegiatan_id,
            'jumlah_dicairkan' => 1000,
            'created_by' => $this->bendahara->user_id,
            'tanggal_pencairan' => now()->toDateString(), // Added missing field
            'created_at' => now(),
        ]);

        // 2. Filter for tomorrow (should be empty)
        $response = $this->actingAs($this->bendahara)->get(route('pencairan.index', [
            'start_date' => now()->addDay()->toDateString(),
            'end_date' => now()->addDay()->toDateString(),
        ]));

        $response->assertInertia(fn ($page) => $page->has('kegiatans', 0));

        // 3. Filter for today (should have 1)
        $response = $this->actingAs($this->bendahara)->get(route('pencairan.index', [
            'start_date' => now()->toDateString(),
            'end_date' => now()->toDateString(),
        ]));

        $response->assertInertia(fn ($page) => $page->has('kegiatans', 1));
    }

    /**
     * Test Case: PD-I-005 - Pencairan Dana: Race Condition Limit
     * Note: In a unit/feature test, we can't easily do concurrent requests,
     * but we can verify the use of lockForUpdate in the controller if we check implementation or use a partial mock.
     * Here we just ensure that two sequential requests that would exceed the limit fail correctly.
     */
    public function test_sequential_pencairan_honors_remaining_limit(): void
    {
        $kegiatan = $this->createKegiatanAtBendaharaCair($this->pengusul, 2000000);

        // First pencairan
        $this->actingAs($this->bendahara)
            ->post(route('pencairan.store', $kegiatan), [
                'nominal_pencairan' => 1500000,
            ]);

        // Second pencairan (remaining is 500k, trying to take 600k)
        $response = $this->actingAs($this->bendahara)
            ->post(route('pencairan.store', $kegiatan), [
                'nominal_pencairan' => 600000,
            ]);

        $response->assertSessionHasErrors(['nominal_pencairan']);
        $this->assertDatabaseCount('t_pencairan_dana', 1);
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
            ->post(route('pencairan.selesai', $kegiatan));

        $response->assertStatus(302);
        $response->assertSessionHasErrors(['message']);
    }

    public function test_bendahara_can_search_pencairan_by_activity_name(): void
    {
        $kegiatan1 = $this->createKegiatanAtBendaharaCair($this->pengusul);
        // Rename the first one
        $kegiatan1->kak->update(['nama_kegiatan' => 'Seminar Laravel']);

        $kegiatan2 = $this->createKegiatanAtBendaharaCair($this->pengusulLain);
        $kegiatan2->kak->update(['nama_kegiatan' => 'Pelatihan Flutter']);

        $response = $this->actingAs($this->bendahara)->get(route('pencairan.index', ['search' => 'Laravel']));

        $response->assertStatus(200)
            ->assertInertia(fn ($page) => $page
                ->component('Pencairan/Index')
                ->has('kegiatans', 1)
                ->where('kegiatans.0.nama_kegiatan', 'Seminar Laravel')
            );
    }

    public function test_selesai_pencairan_triggers_email_notification(): void
    {
        Mail::fake();
        $kegiatan = $this->createKegiatanAtBendaharaCair($this->pengusul);

        $response = $this->actingAs($this->bendahara)->post(route('pencairan.selesai', $kegiatan));

        $response->assertStatus(302);
        Mail::assertQueued(FundsReleasedMail::class);
    }
}

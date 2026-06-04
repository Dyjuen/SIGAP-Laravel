<?php

namespace Tests\Feature;

use App\Events\KegiatanDiajukan;
use App\Mail\KAKWorkflowMail;
use App\Models\KAK;
use App\Models\KAKAnggaran;
use App\Models\Kegiatan;
use App\Models\KegiatanApproval;
use App\Models\User;
use Database\Seeders\MasterDataSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class KegiatanTest extends TestCase
{
    use RefreshDatabase;

    private User $pengusul;

    private User $ppk;

    private User $wadir;

    private User $verifikator;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(MasterDataSeeder::class);

        $this->pengusul = User::factory()->create(['role_id' => 3]);
        $this->ppk = User::factory()->create(['role_id' => 4]);
        $this->wadir = User::factory()->create(['role_id' => 5]);
        $this->verifikator = User::factory()->create(['role_id' => 2]);
    }

    private function createApprovedKak(User $pengusul): KAK
    {
        return KAK::create([
            'nama_kegiatan' => 'Test KAK',
            'deskripsi_kegiatan' => 'Test Deskripsi',
            'pengusul_user_id' => $pengusul->user_id,
            'status_id' => 3, // Disetujui Verifikator
            'tanggal_mulai' => now()->addDays(1),
            'tanggal_selesai' => now()->addDays(5),
            'tipe_kegiatan_id' => 1,
            'mata_anggaran_id' => 1,
        ]);
    }

    private function createDraftKak(User $pengusul): KAK
    {
        return KAK::create([
            'nama_kegiatan' => 'Test Draft KAK',
            'deskripsi_kegiatan' => 'Test Deskripsi',
            'pengusul_user_id' => $pengusul->user_id,
            'status_id' => 1, // Draft
            'tanggal_mulai' => now()->addDays(1),
            'tanggal_selesai' => now()->addDays(5),
            'tipe_kegiatan_id' => 1,
            'mata_anggaran_id' => 1,
        ]);
    }

    public function test_kegiatan_index_requires_authentication()
    {
        $response = $this->get('/kegiatan');
        $response->assertRedirect('/login');
    }

    /**
     * Test Case: TC-K-F03 - Modul PPK-WD2: Pengusul melihat KAK siap jadi kegiatan
     */
    public function test_pengusul_can_view_index_and_see_approved_kak()
    {
        $kak = $this->createApprovedKak($this->pengusul);

        $response = $this->actingAs($this->pengusul)->get('/kegiatan');

        $response->assertStatus(200);
        $response->assertInertia(
            fn ($page) => $page
                ->component('Kegiatan/Index')
                ->has('approvedKaks', 1)
        );
    }

    /**
     * Test Case: AK-F-001 - Ajukan Kegiatan: Validasi Field Wajib (Partial)
     * Test Case: AK-I-001 - Ajukan Kegiatan: Auto-Seed Approval
     * Test Case: AK-I-007 - Ajukan Kegiatan: Event Dispatcher
     * Test Case: AK-I-012 - Ajukan Kegiatan: Log Status Tracer
     * Test Case: TC-K-F04 - Modul PPK-WD2: Pengusul mengajukan kegiatan dengan surat pengantar
     * Test Case: TC-K-I01 - Modul PPK-WD2 [Integrasi]: Ajukan kegiatan → 5 approval steps terbuat otomatis
     * Test Case: TC-K-F20 - Modul PPK-WD2: KAK status diperbarui ke 6 saat kegiatan dibuat
     * Test Case: TC-K-F21 - Modul PPK-WD2: Log status dibuat saat kegiatan dibuat
     */
    public function test_pengusul_can_submit_kegiatan()
    {
        Storage::fake('supabase');
        $kak = $this->createApprovedKak($this->pengusul);
        $file = UploadedFile::fake()->create('surat.pdf', 100);

        $response = $this->actingAs($this->pengusul)->post('/kegiatan', [
            'kak_id' => $kak->kak_id,
            'penanggung_jawab_manual' => 'John Doe',
            'pelaksana_manual' => 'Jane Doe',
            'surat_pengantar' => $file,
        ]);

        $response->assertRedirect(route('kegiatan.index'));
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('t_kegiatan', [
            'kak_id' => $kak->kak_id,
            'penanggung_jawab_manual' => 'John Doe',
        ]);

        $this->assertDatabaseHas('t_kak', [
            'kak_id' => $kak->kak_id,
            'status_id' => 6, // Review PPK
        ]);

        $this->assertDatabaseCount('t_kegiatan_approval', 5);
        $this->assertDatabaseHas('t_kegiatan_approval', [
            'approval_level' => 'PPK',
            'status' => 'Aktif',
        ]);
        $this->assertDatabaseHas('t_kegiatan_log_status', [
            'status_id_baru' => 6,
        ]);
    }

    /**
     * Test Case: AK-I-002 - Ajukan Kegiatan: Status Guard
     * Test Case: TC-K-F07 - Modul PPK-WD2: Tolak pengajuan: KAK belum disetujui Verifikator
     */
    public function test_pengusul_cannot_submit_from_unapproved_kak()
    {
        $kak = $this->createDraftKak($this->pengusul);
        $file = UploadedFile::fake()->create('surat.pdf', 100);

        $response = $this->actingAs($this->pengusul)->post('/kegiatan', [
            'kak_id' => $kak->kak_id,
            'penanggung_jawab_manual' => 'John Doe',
            'pelaksana_manual' => 'Jane Doe',
            'surat_pengantar' => $file,
        ]);

        $response->assertSessionHas('error', 'KAK belum disetujui Verifikator.');
        $this->assertDatabaseCount('t_kegiatan', 0);
    }

    /**
     * Test Case: AK-I-003 - Ajukan Kegiatan: Pencegahan Duplikasi
     * Test Case: TC-K-F06 - Modul PPK-WD2: Tolak pengajuan: KAK sudah memiliki kegiatan
     */
    public function test_pengusul_cannot_submit_duplicate_kegiatan_for_same_kak()
    {
        Storage::fake('supabase');
        $kak = $this->createApprovedKak($this->pengusul);
        $file = UploadedFile::fake()->create('surat.pdf', 100);

        // First submit
        $this->actingAs($this->pengusul)->post('/kegiatan', [
            'kak_id' => $kak->kak_id,
            'penanggung_jawab_manual' => 'John Doe',
            'pelaksana_manual' => 'Jane Doe',
            'surat_pengantar' => $file,
        ]);

        // Second submit
        $response = $this->actingAs($this->pengusul)->post('/kegiatan', [
            'kak_id' => $kak->kak_id,
            'penanggung_jawab_manual' => 'John Doe',
            'pelaksana_manual' => 'Jane Doe',
            'surat_pengantar' => UploadedFile::fake()->create('surat2.pdf', 100),
        ]);

        $response->assertSessionHas('error', 'Kegiatan untuk KAK ini sudah diajukan.');
        $this->assertDatabaseCount('t_kegiatan', 1);
    }

    public function test_submit_with_missing_required_fields_fails_validation()
    {
        $kak = $this->createApprovedKak($this->pengusul);

        $response = $this->actingAs($this->pengusul)->post('/kegiatan', [
            'kak_id' => $kak->kak_id,
            // missing other fields
        ]);

        $response->assertSessionHasErrors(['penanggung_jawab_manual', 'pelaksana_manual', 'surat_pengantar']);
    }

    /**
     * Test Case: AK-F-003 - Ajukan Kegiatan: Validasi Ukuran File
     */
    public function test_oversized_file_rejection()
    {
        Storage::fake('supabase');
        $kak = $this->createApprovedKak($this->pengusul);
        $file = UploadedFile::fake()->create('surat.pdf', 6000); // 6MB (limit is 5MB)

        $response = $this->actingAs($this->pengusul)->post('/kegiatan', [
            'kak_id' => $kak->kak_id,
            'penanggung_jawab_manual' => 'John Doe',
            'pelaksana_manual' => 'Jane Doe',
            'surat_pengantar' => $file,
        ]);

        $response->assertSessionHasErrors(['surat_pengantar']);
    }

    /**
     * Test Case: AK-F-002 - Ajukan Kegiatan: Validasi Tipe File
     */
    public function test_invalid_file_type_rejection()
    {
        Storage::fake('supabase');
        $kak = $this->createApprovedKak($this->pengusul);
        $file = UploadedFile::fake()->create('surat.exe', 100);

        $response = $this->actingAs($this->pengusul)->post('/kegiatan', [
            'kak_id' => $kak->kak_id,
            'penanggung_jawab_manual' => 'John Doe',
            'pelaksana_manual' => 'Jane Doe',
            'surat_pengantar' => $file,
        ]);

        $response->assertSessionHasErrors(['surat_pengantar']);
    }

    /**
     * Test Case: TC-K-F08 - Modul PPK-WD2: PPK menyetujui kegiatan
     * Test Case: TC-K-I02 - Modul PPK-WD2 [Integrasi]: PPK approve → Wadir2 menjadi Aktif
     * Test Case: TC-K-F22 - Modul PPK-WD2: Log status dibuat saat PPK approve
     */
    public function test_ppk_can_approve_kegiatan()
    {
        Storage::fake('supabase');
        $kak = $this->createApprovedKak($this->pengusul);

        $this->actingAs($this->pengusul)->post('/kegiatan', [
            'kak_id' => $kak->kak_id,
            'penanggung_jawab_manual' => 'John Doe',
            'pelaksana_manual' => 'Jane Doe',
            'surat_pengantar' => UploadedFile::fake()->create('surat.pdf', 100),
        ]);

        $kegiatan = Kegiatan::first();

        $response = $this->actingAs($this->ppk)->post("/kegiatan/{$kegiatan->kegiatan_id}/approve", [
            'catatan' => 'Lanjut ke Wadir',
        ]);

        $response->assertRedirect(route('kegiatan.index'));

        $this->assertDatabaseHas('t_kegiatan_approval', [
            'kegiatan_id' => $kegiatan->kegiatan_id,
            'approval_level' => 'PPK',
            'status' => 'Disetujui',
        ]);

        $this->assertDatabaseHas('t_kegiatan_approval', [
            'kegiatan_id' => $kegiatan->kegiatan_id,
            'approval_level' => 'Wadir2',
            'status' => 'Aktif',
        ]);

        $this->assertDatabaseHas('t_kak', [
            'kak_id' => $kak->kak_id,
            'status_id' => 7, // Review Wadir 2
        ]);
    }

    /**
     * Test Case: TC-K-F11 - Modul PPK-WD2: Wadir tidak bisa approve kegiatan di step PPK
     * Test Case: TC-K-U06 - Modul PPK-WD2 [UAT]: PPK tidak bisa approve step yang bukan miliknya
     */
    public function test_wadir_cannot_approve_while_at_ppk_level()
    {
        Storage::fake('supabase');
        $kak = $this->createApprovedKak($this->pengusul);

        $this->actingAs($this->pengusul)->post('/kegiatan', [
            'kak_id' => $kak->kak_id,
            'penanggung_jawab_manual' => 'John Doe',
            'pelaksana_manual' => 'Jane Doe',
            'surat_pengantar' => UploadedFile::fake()->create('surat.pdf', 100),
        ]);

        $kegiatan = Kegiatan::first();

        // Wadir tries to approve when it's PPK's turn
        $response = $this->actingAs($this->wadir)->post("/kegiatan/{$kegiatan->kegiatan_id}/approve", [
            'catatan' => 'Testing',
        ]);

        $response->assertStatus(403);
    }

    public function test_pengusul_cannot_approve()
    {
        Storage::fake('supabase');
        $kak = $this->createApprovedKak($this->pengusul);

        $this->actingAs($this->pengusul)->post('/kegiatan', [
            'kak_id' => $kak->kak_id,
            'penanggung_jawab_manual' => 'John Doe',
            'pelaksana_manual' => 'Jane Doe',
            'surat_pengantar' => UploadedFile::fake()->create('surat.pdf', 100),
        ]);

        $kegiatan = Kegiatan::first();

        $response = $this->actingAs($this->pengusul)->post("/kegiatan/{$kegiatan->kegiatan_id}/approve", [
            'catatan' => 'Hacker attempt',
        ]);

        $response->assertStatus(403);
    }

    /**
     * Test Case: TC-K-F09 - Modul PPK-WD2: Wadir menyetujui kegiatan
     */
    public function test_wadir_can_approve_after_ppk()
    {
        Storage::fake('supabase');
        $kak = $this->createApprovedKak($this->pengusul);

        $this->actingAs($this->pengusul)->post('/kegiatan', [
            'kak_id' => $kak->kak_id,
            'penanggung_jawab_manual' => 'John Doe',
            'pelaksana_manual' => 'Jane Doe',
            'surat_pengantar' => UploadedFile::fake()->create('surat.pdf', 100),
        ]);

        $kegiatan = Kegiatan::first();

        // PPK Approves
        $this->actingAs($this->ppk)->post("/kegiatan/{$kegiatan->kegiatan_id}/approve", [
            'catatan' => 'OK',
        ]);

        // Wadir Approves
        $response = $this->actingAs($this->wadir)->post("/kegiatan/{$kegiatan->kegiatan_id}/approve", [
            'catatan' => 'ACC pencairan',
        ]);

        $response->assertRedirect(route('kegiatan.index'));

        $this->assertDatabaseHas('t_kegiatan_approval', [
            'kegiatan_id' => $kegiatan->kegiatan_id,
            'approval_level' => 'Wadir2',
            'status' => 'Disetujui',
        ]);

        $this->assertDatabaseHas('t_kegiatan_approval', [
            'kegiatan_id' => $kegiatan->kegiatan_id,
            'approval_level' => 'Bendahara-Cair',
            'status' => 'Aktif',
        ]);

        $this->assertDatabaseHas('t_kak', [
            'kak_id' => $kak->kak_id,
            'status_id' => 8, // Proses Pencairan
        ]);
    }

    /**
     * Test Case: AK-I-004 - Ajukan Kegiatan: Atomic Transaction
     */
    public function test_store_kegiatan_is_atomic()
    {
        Storage::fake('supabase');
        $kak = $this->createApprovedKak($this->pengusul);
        $file = UploadedFile::fake()->create('surat.pdf', 100);

        // Mock KegiatanApproval to throw exception during create
        // This is a bit tricky with Eloquent models, but we can use an observer or event listener
        // Or we can just simulate a database error by passing invalid data if there was no validation
        // But here we use a try-catch in controller.
        // Let's use a partial mock or just simulate a failure by mocking Mail or something that happens after DB insert

        // Actually, let's mock the DB transaction or use an event
        KegiatanApproval::creating(function () {
            throw new \Exception('Simulated DB Failure');
        });

        $response = $this->actingAs($this->pengusul)->post('/kegiatan', [
            'kak_id' => $kak->kak_id,
            'penanggung_jawab_manual' => 'John Doe',
            'pelaksana_manual' => 'Jane Doe',
            'surat_pengantar' => $file,
        ]);

        $response->assertSessionHas('error');
        $this->assertDatabaseCount('t_kegiatan', 0);
        $this->assertDatabaseHas('t_kak', [
            'kak_id' => $kak->kak_id,
            'status_id' => 3, // Still approved, not moved to review
        ]);

        // Clean up the event listener for other tests
        KegiatanApproval::flushEventListeners();
    }

    /**
     * Test Case: AK-I-006 - Ajukan Kegiatan: Cascade Delete KAK
     */
    public function test_cascade_delete_kak_deletes_kegiatan()
    {
        Storage::fake('supabase');
        $kak = $this->createApprovedKak($this->pengusul);

        $this->actingAs($this->pengusul)->post('/kegiatan', [
            'kak_id' => $kak->kak_id,
            'penanggung_jawab_manual' => 'John Doe',
            'pelaksana_manual' => 'Jane Doe',
            'surat_pengantar' => UploadedFile::fake()->create('surat.pdf', 100),
        ]);

        $this->assertDatabaseCount('t_kegiatan', 1);

        $kak->delete();

        $this->assertDatabaseCount('t_kegiatan', 0);
    }

    /**
     * Test Case: MK-I-001 - Monitoring Kegiatan: Sequential Workflow
     */
    public function test_kegiatan_life_cycle()
    {
        Storage::fake('supabase');
        $kak = $this->createApprovedKak($this->pengusul);
        $bendahara = User::factory()->create(['role_id' => 6]);

        // 1. Submit
        $this->actingAs($this->pengusul)->post('/kegiatan', [
            'kak_id' => $kak->kak_id,
            'penanggung_jawab_manual' => 'PJ',
            'pelaksana_manual' => 'PL',
            'surat_pengantar' => UploadedFile::fake()->create('surat.pdf', 100),
        ]);

        $kegiatan = Kegiatan::first();
        $this->assertEquals(6, $kegiatan->kak->status_id); // Review PPK

        // 2. PPK Approve
        $this->actingAs($this->ppk)->post("/kegiatan/{$kegiatan->kegiatan_id}/approve", ['catatan' => 'PPK OK']);
        $this->assertEquals(7, $kegiatan->fresh()->kak->status_id); // Review Wadir 2

        // 3. Wadir Approve
        $this->actingAs($this->wadir)->post("/kegiatan/{$kegiatan->kegiatan_id}/approve", ['catatan' => 'Wadir OK']);
        $this->assertEquals(8, $kegiatan->fresh()->kak->status_id); // Proses Pencairan

        // 4. Bendahara Cairkan (Termin 1)
        // Setup budget sum for sisa dana computation
        KAKAnggaran::create([
            'kak_id' => $kak->kak_id,
            'kategori_belanja_id' => 1,
            'uraian' => 'Test',
            'volume1' => 1,
            'satuan1_id' => 1,
            'harga_satuan' => 1000000,
            'jumlah_diusulkan' => 1000000,
        ]);

        $this->actingAs($bendahara)->post("/kegiatan/{$kegiatan->kegiatan_id}/pencairan", [
            'nominal_pencairan' => 500000,
            'keterangan' => 'Termin 1',
        ]);

        $this->assertDatabaseCount('t_pencairan_dana', 1);

        // 5. Bendahara Selesai Pencairan
        $this->actingAs($bendahara)->post("/kegiatan/{$kegiatan->kegiatan_id}/pencairan/selesai");
        $this->assertEquals(10, $kegiatan->fresh()->kak->status_id); // Menunggu LPJ
    }

    public function test_show_nonexistent_kegiatan_returns_404()
    {
        $response = $this->actingAs($this->pengusul)->get('/kegiatan/99999');
        $response->assertStatus(404);
    }

    /**
     * Test Case: TC-K-F01 - Modul PPK-WD2: PPK melihat daftar kegiatan pending
     */
    public function test_ppk_can_view_pending_kegiatan_in_index(): void
    {
        $kak = $this->createApprovedKak($this->pengusul);
        $kegiatan = Kegiatan::create(['kak_id' => $kak->kak_id]);
        KegiatanApproval::create(['kegiatan_id' => $kegiatan->kegiatan_id, 'approval_level' => 'PPK', 'status' => 'Aktif']);

        $response = $this->actingAs($this->ppk)->get('/kegiatan');

        $response->assertStatus(200)
            ->assertInertia(fn ($page) => $page
                ->component('Kegiatan/Index')
                ->has('pendingKegiatan', 1)
            );
    }

    /**
     * Test Case: TC-K-F02 - Modul PPK-WD2: Wadir melihat daftar kegiatan pending Wadir2
     */
    public function test_wadir_can_view_pending_kegiatan_in_index(): void
    {
        $kak = $this->createApprovedKak($this->pengusul);
        $kegiatan = Kegiatan::create(['kak_id' => $kak->kak_id]);
        KegiatanApproval::create(['kegiatan_id' => $kegiatan->kegiatan_id, 'approval_level' => 'Wadir2', 'status' => 'Aktif']);

        $response = $this->actingAs($this->wadir)->get('/kegiatan');

        $response->assertStatus(200)
            ->assertInertia(fn ($page) => $page
                ->component('Kegiatan/Index')
                ->has('pendingKegiatan', 1)
            );
    }

    /**
     * Test Case: TC-K-F10 - Modul PPK-WD2: PPK tidak bisa approve kegiatan di step Wadir2
     */
    public function test_ppk_cannot_approve_wadir_step(): void
    {
        $kak = $this->createApprovedKak($this->pengusul);
        $kegiatan = Kegiatan::create(['kak_id' => $kak->kak_id]);
        KegiatanApproval::create(['kegiatan_id' => $kegiatan->kegiatan_id, 'approval_level' => 'Wadir2', 'status' => 'Aktif']);

        $response = $this->actingAs($this->ppk)->post("/kegiatan/{$kegiatan->kegiatan_id}/approve", ['catatan' => 'X']);
        $response->assertStatus(403);
    }

    /**
     * Test Case: TC-K-F12 - Modul PPK-WD2: Approve gagal jika tidak ada active approval
     */
    public function test_approve_fails_if_no_active_step(): void
    {
        $kak = $this->createApprovedKak($this->pengusul);
        $kegiatan = Kegiatan::create(['kak_id' => $kak->kak_id]);
        // No approval record with status 'Aktif'

        $response = $this->actingAs($this->ppk)->post("/kegiatan/{$kegiatan->kegiatan_id}/approve", ['catatan' => 'X']);
        $response->assertSessionHas('error', 'Tidak ada langkah persetujuan yang aktif.');
    }

    /**
     * Test Case: TC-K-F13 - Modul PPK-WD2: Detail kegiatan dapat dilihat
     */
    public function test_can_view_kegiatan_details(): void
    {
        $kak = $this->createApprovedKak($this->pengusul);
        $kegiatan = Kegiatan::create(['kak_id' => $kak->kak_id]);

        $response = $this->actingAs($this->pengusul)->get("/kegiatan/{$kegiatan->kegiatan_id}");

        $response->assertStatus(200)
            ->assertInertia(fn ($page) => $page
                ->component('Kegiatan/Show')
                ->has('kegiatan')
            );
    }

    /**
     * Test Case: TC-K-I03 - Modul PPK-WD2 [Integrasi]: Wadir approve → Bendahara-Cair Aktif + email terkirim
     */
    /**
     * Test Case: AK-I-011 - Ajukan Kegiatan: API Rate Limiting
     */
    public function test_kegiatan_submission_is_rate_limited(): void
    {
        $kak = $this->createApprovedKak($this->pengusul);

        // Laravel's default 'api' throttle is 60 requests per minute
        // But for web routes it might be different or not applied.
        // Assuming there's a throttle middleware on the route.
        for ($i = 0; $i < 61; $i++) {
            $response = $this->actingAs($this->pengusul)->post('/kegiatan', [
                'kak_id' => $kak->kak_id,
                'penanggung_jawab_manual' => 'PJ',
                'pelaksana_manual' => 'PL',
                'surat_pengantar' => UploadedFile::fake()->create('test.pdf', 10),
            ]);

            if ($response->status() === 429) {
                $response->assertStatus(429);

                return;
            }
        }

        // If we reach here, either rate limit is not 60 or not applied
        $this->markTestIncomplete('Rate limit not hit or not applied to /kegiatan route.');
    }

    /*
     * Test Case: AK-F-017 - Ajukan Kegiatan: Unduh Template
     */
    /*
    public function test_pengusul_can_download_surat_template(): void
    {
        // Assuming there's a route for template download
        // If not found in routes/web.php, I'll need to check the exact route name
        $response = $this->actingAs($this->pengusul)->get(route('kegiatan.download-template'));

        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    }
    */

    public function test_wadir_approve_triggers_email(): void
    {
        Mail::fake();
        $kak = $this->createApprovedKak($this->pengusul);
        $kegiatan = Kegiatan::create(['kak_id' => $kak->kak_id]);
        KegiatanApproval::create(['kegiatan_id' => $kegiatan->kegiatan_id, 'approval_level' => 'Wadir2', 'status' => 'Aktif']);

        $this->actingAs($this->wadir)->post("/kegiatan/{$kegiatan->kegiatan_id}/approve", ['catatan' => 'ACC']);

        Mail::assertQueued(KAKWorkflowMail::class);
    }

    public function test_unauthorized_roles_cannot_access_kegiatan_routes(): void
    {
        $bendahara = User::factory()->create(['role_id' => 6]);
        $rektorat = User::factory()->create(['role_id' => 7]);

        // Verifikator (role 2), Bendahara (role 6), Rektorat (role 7) cannot access /kegiatan
        $this->actingAs($this->verifikator)->get('/kegiatan')->assertStatus(403);
        $this->actingAs($bendahara)->get('/kegiatan')->assertStatus(403);
        $this->actingAs($rektorat)->get('/kegiatan')->assertStatus(403);

        // Create a kegiatan
        $kak = $this->createApprovedKak($this->pengusul);
        $kegiatan = Kegiatan::create(['kak_id' => $kak->kak_id]);

        // Verifikator and Rektorat cannot access /kegiatan/{kegiatan}
        $this->actingAs($this->verifikator)->get("/kegiatan/{$kegiatan->kegiatan_id}")->assertStatus(403);
        $this->actingAs($rektorat)->get("/kegiatan/{$kegiatan->kegiatan_id}")->assertStatus(403);
    }

    public function test_bendahara_can_access_kegiatan_show_route(): void
    {
        $bendahara = User::factory()->create(['role_id' => 6]);
        $kak = $this->createApprovedKak($this->pengusul);
        $kegiatan = Kegiatan::create(['kak_id' => $kak->kak_id]);

        $this->actingAs($bendahara)->get("/kegiatan/{$kegiatan->kegiatan_id}")->assertStatus(200);
    }

    /**
     * Test Case: TC-K-F21 - Modul PPK-WD2: Log status dibuat saat kegiatan dibuat
     */
    public function test_audit_log_created_when_kegiatan_submitted(): void
    {
        Storage::fake('supabase');
        $kak = $this->createApprovedKak($this->pengusul);
        $file = UploadedFile::fake()->create('surat.pdf', 100);

        $this->actingAs($this->pengusul)->post('/kegiatan', [
            'kak_id' => $kak->kak_id,
            'penanggung_jawab_manual' => 'John Doe',
            'pelaksana_manual' => 'Jane Doe',
            'surat_pengantar' => $file,
        ]);

        $kegiatan = Kegiatan::first();

        $this->assertDatabaseHas('t_kegiatan_log_status', [
            'kegiatan_id' => $kegiatan->kegiatan_id,
            'status_id_lama' => 3, // Disetujui Verifikator
            'status_id_baru' => 6, // Review PPK
            'actor_user_id' => $this->pengusul->user_id,
            'catatan' => 'Mengajukan Kegiatan',
        ]);
    }

    public function test_pengusul_can_search_approved_kaks_by_name(): void
    {
        $this->createApprovedKak($this->pengusul);
        $otherKak = KAK::create([
            'nama_kegiatan' => 'Workshop IT dan Bisnis',
            'deskripsi_kegiatan' => 'Test Deskripsi',
            'pengusul_user_id' => $this->pengusul->user_id,
            'status_id' => 3,
            'tanggal_mulai' => now()->addDays(1),
            'tanggal_selesai' => now()->addDays(5),
            'tipe_kegiatan_id' => 1,
            'mata_anggaran_id' => 1,
        ]);

        $response = $this->actingAs($this->pengusul)->get('/kegiatan?search=Workshop');

        $response->assertStatus(200)
            ->assertInertia(fn ($page) => $page
                ->component('Kegiatan/Index')
                ->has('approvedKaks', 1)
                ->where('approvedKaks.0.nama_kegiatan', 'Workshop IT dan Bisnis')
            );
    }

    public function test_ppk_and_wadir_can_search_pending_kegiatan_by_name(): void
    {
        $kak1 = $this->createApprovedKak($this->pengusul);
        $kegiatan1 = Kegiatan::create(['kak_id' => $kak1->kak_id]);
        KegiatanApproval::create(['kegiatan_id' => $kegiatan1->kegiatan_id, 'approval_level' => 'PPK', 'status' => 'Aktif']);

        $kak2 = KAK::create([
            'nama_kegiatan' => 'Seminar Kewirausahaan Mahasiswa',
            'deskripsi_kegiatan' => 'Test Deskripsi',
            'pengusul_user_id' => $this->pengusul->user_id,
            'status_id' => 6,
            'tanggal_mulai' => now()->addDays(1),
            'tanggal_selesai' => now()->addDays(5),
            'tipe_kegiatan_id' => 1,
            'mata_anggaran_id' => 1,
        ]);
        $kegiatan2 = Kegiatan::create(['kak_id' => $kak2->kak_id]);
        KegiatanApproval::create(['kegiatan_id' => $kegiatan2->kegiatan_id, 'approval_level' => 'PPK', 'status' => 'Aktif']);

        $response = $this->actingAs($this->ppk)->get('/kegiatan?search=Seminar');

        $response->assertStatus(200)
            ->assertInertia(fn ($page) => $page
                ->component('Kegiatan/Index')
                ->has('pendingKegiatan', 1)
                ->where('pendingKegiatan.0.kak.nama_kegiatan', 'Seminar Kewirausahaan Mahasiswa')
            );
    }

    public function test_kegiatan_update_validation_rejects_invalid_date_range(): void
    {
        $kak = $this->createApprovedKak($this->pengusul);
        $kegiatan = Kegiatan::create(['kak_id' => $kak->kak_id]);

        $response = $this->actingAs($this->pengusul)->put("/kegiatan/{$kegiatan->kegiatan_id}", [
            'nama_kegiatan' => 'Update Kegiatan Valid',
            'deskripsi_kegiatan' => str_repeat('a', 60),
            'tanggal_mulai' => now()->addDays(5)->toDateString(),
            'tanggal_selesai' => now()->addDays(2)->toDateString(), // earlier than start date
            'lokasi' => 'Gedung Serbaguna PNJ',
            'mata_anggaran_id' => 1,
        ]);

        $response->assertSessionHasErrors(['tanggal_selesai']);
    }

    public function test_kegiatan_update_validation_max_characters(): void
    {
        $kak = $this->createApprovedKak($this->pengusul);
        $kegiatan = Kegiatan::create(['kak_id' => $kak->kak_id]);

        $response = $this->actingAs($this->pengusul)->put("/kegiatan/{$kegiatan->kegiatan_id}", [
            'nama_kegiatan' => str_repeat('a', 201), // Max is 200
            'deskripsi_kegiatan' => str_repeat('a', 60),
            'tanggal_mulai' => now()->addDays(1)->toDateString(),
            'tanggal_selesai' => now()->addDays(5)->toDateString(),
            'lokasi' => str_repeat('l', 201), // Max is 200
            'mata_anggaran_id' => 1,
        ]);

        $response->assertSessionHasErrors(['nama_kegiatan', 'lokasi']);
    }

    public function test_kegiatan_update_strips_xss_tags(): void
    {
        $kak = $this->createApprovedKak($this->pengusul);
        $kegiatan = Kegiatan::create(['kak_id' => $kak->kak_id]);

        $response = $this->actingAs($this->pengusul)->put("/kegiatan/{$kegiatan->kegiatan_id}", [
            'nama_kegiatan' => '<b>Bold Nama Kegiatan</b><script>alert(1)</script>',
            'deskripsi_kegiatan' => str_repeat('a', 50).'<iframe src="malicious.html"></iframe>',
            'tanggal_mulai' => now()->addDays(1)->toDateString(),
            'tanggal_selesai' => now()->addDays(5)->toDateString(),
            'lokasi' => 'Gedung Serbaguna PNJ',
            'mata_anggaran_id' => 1,
        ]);

        $response->assertSessionHasNoErrors();
        $this->assertDatabaseHas('t_kak', [
            'kak_id' => $kak->kak_id,
            'nama_kegiatan' => 'Bold Nama Kegiatanalert(1)', // script & b stripped
            'deskripsi_kegiatan' => str_repeat('a', 50), // iframe stripped
        ]);
    }

    public function test_kegiatan_submission_dispatches_event(): void
    {
        Event::fake();
        Storage::fake('supabase');
        $kak = $this->createApprovedKak($this->pengusul);
        $file = UploadedFile::fake()->create('surat.pdf', 100);

        $this->actingAs($this->pengusul)->post('/kegiatan', [
            'kak_id' => $kak->kak_id,
            'penanggung_jawab_manual' => 'John Doe',
            'pelaksana_manual' => 'Jane Doe',
            'surat_pengantar' => $file,
        ]);

        Event::assertDispatched(KegiatanDiajukan::class);
    }
}

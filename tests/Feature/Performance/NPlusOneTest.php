<?php

namespace Tests\Feature\Performance;

use App\Models\KAK;
use App\Models\Kegiatan;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class NPlusOneTest extends TestCase
{
    use RefreshDatabase;

    protected array $queries = [];

    protected function setUp(): void
    {
        parent::setUp();
        $this->queries = [];

        DB::listen(function ($query) {
            $this->queries[] = $query->sql;
        });
    }

    protected function tearDown(): void
    {
        $this->queries = [];
        parent::tearDown();
    }

    protected function assertNoDuplicateSelects(string $endpoint): void
    {
        $selects = collect($this->queries)
            ->filter(fn($sql) => str_starts_with(strtolower($sql), 'select'));

        $duplicates = $selects->countBy()->filter(fn($cnt) => $cnt > 2);

        $this->assertTrue(
            $duplicates->isEmpty(),
            "[$endpoint] Potential N+1 query detected: " . $duplicates->keys()->implode(', ')
        );
    }

    protected function createUserWithRole(int $roleId, ?int $tipeId = null): User
    {
        $roleName = match ($roleId) {
            Role::ADMIN => 'Admin',
            Role::VERIFIKATOR => 'Verifikator',
            Role::PENGUSUL => 'Pengusul',
            Role::PPK => 'PPK',
            Role::WADIR => 'Wadir',
            Role::BENDAHARA => 'Bendahara',
            Role::REKTORAT => 'Rektorat',
            default => 'Unknown',
        };

        DB::table('m_roles')->updateOrInsert(
            ['role_id' => $roleId],
            ['nama_role' => $roleName]
        );

        $username = match ($roleId) {
            Role::VERIFIKATOR => 'verifikator' . ($tipeId ?? 1),
            default => fake()->unique()->userName(),
        };

        return User::factory()->create([
            'role_id' => $roleId,
            'username' => $username,
        ]);
    }

    protected function seedKegiatanWithRelations(int $count): void
    {
        $tipeKegiatan = \App\Models\TipeKegiatan::factory()->create();
        $mataAnggaran = \App\Models\MataAnggaran::factory()->create();
        $kategoriBelanja = \App\Models\KategoriBelanja::factory()->create();
        $satuan = \App\Models\Satuan::factory()->create();

        \App\Models\KegiatanStatus::create(['status_id' => 1, 'nama_status' => 'Draft']);
        $statusApproved = \App\Models\KegiatanStatus::create(['status_id' => 10, 'nama_status' => 'Approved']);

        $pengusul = $this->createUserWithRole(Role::PENGUSUL);
        $admin = $this->createUserWithRole(Role::ADMIN);

        $kaks = KAK::factory($count)->create([
            'pengusul_user_id' => $pengusul->user_id,
            'status_id' => $statusApproved->status_id,
            'mata_anggaran_id' => $mataAnggaran->mata_anggaran_id,
        ]);

        $now = now();
        foreach ($kaks as $kak) {
            $kegiatan = Kegiatan::factory()->create(['kak_id' => $kak->kak_id]);

            \App\Models\KAKAnggaran::factory(2)->create([
                'kak_id' => $kak->kak_id,
                'kategori_belanja_id' => $kategoriBelanja->kategori_belanja_id,
                'satuan1_id' => $satuan->satuan_id,
                'jumlah_diusulkan' => 1000000,
            ]);

            DB::table('t_pencairan_dana')->insert([
                'kegiatan_id' => $kegiatan->kegiatan_id,
                'created_by' => $admin->user_id,
                'jumlah_dicairkan' => 500000,
                'tanggal_pencairan' => $now->toDateString(),
                'created_at' => $now,
            ]);
        }
    }

    protected function resetQueries(): void
    {
        $this->queries = [];
    }

    public function test_kegiatan_index_has_no_n_plus_one(): void
    {
        $this->seedKegiatanWithRelations(3);
        $user = $this->createUserWithRole(Role::PPK);
        $this->resetQueries();

        $this->actingAs($user)
            ->get(route('kegiatan.index'))
            ->assertOk();

        $this->assertNoDuplicateSelects('kegiatan.index');
    }

    public function test_kak_index_has_no_n_plus_one(): void
    {
        $this->seedKegiatanWithRelations(3);
        $user = $this->createUserWithRole(Role::PENGUSUL);
        $this->resetQueries();

        $this->actingAs($user)
            ->get(route('kak.index'))
            ->assertOk();

        $this->assertNoDuplicateSelects('kak.index');
    }

    public function test_lpj_index_has_no_n_plus_one(): void
    {
        $this->seedKegiatanWithRelations(3);
        $user = $this->createUserWithRole(Role::ADMIN);
        $this->resetQueries();

        $this->actingAs($user)
            ->get(route('lpj.index'))
            ->assertOk();

        $this->assertNoDuplicateSelects('lpj.index');
    }

    public function test_pencairan_index_has_no_n_plus_one(): void
    {
        $this->seedKegiatanWithRelations(3);
        $user = $this->createUserWithRole(Role::ADMIN);
        $this->resetQueries();

        $this->actingAs($user)
            ->get(route('pencairan.index'))
            ->assertOk();

        $this->assertNoDuplicateSelects('pencairan.index');
    }

    public function test_dashboard_has_no_n_plus_one(): void
    {
        $this->seedKegiatanWithRelations(3);
        $user = $this->createUserWithRole(Role::ADMIN);
        $this->resetQueries();

        $this->actingAs($user)
            ->get(route('dashboard'))
            ->assertOk();

        $this->assertNoDuplicateSelects('dashboard');
    }

    public function test_monitoring_has_no_n_plus_one(): void
    {
        $this->seedKegiatanWithRelations(3);
        $user = $this->createUserWithRole(Role::ADMIN);
        $this->resetQueries();

        $this->actingAs($user)
            ->get(route('kegiatan.monitoring'))
            ->assertOk();

        $this->assertNoDuplicateSelects('kegiatan.monitoring');
    }

    public function test_api_kak_index_has_no_n_plus_one(): void
    {
        $this->seedKegiatanWithRelations(3);
        $user = $this->createUserWithRole(Role::ADMIN);
        $this->resetQueries();

        $this->actingAs($user)
            ->getJson('/api/kak')
            ->assertOk();

        $this->assertNoDuplicateSelects('api/kak');
    }

    public function test_api_admin_logs_has_no_n_plus_one(): void
    {
        $this->seedKegiatanWithRelations(3);
        $user = $this->createUserWithRole(Role::ADMIN);
        $this->resetQueries();

        $this->actingAs($user)
            ->getJson('/api/admin/logs')
            ->assertOk();

        $this->assertNoDuplicateSelects('api/admin/logs');
    }
}

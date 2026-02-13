<?php

namespace Tests\Feature;

use App\Models\MataAnggaran;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class SeederTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test if all tables are created and seeded correctly.
     */
    public function test_database_schema_and_seeding(): void
    {
        // 1. Run Migrations & Seeders
        $this->seed();

        // 2. Verify Master Data Tables Exist
        $masterTables = [
            'm_roles',
            'm_tipe_kegiatan',
            'm_kegiatan_status',
            'm_satuan',
            'm_mata_anggaran',
            'm_iku',
            'm_kategori_belanja',
            'm_users',
            'm_panduan',
        ];

        foreach ($masterTables as $table) {
            $this->assertTrue(Schema::hasTable($table), "Table {$table} does not exist.");
        }

        // 3. Verify Transaction Data Tables Exist
        $transactionTables = [
            't_kak',
            't_kak_anggaran',
            't_kak_approval',
            't_kak_iku',
            't_kak_indikator',
            't_kak_log_status',
            't_kak_manfaat',
            't_kak_tahapan',
            't_kak_target',
            't_kegiatan',
            't_kegiatan_anggaran',
            't_kegiatan_approval',
            't_kegiatan_lampiran',
            't_kegiatan_log_status',
            't_notifikasi',
            't_pencairan_dana',
        ];

        foreach ($transactionTables as $table) {
            $this->assertTrue(Schema::hasTable($table), "Table {$table} does not exist.");
        }

        // 4. Verify Data Count (Master Data)
        $this->assertEquals(7, Role::count(), 'Expected 7 roles, found '.Role::count());
        $this->assertEquals(16, User::count(), 'Expected 16 users, found '.User::count());
        $this->assertEquals(3, MataAnggaran::count(), 'Expected 3 budget sources, found '.MataAnggaran::count());

        // 5. Verify Specific Data
        $admin = User::where('username', 'admin')->first();
        $this->assertNotNull($admin);
        $this->assertEquals('Administrator', $admin->nama_lengkap);
        $this->assertEquals(1, $admin->role_id);
    }
}

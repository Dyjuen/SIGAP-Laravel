<?php

declare(strict_types=1);

use Phinx\Seed\AbstractSeed;

class NotificationSeeder extends AbstractSeed
{
    public function run(): void
    {
        // ============================================
        // 1. CLEAR ALL DATA
        // ============================================
        $this->execute('SET FOREIGN_KEY_CHECKS = 0');
        $this->execute('TRUNCATE TABLE t_notifikasi');
        $this->execute('SET FOREIGN_KEY_CHECKS = 1');

        // ============================================
        // 2. SEED NOTIFICATIONS
        // ============================================
        $this->table('t_notifikasi')->insert([
            [
                'penerima_user_id' => 2, // Verifikator
                'pesan' => 'Kegiatan "Pelatihan Internal Desain Grafis" membutuhkan verifikasi Anda.',
                'link_tujuan' => '/verifikator/kegiatan/1',
                'is_read' => 0,
            ],
            [
                'penerima_user_id' => 4, // PPK
                'pesan' => 'Kegiatan "Pengadaan Server Baru untuk Lab" membutuhkan persetujuan Anda.',
                'link_tujuan' => '/ppk/kegiatan/2',
                'is_read' => 0,
            ],
            [
                'penerima_user_id' => 5, // Wadir
                'pesan' => 'Kegiatan "Lomba Debat Mahasiswa Nasional" membutuhkan persetujuan Anda.',
                'link_tujuan' => '/wadir/kegiatan/3',
                'is_read' => 1,
            ],
            [
                'penerima_user_id' => 6, // Bendahara
                'pesan' => 'Kegiatan "Kerjasama Industri dengan PT. ABC" membutuhkan persetujuan pencairan dana.',
                'link_tujuan' => '/bendahara/kegiatan/4',
                'is_read' => 0,
            ],
        ])->saveData();

        echo "✅ Notifications seeded successfully!\n";
    }
}

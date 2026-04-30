<?php

declare(strict_types=1);

use Phinx\Seed\AbstractSeed;

class KegiatanSeeder extends AbstractSeed
{
    public function run(): void
    {
        // ============================================
        // 1. CLEAR EXISTING TRANSACTIONAL DATA
        // ============================================
        $this->execute('SET FOREIGN_KEY_CHECKS = 0');

        $this->execute('TRUNCATE TABLE t_kegiatan_log_status');
        $this->execute('TRUNCATE TABLE t_kegiatan_anggaran');
        $this->execute('TRUNCATE TABLE t_kegiatan_approval');
        $this->execute('TRUNCATE TABLE t_kegiatan_lampiran');
        $this->execute('TRUNCATE TABLE t_kegiatan');
        $this->execute('TRUNCATE TABLE t_kak_approval');
        $this->execute('TRUNCATE TABLE t_kak_log_status');
        $this->execute('TRUNCATE TABLE t_kak_iku');
        $this->execute('TRUNCATE TABLE t_kak_manfaat');
        $this->execute('TRUNCATE TABLE t_kak_tahapan');
        $this->execute('TRUNCATE TABLE t_kak_indikator');
        $this->execute('TRUNCATE TABLE t_kak_target');
        $this->execute('TRUNCATE TABLE t_kak_anggaran');
        $this->execute('TRUNCATE TABLE t_kak');

        $this->execute('SET FOREIGN_KEY_CHECKS = 1');

        // User IDs for seeding
        $pengusulId = 3;
        $verifikatorId = 2;
        $ppkId = 4;
        $wadirId = 5;
        $bendaharaId = 6;

        // Status IDs
        $statusDraft = 1;
        $statusReviewVerifikator = 2;
        $statusDisetujuiVerifikator = 3;
        $statusDitolak = 4;
        $statusRevisi = 5;
        $statusProsesPencairan = 6;
        $statusSelesai = 10;

        // ============================================
        // SCENARIO 1: KAK in "Draft"
        // ============================================
        $kak1 = [
            'tipe_kegiatan_id' => 3, // Kemahasiswaan
            'nama_kegiatan' => 'Orientasi Mahasiswa Baru 2025',
            'deskripsi_kegiatan' => 'Kegiatan pengenalan kampus bagi mahasiswa baru tahun ajaran 2025/2026.',
            'pengusul_user_id' => $pengusulId,
            'mata_anggaran_id' => 2, // PNBP
            'status_id' => $statusDraft,
        ];
        $this->table('t_kak')->insert($kak1)->saveData();
        $kak1Id = $this->getAdapter()->getConnection()->lastInsertId();

        $this->table('t_kak_anggaran')->insert([
            ['kak_id' => $kak1Id, 'uraian' => 'Cetak Spanduk Selamat Datang', 'volume1' => 2, 'satuan1_id' => 8, 'harga_satuan' => 250000, 'jumlah_diusulkan' => 500000],
        ])->saveData();

        // ============================================
        // SCENARIO 2: KAK in "Revisi" from Verifikator
        // ============================================
        $kak2 = [
            'tipe_kegiatan_id' => 1, // Akademik
            'nama_kegiatan' => 'Pelatihan Sertifikasi Kompetensi Dosen',
            'deskripsi_kegiatan' => 'Program peningkatan kompetensi dosen melalui sertifikasi bertaraf nasional.',
            'pengusul_user_id' => $pengusulId,
            'mata_anggaran_id' => 1, // APBN
            'status_id' => $statusRevisi,
            'catatan_deskripsi_kegiatan' => 'Mohon diperjelas lagi skema sertifikasi yang akan diambil.',
        ];
        $this->table('t_kak')->insert($kak2)->saveData();
        $kak2Id = $this->getAdapter()->getConnection()->lastInsertId();

        $this->table('t_kak_anggaran')->insert([
            ['kak_id' => $kak2Id, 'uraian' => 'Biaya Ujian Sertifikasi', 'volume1' => 10, 'satuan1_id' => 2, 'harga_satuan' => 1000000, 'jumlah_diusulkan' => 10000000],
        ])->saveData();

        $this->table('t_kak_approval')->insert([
            ['kak_id' => $kak2Id, 'approver_user_id' => $verifikatorId, 'status' => 'Revisi', 'catatan' => 'Anggaran perlu dirinci per jenis sertifikasi. Deskripsi juga perlu diperjelas.'],
        ])->saveData();

        $this->table('t_kak_log_status')->insert([
            ['kak_id' => $kak2Id, 'status_id_lama' => $statusReviewVerifikator, 'status_id_baru' => $statusRevisi, 'actor_user_id' => $verifikatorId, 'catatan' => 'Dikembalikan untuk revisi.'],
        ])->saveData();

        // ============================================
        // SCENARIO 3: KAK "Siap Diajukan" (Menunggu Review Verifikator)
        // ============================================
        $kak3 = [
            'tipe_kegiatan_id' => 4, // Kerja Sama
            'nama_kegiatan' => 'Penandatanganan MoU dengan Industri Telekomunikasi',
            'deskripsi_kegiatan' => 'Acara seremonial untuk meresmikan kerja sama strategis antara PNJ dan PT Telco Indonesia.',
            'metode_pelaksanaan' => 'Offline di Aula PNJ',
            'pengusul_user_id' => $pengusulId,
            'mata_anggaran_id' => 3, // Hibah
            'status_id' => $statusReviewVerifikator,
        ];
        $this->table('t_kak')->insert($kak3)->saveData();
        $kak3Id = $this->getAdapter()->getConnection()->lastInsertId();

        $this->table('t_kak_anggaran')->insert([
            ['kak_id' => $kak3Id, 'uraian' => 'Jamuan Makan Siang VIP', 'volume1' => 25, 'satuan1_id' => 2, 'harga_satuan' => 150000, 'jumlah_diusulkan' => 3750000],
        ])->saveData();

        $this->table('t_kak_log_status')->insert([
            ['kak_id' => $kak3Id, 'status_id_lama' => $statusDraft, 'status_id_baru' => $statusReviewVerifikator, 'actor_user_id' => $pengusulId, 'catatan' => 'Mengajukan usulan KAK.'],
        ])->saveData();

        // ============================================
        // SCENARIO 4: Kegiatan "Menunggu ACC Wadir 2"
        // ============================================
        $kak4 = [
            'tipe_kegiatan_id' => 2,
            'nama_kegiatan' => 'Upgrade Infrastruktur Jaringan Gedung Jurusan',
            'deskripsi_kegiatan' => 'Peningkatan kapasitas dan kecepatan jaringan internet di Gedung JTK dan Gedung Administrasi Niaga.',
            'pengusul_user_id' => $pengusulId,
            'mata_anggaran_id' => 1,
            'status_id' => $statusProsesPencairan,
        ];
        $this->table('t_kak')->insert($kak4)->saveData();
        $kak4Id = $this->getAdapter()->getConnection()->lastInsertId();

        // --- Corresponding Kegiatan record ---
        $kegiatan4 = ['kak_id' => $kak4Id];
        $this->table('t_kegiatan')->insert($kegiatan4)->saveData();
        $kegiatan4Id = $this->getAdapter()->getConnection()->lastInsertId();

        // --- Approval Flow ---
        $this->table('t_kegiatan_approval')->insert([
            ['kegiatan_id' => $kegiatan4Id, 'approval_level' => 'Verifikator', 'approver_user_id' => $verifikatorId, 'status' => 'Disetujui', 'catatan' => 'OK'],
            ['kegiatan_id' => $kegiatan4Id, 'approval_level' => 'PPK', 'approver_user_id' => $ppkId, 'status' => 'Disetujui', 'catatan' => 'Setuju, lanjutkan.'],
            ['kegiatan_id' => $kegiatan4Id, 'approval_level' => 'Wadir2', 'status' => 'Menunggu'],
            ['kegiatan_id' => $kegiatan4Id, 'approval_level' => 'Bendahara-Cair', 'status' => 'Menunggu'],
        ])->saveData();

        echo "✅ Kegiatan seeder completed successfully!\n";
        echo "   - Scenario 1 (Draft): KAK ID $kak1Id\n";
        echo "   - Scenario 2 (Revisi): KAK ID $kak2Id\n";
        echo "   - Scenario 3 (Review Verifikator): KAK ID $kak3Id\n";
        echo "   - Scenario 4 (Menunggu Wadir2): Kegiatan ID $kegiatan4Id\n";
    }
}

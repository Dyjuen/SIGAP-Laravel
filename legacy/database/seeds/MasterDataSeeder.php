<?php

declare(strict_types=1);

use Phinx\Seed\AbstractSeed;

class MasterDataSeeder extends AbstractSeed
{
    public function run(): void
    {
        // Disable foreign key checks to avoid issues with truncation order
        $this->execute('SET FOREIGN_KEY_CHECKS = 0');

        // Truncate tables in reverse order of dependency
        $this->execute('TRUNCATE TABLE m_users');
        $this->execute('TRUNCATE TABLE m_iku');
        $this->execute('TRUNCATE TABLE m_mata_anggaran');
        $this->execute('TRUNCATE TABLE m_satuan');
        $this->execute('TRUNCATE TABLE m_tipe_kegiatan');
        $this->execute('TRUNCATE TABLE m_kegiatan_status');
        $this->execute('TRUNCATE TABLE m_kategori_belanja');
        $this->execute('TRUNCATE TABLE m_roles');

        // Re-enable foreign key checks
        $this->execute('SET FOREIGN_KEY_CHECKS = 1');

        // ============================================
        // 1. ROLES
        // ============================================
        $roles = [
            ['nama_role' => 'Admin'],
            ['nama_role' => 'Verifikator'],
            ['nama_role' => 'Pengusul'],
            ['nama_role' => 'PPK'],
            ['nama_role' => 'Wadir'],
            ['nama_role' => 'Bendahara'],
            ['nama_role' => 'Rektorat'],
        ];
        $this->table('m_roles')->insert($roles)->saveData();

        // ============================================
        // 2. TIPE KEGIATAN
        // ============================================
        $tipeKegiatan = [
            ['nama_tipe' => 'Bidang 1 - Akademik'],
            ['nama_tipe' => 'Bidang 2 - Umum & Keuangan'],
            ['nama_tipe' => 'Bidang 3 - Kemahasiswaan'],
            ['nama_tipe' => 'Bidang 4 - Kerja Sama'],
        ];
        $this->table('m_tipe_kegiatan')->insert($tipeKegiatan)->saveData();

        // ============================================
        // 3. KEGIATAN STATUS
        // ============================================
        $status = [
            ['nama_status' => 'Draft'],
            ['nama_status' => 'Review Verifikator'],
            ['nama_status' => 'Disetujui Verifikator'],
            ['nama_status' => 'Ditolak'],
            ['nama_status' => 'Revisi'],
            ['nama_status' => 'Review PPK'],
            ['nama_status' => 'Review Wadir 2'],
            ['nama_status' => 'Proses Pencairan'],
            ['nama_status' => 'Uang Muka Dicairkan'],
            ['nama_status' => 'Menunggu LPJ'],
            ['nama_status' => 'Review LPJ'],
            ['nama_status' => 'LPJ Direvisi'],
            ['nama_status' => 'Setor Fisik Dokumen'],
            ['nama_status' => 'Selesai'],
        ];
        $this->table('m_kegiatan_status')->insert($status)->saveData();

        // ============================================
        // 4. SATUAN
        // ============================================
        $satuan = [
            ['nama_satuan' => 'OJ'], ['nama_satuan' => 'Orang'], ['nama_satuan' => 'Unit'],
            ['nama_satuan' => 'Paket'], ['nama_satuan' => 'Lembar'], ['nama_satuan' => 'Hari'],
            ['nama_satuan' => 'Bulan'], ['nama_satuan' => 'Set'], ['nama_satuan' => 'Pcs'],
            ['nama_satuan' => 'Kg'], ['nama_satuan' => 'Rim'], ['nama_satuan' => 'Kali'],
            ['nama_satuan' => '%'],
        ];
        $this->table('m_satuan')->insert($satuan)->saveData();

        // ============================================
        // 5. MATA ANGGARAN
        // ============================================
        $mataAnggaran = [
            [
                'kode_anggaran' => 'APBN-2025',
                'nama_sumber_dana' => 'APBN (Anggaran Pendapatan dan Belanja Negara)',
                'tahun_anggaran' => 2025,
                'total_pagu' => 5000000000.00,
            ],
            [
                'kode_anggaran' => 'PNBP-2025',
                'nama_sumber_dana' => 'PNBP (Penerimaan Negara Bukan Pajak)',
                'tahun_anggaran' => 2025,
                'total_pagu' => 2000000000.00,
            ],
            [
                'kode_anggaran' => 'HIBAH-2025',
                'nama_sumber_dana' => 'Dana Hibah',
                'tahun_anggaran' => 2025,
                'total_pagu' => 500000000.00,
            ],
        ];
        $this->table('m_mata_anggaran')->insert($mataAnggaran)->saveData();

        // ============================================
        // 6. IKU (8 IKU FIXED)
        // ============================================
        $iku = [
            ['kode_iku' => 'IKU-1', 'nama_iku' => 'Lulusan Mendapat Pekerjaan yang Layak'],
            ['kode_iku' => 'IKU-2', 'nama_iku' => 'Mahasiswa Mendapat Pengalaman di Luar Kampus'],
            ['kode_iku' => 'IKU-3', 'nama_iku' => 'Dosen Berkegiatan di Luar Kampus'],
            ['kode_iku' => 'IKU-4', 'nama_iku' => 'Praktisi Mengajar di Dalam Kampus'],
            ['kode_iku' => 'IKU-5', 'nama_iku' => 'Hasil Kerja Dosen Digunakan oleh Masyarakat'],
            ['kode_iku' => 'IKU-6', 'nama_iku' => 'Program Studi Bekerjasama dengan Mitra Kelas Dunia'],
            ['kode_iku' => 'IKU-7', 'nama_iku' => 'Kelas yang Kolaboratif dan Partisipatif'],
            ['kode_iku' => 'IKU-8', 'nama_iku' => 'Program Studi Berstandar Internasional'],
        ];
        $this->table('m_iku')->insert($iku)->saveData();

        // ============================================
        // 7. KATEGORI BELANJA
        // ============================================
        $kategoriBelanja = [
            [
                'kode' => 'BRG',
                'nama' => 'Belanja Barang',
                'keterangan' => 'Belanja untuk pengadaan barang habis pakai, ATK, konsumsi, dll',
                'urutan' => 1,
                'is_active' => true,
            ],
            [
                'kode' => 'JSA',
                'nama' => 'Belanja Jasa',
                'keterangan' => 'Belanja untuk pembayaran jasa seperti honor narasumber, tenaga pendukung, dll',
                'urutan' => 2,
                'is_active' => true,
            ],
            [
                'kode' => 'PJL',
                'nama' => 'Belanja Perjalanan',
                'keterangan' => 'Belanja untuk transport, akomodasi, dan biaya perjalanan dinas',
                'urutan' => 3,
                'is_active' => true,
            ],
        ];
        $this->table('m_kategori_belanja')->insert($kategoriBelanja)->saveData();

        // ============================================
        // 8. USERS
        // ============================================
        $users = [];
        $defaultPassword = '123';

        // Role IDs
        $adminRole = 1;
        $verifikatorRole = 2;
        $pengusulRole = 3;
        $ppkRole = 4;
        $wadirRole = 5;
        $bendaharaRole = 6;
        $rektoratRole = 7;

        // --- Preserve Main Users to keep IDs for KegiatanSeeder ---
        // 1. Admin
        $users[] = ['username' => 'admin', 'password_hash' => password_hash('admin123', PASSWORD_BCRYPT), 'nama_lengkap' => 'Administrator', 'email' => 'admin@pnj.ac.id', 'role_id' => $adminRole];
        // 2. Verifikator
        $users[] = ['username' => 'verifikator1', 'password_hash' => password_hash('verif1123', PASSWORD_BCRYPT), 'nama_lengkap' => 'Verifikator Akademik', 'email' => 'verifikator1@pnj.ac.id', 'role_id' => $verifikatorRole];
        $users[] = ['username' => 'verifikator2', 'password_hash' => password_hash('verif2123', PASSWORD_BCRYPT), 'nama_lengkap' => 'Verifikator Keuangan', 'email' => 'verifikator2@pnj.ac.id', 'role_id' => $verifikatorRole];
        $users[] = ['username' => 'verifikator3', 'password_hash' => password_hash('verif3123', PASSWORD_BCRYPT), 'nama_lengkap' => 'Verifikator Kemahasiswaan', 'email' => 'verifikator3@pnj.ac.id', 'role_id' => $verifikatorRole];
        $users[] = ['username' => 'verifikator4', 'password_hash' => password_hash('verif4123', PASSWORD_BCRYPT), 'nama_lengkap' => 'Verifikator Kerja Sama', 'email' => 'verifikator4@pnj.ac.id', 'role_id' => $verifikatorRole];
        // 3. Pengusul
        $users[] = ['username' => 'jurusantik', 'password_hash' => password_hash('tik123', PASSWORD_BCRYPT), 'nama_lengkap' => 'Admin Jurusan Teknik Informatika Komputer', 'email' => 'jurusantik@pnj.ac.id', 'role_id' => $pengusulRole];
        $users[] = ['username' => 'jurusansipil', 'password_hash' => password_hash('sipil123', PASSWORD_BCRYPT), 'nama_lengkap' => 'Admin Jurusan Teknik Sipil', 'email' => 'jurusansipil@pnj.ac.id', 'role_id' => $pengusulRole];
        $users[] = ['username' => 'jurusanmesin', 'password_hash' => password_hash('mesin123', PASSWORD_BCRYPT), 'nama_lengkap' => 'Admin Jurusan Teknik Mesin', 'email' => 'jurusanmesin@pnj.ac.id', 'role_id' => $pengusulRole];
        $users[] = ['username' => 'jurusantgp', 'password_hash' => password_hash('tgp123', PASSWORD_BCRYPT), 'nama_lengkap' => 'Admin Jurusan Teknik Grafika dan Penerbitan', 'email' => 'jurusantgp@pnj.ac.id', 'role_id' => $pengusulRole];
        $users[] = ['username' => 'jurusanak', 'password_hash' => password_hash('ak123', PASSWORD_BCRYPT), 'nama_lengkap' => 'Admin Jurusan Akuntansi', 'email' => 'jurusanak@pnj.ac.id', 'role_id' => $pengusulRole];
        $users[] = ['username' => 'jurusanan', 'password_hash' => password_hash('an123', PASSWORD_BCRYPT), 'nama_lengkap' => 'Admin Jurusan Administrasi Niaga', 'email' => 'jurusanan@pnj.ac.id', 'role_id' => $pengusulRole];
        $users[] = ['username' => 'jurusante', 'password_hash' => password_hash('te123', PASSWORD_BCRYPT), 'nama_lengkap' => 'Admin Jurusan Teknik Elektro', 'email' => 'jurusante@pnj.ac.id', 'role_id' => $pengusulRole];
        // 4. PPK
        $users[] = ['username' => 'ppk', 'password_hash' => password_hash('ppk123', PASSWORD_BCRYPT), 'nama_lengkap' => 'Falih Elmanda', 'email' => 'ppk@pnj.ac.id', 'role_id' => $ppkRole];
        // 5. Wadir
        $users[] = ['username' => 'wadir2', 'password_hash' => password_hash('wadir2123', PASSWORD_BCRYPT), 'nama_lengkap' => '', 'email' => 'Utami Puji Lestari S.E., M.Ak., Ph.D', 'role_id' => $wadirRole];
        // 6. Bendahara
        $users[] = ['username' => 'bendahara', 'password_hash' => password_hash('bendahara123', PASSWORD_BCRYPT), 'nama_lengkap' => 'Mba Amanah', 'email' => 'bendahara@pnj.ac.id', 'role_id' => $bendaharaRole];
        // 7. Rektorat
        $users[] = ['username' => 'rektorat', 'password_hash' => password_hash('rektorat123', PASSWORD_BCRYPT), 'nama_lengkap' => 'Dr. Syamsurizal, S.E., M.M.', 'email' => 'rektorat@pnj.ac.id', 'role_id' => $rektoratRole];

        $this->table('m_users')->insert($users)->saveData();

        echo "✅ Master data seeded successfully!\n";
        echo "   - Roles, Tipe Kegiatan, Status, Satuan, Mata Anggaran, IKU, Kategori Belanja, Users\n";
        echo "\n";
        echo "🔑 Login Credentials have been created as requested.\n";
        echo "   The primary users (admin, pengusul, verifikator, etc.) retain their original passwords.\n";
        echo "   Additional dummy users (e.g., pengusul2, ppk3) have a password of their username followed by '123'.\n";
    }
}

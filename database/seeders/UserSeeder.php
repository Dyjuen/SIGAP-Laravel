<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Role IDs (Mapping based on MasterDataSeeder)
        $adminRole = 1;
        $verifikatorRole = 2;
        $pengusulRole = 3;
        $ppkRole = 4;
        $wadirRole = 5;
        $bendaharaRole = 6;
        $rektoratRole = 7;

        $users = [
            // 1. Admin
            ['user_id' => 1, 'username' => 'admin', 'password_hash' => bcrypt('admin123'), 'nama_lengkap' => 'Administrator', 'email' => 'admin@pnj.ac.id', 'role_id' => $adminRole],
            // 2. Verifikator
            ['user_id' => 2, 'username' => 'verifikator1', 'password_hash' => bcrypt('verif1123'), 'nama_lengkap' => 'Verifikator Akademik', 'email' => 'verifikator1@pnj.ac.id', 'role_id' => $verifikatorRole],
            ['user_id' => 3, 'username' => 'verifikator2', 'password_hash' => bcrypt('verif2123'), 'nama_lengkap' => 'Verifikator Keuangan', 'email' => 'verifikator2@pnj.ac.id', 'role_id' => $verifikatorRole],
            ['user_id' => 4, 'username' => 'verifikator3', 'password_hash' => bcrypt('verif3123'), 'nama_lengkap' => 'Verifikator Kemahasiswaan', 'email' => 'verifikator3@pnj.ac.id', 'role_id' => $verifikatorRole],
            ['user_id' => 5, 'username' => 'verifikator4', 'password_hash' => bcrypt('verif4123'), 'nama_lengkap' => 'Verifikator Kerja Sama', 'email' => 'verifikator4@pnj.ac.id', 'role_id' => $verifikatorRole],
            // 3. Pengusul
            ['user_id' => 6, 'username' => 'jurusantik', 'password_hash' => bcrypt('tik123'), 'nama_lengkap' => 'Admin Jurusan Teknik Informatika Komputer', 'email' => 'jurusantik@pnj.ac.id', 'role_id' => $pengusulRole],
            ['user_id' => 7, 'username' => 'jurusansipil', 'password_hash' => bcrypt('sipil123'), 'nama_lengkap' => 'Admin Jurusan Teknik Sipil', 'email' => 'jurusansipil@pnj.ac.id', 'role_id' => $pengusulRole],
            ['user_id' => 8, 'username' => 'jurusanmesin', 'password_hash' => bcrypt('mesin123'), 'nama_lengkap' => 'Admin Jurusan Teknik Mesin', 'email' => 'jurusanmesin@pnj.ac.id', 'role_id' => $pengusulRole],
            ['user_id' => 9, 'username' => 'jurusantgp', 'password_hash' => bcrypt('tgp123'), 'nama_lengkap' => 'Admin Jurusan Teknik Grafika dan Penerbitan', 'email' => 'jurusantgp@pnj.ac.id', 'role_id' => $pengusulRole],
            ['user_id' => 10, 'username' => 'jurusanak', 'password_hash' => bcrypt('ak123'), 'nama_lengkap' => 'Admin Jurusan Akuntansi', 'email' => 'jurusanak@pnj.ac.id', 'role_id' => $pengusulRole],
            ['user_id' => 11, 'username' => 'jurusanan', 'password_hash' => bcrypt('an123'), 'nama_lengkap' => 'Admin Jurusan Administrasi Niaga', 'email' => 'jurusanan@pnj.ac.id', 'role_id' => $pengusulRole],
            ['user_id' => 12, 'username' => 'jurusante', 'password_hash' => bcrypt('te123'), 'nama_lengkap' => 'Admin Jurusan Teknik Elektro', 'email' => 'jurusante@pnj.ac.id', 'role_id' => $pengusulRole],
            // 4. PPK
            ['user_id' => 13, 'username' => 'ppk', 'password_hash' => bcrypt('ppk123'), 'nama_lengkap' => 'Falih Elmanda', 'email' => 'ppk@pnj.ac.id', 'role_id' => $ppkRole],
            // 5. Wadir
            ['user_id' => 14, 'username' => 'wadir2', 'password_hash' => bcrypt('wadir2123'), 'nama_lengkap' => '', 'email' => 'Utami Puji Lestari S.E., M.Ak., Ph.D', 'role_id' => $wadirRole],
            // 6. Bendahara
            ['user_id' => 15, 'username' => 'bendahara', 'password_hash' => bcrypt('bendahara123'), 'nama_lengkap' => 'Mba Amanah', 'email' => 'bendahara@pnj.ac.id', 'role_id' => $bendaharaRole],
            // 7. Rektorat
            ['user_id' => 16, 'username' => 'rektorat', 'password_hash' => bcrypt('rektorat123'), 'nama_lengkap' => 'Dr. Syamsurizal, S.E., M.M.', 'email' => 'rektorat@pnj.ac.id', 'role_id' => $rektoratRole],
        ];

        foreach ($users as $row) {
            User::updateOrCreate(['user_id' => $row['user_id']], $row);
        }
    }
}

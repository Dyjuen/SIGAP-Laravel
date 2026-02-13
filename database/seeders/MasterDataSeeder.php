<?php

namespace Database\Seeders;

use App\Models\Iku;
use App\Models\KategoriBelanja;
use App\Models\KegiatanStatus;
use App\Models\MataAnggaran;
use App\Models\Role;
use App\Models\Satuan;
use App\Models\TipeKegiatan;
use Illuminate\Database\Seeder;

class MasterDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // ============================================
        // 1. ROLES
        // ============================================
        $roles = [
            ['role_id' => 1, 'nama_role' => 'Admin'],
            ['role_id' => 2, 'nama_role' => 'Verifikator'],
            ['role_id' => 3, 'nama_role' => 'Pengusul'],
            ['role_id' => 4, 'nama_role' => 'PPK'],
            ['role_id' => 5, 'nama_role' => 'Wadir'],
            ['role_id' => 6, 'nama_role' => 'Bendahara'],
            ['role_id' => 7, 'nama_role' => 'Rektorat'],
        ];
        foreach ($roles as $row) {
            Role::updateOrCreate(['role_id' => $row['role_id']], $row);
        }

        // ============================================
        // 2. TIPE KEGIATAN
        // ============================================
        $tipeKegiatan = [
            ['tipe_kegiatan_id' => 1, 'nama_tipe' => 'Bidang 1 - Akademik'],
            ['tipe_kegiatan_id' => 2, 'nama_tipe' => 'Bidang 2 - Umum & Keuangan'],
            ['tipe_kegiatan_id' => 3, 'nama_tipe' => 'Bidang 3 - Kemahasiswaan'],
            ['tipe_kegiatan_id' => 4, 'nama_tipe' => 'Bidang 4 - Kerja Sama'],
        ];
        foreach ($tipeKegiatan as $row) {
            TipeKegiatan::updateOrCreate(['tipe_kegiatan_id' => $row['tipe_kegiatan_id']], $row);
        }

        // ============================================
        // 3. KEGIATAN STATUS
        // ============================================
        $status = [
            ['status_id' => 1, 'nama_status' => 'Draft'],
            ['status_id' => 2, 'nama_status' => 'Review Verifikator'],
            ['status_id' => 3, 'nama_status' => 'Disetujui Verifikator'],
            ['status_id' => 4, 'nama_status' => 'Ditolak'],
            ['status_id' => 5, 'nama_status' => 'Revisi'],
            ['status_id' => 6, 'nama_status' => 'Review PPK'],
            ['status_id' => 7, 'nama_status' => 'Review Wadir 2'],
            ['status_id' => 8, 'nama_status' => 'Proses Pencairan'],
            ['status_id' => 9, 'nama_status' => 'Uang Muka Dicairkan'],
            ['status_id' => 10, 'nama_status' => 'Menunggu LPJ'],
            ['status_id' => 11, 'nama_status' => 'Review LPJ'],
            ['status_id' => 12, 'nama_status' => 'LPJ Direvisi'],
            ['status_id' => 13, 'nama_status' => 'Setor Fisik Dokumen'],
            ['status_id' => 14, 'nama_status' => 'Selesai'],
        ];
        foreach ($status as $row) {
            KegiatanStatus::updateOrCreate(['status_id' => $row['status_id']], $row);
        }

        // ============================================
        // 4. SATUAN
        // ============================================
        $satuan = [
            ['satuan_id' => 1, 'nama_satuan' => 'OJ'],
            ['satuan_id' => 2, 'nama_satuan' => 'Orang'],
            ['satuan_id' => 3, 'nama_satuan' => 'Unit'],
            ['satuan_id' => 4, 'nama_satuan' => 'Paket'],
            ['satuan_id' => 5, 'nama_satuan' => 'Lembar'],
            ['satuan_id' => 6, 'nama_satuan' => 'Hari'],
            ['satuan_id' => 7, 'nama_satuan' => 'Bulan'],
            ['satuan_id' => 8, 'nama_satuan' => 'Set'],
            ['satuan_id' => 9, 'nama_satuan' => 'Pcs'],
            ['satuan_id' => 10, 'nama_satuan' => 'Kg'],
            ['satuan_id' => 11, 'nama_satuan' => 'Rim'],
            ['satuan_id' => 12, 'nama_satuan' => 'Kali'],
            ['satuan_id' => 13, 'nama_satuan' => '%'],
        ];
        foreach ($satuan as $row) {
            Satuan::updateOrCreate(['satuan_id' => $row['satuan_id']], $row);
        }

        // ============================================
        // 5. MATA ANGGARAN
        // ============================================
        $mataAnggaran = [
            [
                'mata_anggaran_id' => 1,
                'kode_anggaran' => 'APBN-2025',
                'nama_sumber_dana' => 'APBN (Anggaran Pendapatan dan Belanja Negara)',
                'tahun_anggaran' => 2025,
                'total_pagu' => 5000000000.00,
            ],
            [
                'mata_anggaran_id' => 2,
                'kode_anggaran' => 'PNBP-2025',
                'nama_sumber_dana' => 'PNBP (Penerimaan Negara Bukan Pajak)',
                'tahun_anggaran' => 2025,
                'total_pagu' => 2000000000.00,
            ],
            [
                'mata_anggaran_id' => 3,
                'kode_anggaran' => 'HIBAH-2025',
                'nama_sumber_dana' => 'Dana Hibah',
                'tahun_anggaran' => 2025,
                'total_pagu' => 500000000.00,
            ],
        ];
        foreach ($mataAnggaran as $row) {
            MataAnggaran::updateOrCreate(['mata_anggaran_id' => $row['mata_anggaran_id']], $row);
        }

        // ============================================
        // 6. IKU (8 IKU FIXED)
        // ============================================
        $iku = [
            ['iku_id' => 1, 'kode_iku' => 'IKU-1', 'nama_iku' => 'Lulusan Mendapat Pekerjaan yang Layak'],
            ['iku_id' => 2, 'kode_iku' => 'IKU-2', 'nama_iku' => 'Mahasiswa Mendapat Pengalaman di Luar Kampus'],
            ['iku_id' => 3, 'kode_iku' => 'IKU-3', 'nama_iku' => 'Dosen Berkegiatan di Luar Kampus'],
            ['iku_id' => 4, 'kode_iku' => 'IKU-4', 'nama_iku' => 'Praktisi Mengajar di Dalam Kampus'],
            ['iku_id' => 5, 'kode_iku' => 'IKU-5', 'nama_iku' => 'Hasil Kerja Dosen Digunakan oleh Masyarakat'],
            ['iku_id' => 6, 'kode_iku' => 'IKU-6', 'nama_iku' => 'Program Studi Bekerjasama dengan Mitra Kelas Dunia'],
            ['iku_id' => 7, 'kode_iku' => 'IKU-7', 'nama_iku' => 'Kelas yang Kolaboratif dan Partisipatif'],
            ['iku_id' => 8, 'kode_iku' => 'IKU-8', 'nama_iku' => 'Program Studi Berstandar Internasional'],
        ];
        foreach ($iku as $row) {
            Iku::updateOrCreate(['iku_id' => $row['iku_id']], $row);
        }

        // ============================================
        // 7. KATEGORI BELANJA
        // ============================================
        $kategoriBelanja = [
            [
                'kategori_belanja_id' => 1,
                'kode' => 'BRG',
                'nama' => 'Belanja Barang',
                'keterangan' => 'Belanja untuk pengadaan barang habis pakai, ATK, konsumsi, dll',
                'urutan' => 1,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'kategori_belanja_id' => 2,
                'kode' => 'JSA',
                'nama' => 'Belanja Jasa',
                'keterangan' => 'Belanja untuk pembayaran jasa seperti honor narasumber, tenaga pendukung, dll',
                'urutan' => 2,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'kategori_belanja_id' => 3,
                'kode' => 'PJL',
                'nama' => 'Belanja Perjalanan',
                'keterangan' => 'Belanja untuk transport, akomodasi, and biaya perjalanan dinas',
                'urutan' => 3,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];
        foreach ($kategoriBelanja as $row) {
            KategoriBelanja::updateOrCreate(['kategori_belanja_id' => $row['kategori_belanja_id']], $row);
        }
    }
}

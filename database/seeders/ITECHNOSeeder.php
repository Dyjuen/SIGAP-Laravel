<?php

namespace Database\Seeders;

use App\Models\Iku;
use App\Models\KAK;
use App\Models\KategoriBelanja;
use App\Models\KegiatanStatus;
use App\Models\MataAnggaran;
use App\Models\Satuan;
use App\Models\TipeKegiatan;
use App\Models\User;
use Illuminate\Database\Seeder;

class ITECHNOSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Get Reference IDs
        $user = User::where('username', 'jurusantik')->first();
        if (! $user) {
            $user = User::whereHas('role', function ($query) {
                $query->where('role_id', 3);
            })->first();
        }
        $userId = $user ? $user->user_id : 1;

        $tipeId = TipeKegiatan::where('nama_tipe', 'like', '%Kemahasiswaan%')->value('tipe_kegiatan_id') ?? 3;
        $maId = MataAnggaran::where('kode_anggaran', 'PNBP-2025')->value('mata_anggaran_id') ?? 1;
        $statusId = KegiatanStatus::where('nama_status', 'Draft')->value('status_id') ?? 1;

        // Satuan
        $id_paket = Satuan::where('nama_satuan', 'Paket')->value('satuan_id') ?? 1;
        $id_pcs = Satuan::where('nama_satuan', 'Pcs')->value('satuan_id') ?? 1;
        $id_org = Satuan::where('nama_satuan', 'Orang')->value('satuan_id') ?? 1;
        $id_hari = Satuan::where('nama_satuan', 'Hari')->value('satuan_id') ?? 1;

        // Satuan for 'Persen'
        $id_persen = Satuan::firstOrCreate(['nama_satuan' => '%'])->satuan_id;

        // Kategori Belanja
        $id_brg = KategoriBelanja::where('kode', 'BRG')->value('kategori_belanja_id') ?? 1;
        $id_jsa = KategoriBelanja::where('kode', 'JSA')->value('kategori_belanja_id') ?? 2;
        $id_pjl = KategoriBelanja::where('kode', 'PJL')->value('kategori_belanja_id') ?? 3;

        // IKU: IKU-2
        $id_iku2 = Iku::where('kode_iku', 'IKU-2')->value('iku_id') ?? 2;

        // 2. Insert Main KAK
        $kak = KAK::create([
            'tipe_kegiatan_id' => $tipeId,
            'nama_kegiatan' => 'Informatics Technologies and Computer Cup (ITechno Cup) 2025',
            'deskripsi_kegiatan' => 'Kegiatan ini bertujuan untuk menjadi wadah pengembangan potensi dan kreativitas mahasiswa di bidang teknologi informasi dan jaringan. Melalui kompetisi ini, terdorong terciptanya generasi digital yang adaptif, inovatif, and memiliki kesadaran tinggi terhadap pentingnya kontribusi teknologi dalam membangun bangsa. Lomba ini juga menjadi wadah untuk mendorong kolaborasi serta kontribusi nyata dalam memperkuat ketahanan dan kedaulatan digital Indonesia.',
            'sasaran_utama' => 'Pelajar SMA/SMK sederajat, serta seluruh mahasiswa/i perguruan tinggi tingkat nasional.',
            'metode_pelaksanaan' => 'Daring dan Luring',
            'kurun_waktu_pelaksanaan' => '10 September 2025 s.d. 02 Oktober 2025',
            'tanggal_mulai' => '2025-09-10',
            'tanggal_selesai' => '2025-10-02',
            'lokasi' => 'Politeknik Negeri Jakarta (Gedung AA & Auditorium Lt 3, Gedung PUT)',
            'pengusul_user_id' => $userId,
            'mata_anggaran_id' => $maId,
            'status_id' => $statusId,
        ]);

        // 3. Insert Anggaran
        $anggaranData = [
            // 521211 Belanja Barang
            ['kategori_belanja_id' => $id_brg, 'uraian' => 'ATK', 'volume1' => 50, 'satuan1_id' => $id_paket, 'volume2' => 1, 'satuan2_id' => $id_paket, 'harga_satuan' => 10000, 'jumlah_diusulkan' => 500000],
            ['kategori_belanja_id' => $id_brg, 'uraian' => 'Laporan Pertanggung Jawaban', 'volume1' => 1, 'satuan1_id' => $id_paket, 'volume2' => 1, 'satuan2_id' => $id_paket, 'harga_satuan' => 150000, 'jumlah_diusulkan' => 150000],
            ['kategori_belanja_id' => $id_brg, 'uraian' => 'Perlengkapan Stand Makanan & Minuman', 'volume1' => 1, 'satuan1_id' => $id_paket, 'volume2' => 1, 'satuan2_id' => $id_paket, 'harga_satuan' => 650000, 'jumlah_diusulkan' => 650000],
            ['kategori_belanja_id' => $id_brg, 'uraian' => 'Snack Peserta', 'volume1' => 120, 'satuan1_id' => $id_org, 'volume2' => 1, 'satuan2_id' => $id_paket, 'harga_satuan' => 10000, 'jumlah_diusulkan' => 1200000],
            ['kategori_belanja_id' => $id_brg, 'uraian' => 'Konsumsi Narasumber Closing', 'volume1' => 2, 'satuan1_id' => $id_org, 'volume2' => 1, 'satuan2_id' => $id_paket, 'harga_satuan' => 25000, 'jumlah_diusulkan' => 50000],
            ['kategori_belanja_id' => $id_brg, 'uraian' => 'Snack Peserta Closing', 'volume1' => 250, 'satuan1_id' => $id_org, 'volume2' => 1, 'satuan2_id' => $id_paket, 'harga_satuan' => 10000, 'jumlah_diusulkan' => 2500000],
            ['kategori_belanja_id' => $id_brg, 'uraian' => 'Air Mineral Gelas 220ml', 'volume1' => 15, 'satuan1_id' => $id_paket, 'volume2' => 1, 'satuan2_id' => $id_paket, 'harga_satuan' => 20000, 'jumlah_diusulkan' => 300000],
            ['kategori_belanja_id' => $id_brg, 'uraian' => 'Sertifikat Lomba', 'volume1' => 30, 'satuan1_id' => $id_pcs, 'volume2' => 1, 'satuan2_id' => $id_paket, 'harga_satuan' => 10000, 'jumlah_diusulkan' => 300000],
            ['kategori_belanja_id' => $id_brg, 'uraian' => 'Konsumsi Panitia', 'volume1' => 190, 'satuan1_id' => $id_org, 'volume2' => 1, 'satuan2_id' => $id_paket, 'harga_satuan' => 12000, 'jumlah_diusulkan' => 2280000],
            ['kategori_belanja_id' => $id_brg, 'uraian' => 'Paket Kotak P3K', 'volume1' => 1, 'satuan1_id' => $id_pcs, 'volume2' => 1, 'satuan2_id' => $id_paket, 'harga_satuan' => 40000, 'jumlah_diusulkan' => 40000],
            ['kategori_belanja_id' => $id_brg, 'uraian' => 'Kaos & Lanyard Panitia', 'volume1' => 81, 'satuan1_id' => $id_pcs, 'volume2' => 1, 'satuan2_id' => $id_paket, 'harga_satuan' => 80000, 'jumlah_diusulkan' => 6480000],
            ['kategori_belanja_id' => $id_brg, 'uraian' => 'Cue Card', 'volume1' => 3, 'satuan1_id' => $id_pcs, 'volume2' => 1, 'satuan2_id' => $id_paket, 'harga_satuan' => 15000, 'jumlah_diusulkan' => 45000],
            ['kategori_belanja_id' => $id_brg, 'uraian' => 'Plakat Narasumber', 'volume1' => 2, 'satuan1_id' => $id_pcs, 'volume2' => 1, 'satuan2_id' => $id_paket, 'harga_satuan' => 150000, 'jumlah_diusulkan' => 300000],
        ];

        // Prizes
        $prizes = [
            ['Juara 1 Keamanan Siber (Mahasiswa)', 1000000],
            ['Juara 2 Keamanan Siber (Mahasiswa)', 600000],
            ['Juara 3 Keamanan Siber (Mahasiswa)', 400000],
            ['Juara 1 Keamanan Siber (SMAK)', 600000],
            ['Juara 2 Keamanan Siber (SMAK)', 400000],
            ['Juara 3 Keamanan Siber (SMAK)', 200000],
            ['Juara 1 Frontend Dev (Mahasiswa)', 1000000],
            ['Juara 2 Frontend Dev (Mahasiswa)', 600000],
            ['Juara 3 Frontend Dev (Mahasiswa)', 400000],
            ['Juara 1 Frontend Dev (SMAK)', 600000],
            ['Juara 2 Frontend Dev (SMAK)', 400000],
            ['Juara 3 Frontend Dev (SMAK)', 200000],
            ['Juara 1 IOT (Mahasiswa)', 750000],
            ['Juara 2 IOT (Mahasiswa)', 500000],
            ['Juara 3 IOT (Mahasiswa)', 250000],
            ['Juara 1 IOT (SMAK)', 600000],
            ['Juara 2 IOT (SMAK)', 400000],
            ['Juara 3 IOT (SMAK)', 200000],
            ['Juara 1 ITNSA (Mahasiswa)', 750000],
            ['Juara 2 ITNSA (Mahasiswa)', 500000],
            ['Juara 3 ITNSA (Mahasiswa)', 250000],
            ['Juara 1 ITNSA (SMAK)', 600000],
            ['Juara 2 ITNSA (SMAK)', 400000],
            ['Juara 3 ITNSA (SMAK)', 200000],
            ['Juara 1 Desain Poster', 500000],
            ['Juara 2 Desain Poster', 350000],
            ['Juara 3 Desain Poster', 150000],
            ['Juara 1 Business Plan', 500000],
            ['Juara 2 Business Plan', 350000],
            ['Juara 3 Business Plan', 150000],
        ];

        foreach ($prizes as $prize) {
            $anggaranData[] = [
                'kategori_belanja_id' => $id_brg,
                'uraian' => $prize[0],
                'volume1' => 1,
                'satuan1_id' => $id_paket,
                'volume2' => 1,
                'satuan2_id' => $id_paket,
                'harga_satuan' => $prize[1],
                'jumlah_diusulkan' => $prize[1],
            ];
        }

        // Belanja Jasa
        $anggaranData[] = ['kategori_belanja_id' => $id_jsa, 'uraian' => 'Narasumber', 'volume1' => 2, 'satuan1_id' => $id_org, 'volume2' => 1, 'satuan2_id' => $id_paket, 'harga_satuan' => 500000, 'jumlah_diusulkan' => 1000000];
        $anggaranData[] = ['kategori_belanja_id' => $id_jsa, 'uraian' => 'Performer', 'volume1' => 1, 'satuan1_id' => $id_paket, 'volume2' => 1, 'satuan2_id' => $id_paket, 'harga_satuan' => 400000, 'jumlah_diusulkan' => 400000];
        $anggaranData[] = ['kategori_belanja_id' => $id_jsa, 'uraian' => 'Zoom Meeting Premium', 'volume1' => 5, 'satuan1_id' => $id_hari, 'volume2' => 1, 'satuan2_id' => $id_paket, 'harga_satuan' => 100000, 'jumlah_diusulkan' => 500000];
        $anggaranData[] = ['kategori_belanja_id' => $id_jsa, 'uraian' => 'Media Partner External', 'volume1' => 1, 'satuan1_id' => $id_paket, 'volume2' => 1, 'satuan2_id' => $id_paket, 'harga_satuan' => 300000, 'jumlah_diusulkan' => 300000];
        $anggaranData[] = ['kategori_belanja_id' => $id_jsa, 'uraian' => 'Domain itechno.com', 'volume1' => 1, 'satuan1_id' => $id_paket, 'volume2' => 1, 'satuan2_id' => $id_paket, 'harga_satuan' => 200000, 'jumlah_diusulkan' => 200000];

        // Belanja Perjalanan Dinas
        $anggaranData[] = ['kategori_belanja_id' => $id_pjl, 'uraian' => 'Transport Survey', 'volume1' => 1, 'satuan1_id' => $id_paket, 'volume2' => 1, 'satuan2_id' => $id_paket, 'harga_satuan' => 100000, 'jumlah_diusulkan' => 100000];

        foreach ($anggaranData as $data) {
            $kak->anggaran()->create($data);
        }

        // 4. Insert Manfaat
        $manfaat = [
            'Dapat meningkatkan reputasi perguruan tinggi sebagai lembaga yang mendukung dan mempromosikan inovasi serta prestasi siswa.',
            'Perguruan tinggi dapat memperluas jaringan dan membangun hubungan positif dengan institusi pendidikan lainnya.',
            'Mengenal lebih jauh tentang Jurusan Teknik Informatika dan Komputer Politeknik Negeri Jakarta kepada para mahasiswa/i sederajat tingkat nasional.',
            'Sebagai wadah yang menampung seluruh mahasiswa/i untuk mengembangkan potensi diri.',
            'Sebagai forum komunikasi, ajang kompetisi, dan unjuk kebolehan generasi muda pada bidang TIK.',
        ];

        foreach ($manfaat as $m) {
            $kak->manfaat()->create(['manfaat' => $m]);
        }

        // 5. Insert Tahapan
        $tahapan = [
            ['nama_tahapan' => 'Registrasi', 'urutan' => 1],
            ['nama_tahapan' => 'Technical Meeting', 'urutan' => 2],
            ['nama_tahapan' => 'Pembukaan', 'urutan' => 3],
            ['nama_tahapan' => 'Submit Karya', 'urutan' => 4],
            ['nama_tahapan' => 'Pengumuman Finalis', 'urutan' => 5],
            ['nama_tahapan' => 'Final Technical Meeting', 'urutan' => 6],
            ['nama_tahapan' => 'Final Online', 'urutan' => 7],
            ['nama_tahapan' => 'Final Offline', 'urutan' => 8],
            ['nama_tahapan' => 'Penutupan & Seminar', 'urutan' => 9],
        ];

        foreach ($tahapan as $t) {
            $kak->tahapan()->create($t);
        }

        // 6. Insert Target
        $targets = [
            ['bulan_indikator' => 'Juni', 'deskripsi_target' => 'Perekrutan Panitia ITECHNO CUP 2025, Persiapan Panitia', 'persentase_target' => 20.00],
            ['bulan_indikator' => 'Juli', 'deskripsi_target' => 'Persiapan acara (sponsorship), Pengajuan KAK, Kontak narasumber, Guideline', 'persentase_target' => 40.00],
            ['bulan_indikator' => 'Agustus', 'deskripsi_target' => 'Kontak performer, Percetakan Lanyard, Technical Meeting', 'persentase_target' => 60.00],
            ['bulan_indikator' => 'September', 'deskripsi_target' => 'Pelaksanaan Acara (Opening, Lomba)', 'persentase_target' => 90.00],
            ['bulan_indikator' => 'Oktober', 'deskripsi_target' => 'Final Offline & Penutupan', 'persentase_target' => 100.00],
        ];

        foreach ($targets as $target) {
            $kak->targets()->create($target);
        }

        // 7. Insert IKU
        $kak->ikus()->create([
            'iku_id' => $id_iku2,
            'target' => 100,
            'satuan_id' => $id_persen,
        ]);
    }
}

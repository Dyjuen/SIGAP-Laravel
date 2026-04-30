<?php

declare(strict_types=1);

use Phinx\Seed\AbstractSeed;

class ITECHNOSeeder extends AbstractSeed
{
    public function run(): void
    {
        // 1. Get Reference IDs
        // Find user for HIMATIK or TIK, fallback to generic pengusul
        $user = $this->fetchRow("SELECT user_id FROM m_users WHERE username = 'jurusantik'");
        if (! $user) {
            $user = $this->fetchRow('SELECT user_id FROM m_users WHERE role_id = 3 LIMIT 1');
        }
        $userId = $user['user_id'];

        // Tipe Kegiatan: Kemahasiswaan
        $tipe = $this->fetchRow("SELECT tipe_kegiatan_id FROM m_tipe_kegiatan WHERE nama_tipe LIKE '%Kemahasiswaan%'");
        $tipeId = $tipe ? $tipe['tipe_kegiatan_id'] : 3;

        // Mata Anggaran: PNBP-2025
        $ma = $this->fetchRow("SELECT mata_anggaran_id FROM m_mata_anggaran WHERE kode_anggaran = 'PNBP-2025'");
        $maId = $ma ? $ma['mata_anggaran_id'] : 1;

        // Status: Draft
        $status = $this->fetchRow("SELECT status_id FROM m_kegiatan_status WHERE nama_status = 'Draft'");
        $statusId = $status ? $status['status_id'] : 1;

        // Satuan
        $s_paket = $this->fetchRow("SELECT satuan_id FROM m_satuan WHERE nama_satuan = 'Paket'");
        $id_paket = $s_paket ? $s_paket['satuan_id'] : 1;

        $s_pcs = $this->fetchRow("SELECT satuan_id FROM m_satuan WHERE nama_satuan = 'Pcs'");
        $id_pcs = $s_pcs ? $s_pcs['satuan_id'] : 1;

        $s_org = $this->fetchRow("SELECT satuan_id FROM m_satuan WHERE nama_satuan = 'Orang'");
        $id_org = $s_org ? $s_org['satuan_id'] : 1;

        $s_hari = $this->fetchRow("SELECT satuan_id FROM m_satuan WHERE nama_satuan = 'Hari'");
        $id_hari = $s_hari ? $s_hari['satuan_id'] : 1;

        // Add Satuan for 'Persen' (if it doesn't exist)
        $s_persen = $this->fetchRow("SELECT satuan_id FROM m_satuan WHERE nama_satuan = '%'");
        if (! $s_persen) {
            $this->table('m_satuan')->insert(['nama_satuan' => '%'])->saveData();
            $s_persen = $this->fetchRow("SELECT satuan_id FROM m_satuan WHERE nama_satuan = '%'");
        }
        $id_persen = $s_persen ? $s_persen['satuan_id'] : 1; // Fallback to 1 if not found/created

        // Kategori Belanja
        $k_brg = $this->fetchRow("SELECT kategori_belanja_id FROM m_kategori_belanja WHERE kode = 'BRG'");
        $id_brg = $k_brg ? $k_brg['kategori_belanja_id'] : 1;

        $k_jsa = $this->fetchRow("SELECT kategori_belanja_id FROM m_kategori_belanja WHERE kode = 'JSA'");
        $id_jsa = $k_jsa ? $k_jsa['kategori_belanja_id'] : 2;

        $k_pjl = $this->fetchRow("SELECT kategori_belanja_id FROM m_kategori_belanja WHERE kode = 'PJL'");
        $id_pjl = $k_pjl ? $k_pjl['kategori_belanja_id'] : 3;

        // IKU: Mahasiswa Mendapat Pengalaman di Luar Kampus (IKU-2)
        $iku2 = $this->fetchRow("SELECT iku_id FROM m_iku WHERE kode_iku = 'IKU-2'");
        $id_iku2 = $iku2 ? $iku2['iku_id'] : 2;

        // 2. Insert Main KAK
        $kakData = [
            'tipe_kegiatan_id' => $tipeId,
            'nama_kegiatan' => 'Informatics Technologies and Computer Cup (ITechno Cup) 2025',
            'deskripsi_kegiatan' => 'Kegiatan ini bertujuan untuk menjadi wadah pengembangan potensi dan kreativitas mahasiswa di bidang teknologi informasi dan jaringan. Melalui kompetisi ini, terdorong terciptanya generasi digital yang adaptif, inovatif, dan memiliki kesadaran tinggi terhadap pentingnya kontribusi teknologi dalam membangun bangsa. Lomba ini juga menjadi wadah untuk mendorong kolaborasi serta kontribusi nyata dalam memperkuat ketahanan dan kedaulatan digital Indonesia.',
            'sasaran_utama' => 'Pelajar SMA/SMK sederajat, serta seluruh mahasiswa/i perguruan tinggi tingkat nasional.',
            'metode_pelaksanaan' => 'Daring dan Luring',
            'kurun_waktu_pelaksanaan' => '10 September 2025 s.d. 02 Oktober 2025',
            'tanggal_mulai' => '2025-09-10',
            'tanggal_selesai' => '2025-10-02',
            'lokasi' => 'Politeknik Negeri Jakarta (Gedung AA & Auditorium Lt 3, Gedung PUT)',
            'pengusul_user_id' => $userId,
            'mata_anggaran_id' => $maId,
            'status_id' => $statusId,
            'created_at' => date('Y-m-d H:i:s'),
            'updated_at' => date('Y-m-d H:i:s'),
        ];

        $this->table('t_kak')->insert($kakData)->saveData();

        // Get inserted ID
        $kakRow = $this->fetchRow("SELECT kak_id FROM t_kak WHERE nama_kegiatan = 'Informatics Technologies and Computer Cup (ITechno Cup) 2025' ORDER BY kak_id DESC LIMIT 1");
        $kakId = $kakRow['kak_id'];

        // 3. Insert Anggaran
        $anggaranData = [];

        // 521211 Belanja Barang
        // ATK
        $anggaranData[] = ['kak_id' => $kakId, 'kategori_belanja_id' => $id_brg, 'uraian' => 'ATK', 'volume1' => 50, 'satuan1_id' => $id_paket, 'volume2' => 1, 'satuan2_id' => $id_paket, 'volume3' => null, 'satuan3_id' => null, 'harga_satuan' => 10000, 'jumlah_diusulkan' => 500000];
        // Laporan Pertanggung Jawaban
        $anggaranData[] = ['kak_id' => $kakId, 'kategori_belanja_id' => $id_brg, 'uraian' => 'Laporan Pertanggung Jawaban', 'volume1' => 1, 'satuan1_id' => $id_paket, 'volume2' => 1, 'satuan2_id' => $id_paket, 'volume3' => null, 'satuan3_id' => null, 'harga_satuan' => 150000, 'jumlah_diusulkan' => 150000];
        // Perlengkapan Stand
        $anggaranData[] = ['kak_id' => $kakId, 'kategori_belanja_id' => $id_brg, 'uraian' => 'Perlengkapan Stand Makanan & Minuman', 'volume1' => 1, 'satuan1_id' => $id_paket, 'volume2' => 1, 'satuan2_id' => $id_paket, 'volume3' => null, 'satuan3_id' => null, 'harga_satuan' => 650000, 'jumlah_diusulkan' => 650000];
        // Snack Peserta
        $anggaranData[] = ['kak_id' => $kakId, 'kategori_belanja_id' => $id_brg, 'uraian' => 'Snack Peserta', 'volume1' => 120, 'satuan1_id' => $id_org, 'volume2' => 1, 'satuan2_id' => $id_paket, 'volume3' => null, 'satuan3_id' => null, 'harga_satuan' => 10000, 'jumlah_diusulkan' => 1200000];
        // Konsumsi Narasumber Closing
        $anggaranData[] = ['kak_id' => $kakId, 'kategori_belanja_id' => $id_brg, 'uraian' => 'Konsumsi Narasumber Closing', 'volume1' => 2, 'satuan1_id' => $id_org, 'volume2' => 1, 'satuan2_id' => $id_paket, 'volume3' => null, 'satuan3_id' => null, 'harga_satuan' => 25000, 'jumlah_diusulkan' => 50000];
        // Snack Peserta Closing
        $anggaranData[] = ['kak_id' => $kakId, 'kategori_belanja_id' => $id_brg, 'uraian' => 'Snack Peserta Closing', 'volume1' => 250, 'satuan1_id' => $id_org, 'volume2' => 1, 'satuan2_id' => $id_paket, 'volume3' => null, 'satuan3_id' => null, 'harga_satuan' => 10000, 'jumlah_diusulkan' => 2500000];
        // Air Mineral
        $anggaranData[] = ['kak_id' => $kakId, 'kategori_belanja_id' => $id_brg, 'uraian' => 'Air Mineral Gelas 220ml', 'volume1' => 15, 'satuan1_id' => $id_paket, 'volume2' => 1, 'satuan2_id' => $id_paket, 'volume3' => null, 'satuan3_id' => null, 'harga_satuan' => 20000, 'jumlah_diusulkan' => 300000];
        // Sertifikat Lomba
        $anggaranData[] = ['kak_id' => $kakId, 'kategori_belanja_id' => $id_brg, 'uraian' => 'Sertifikat Lomba', 'volume1' => 30, 'satuan1_id' => $id_pcs, 'volume2' => 1, 'satuan2_id' => $id_paket, 'volume3' => null, 'satuan3_id' => null, 'harga_satuan' => 10000, 'jumlah_diusulkan' => 300000];
        // Konsumsi Panitia
        $anggaranData[] = ['kak_id' => $kakId, 'kategori_belanja_id' => $id_brg, 'uraian' => 'Konsumsi Panitia', 'volume1' => 190, 'satuan1_id' => $id_org, 'volume2' => 1, 'satuan2_id' => $id_paket, 'volume3' => null, 'satuan3_id' => null, 'harga_satuan' => 12000, 'jumlah_diusulkan' => 2280000];
        // P3K
        $anggaranData[] = ['kak_id' => $kakId, 'kategori_belanja_id' => $id_brg, 'uraian' => 'Paket Kotak P3K', 'volume1' => 1, 'satuan1_id' => $id_pcs, 'volume2' => 1, 'satuan2_id' => $id_paket, 'volume3' => null, 'satuan3_id' => null, 'harga_satuan' => 40000, 'jumlah_diusulkan' => 40000];
        // Kaos & Lanyard
        $anggaranData[] = ['kak_id' => $kakId, 'kategori_belanja_id' => $id_brg, 'uraian' => 'Kaos & Lanyard Panitia', 'volume1' => 81, 'satuan1_id' => $id_pcs, 'volume2' => 1, 'satuan2_id' => $id_paket, 'volume3' => null, 'satuan3_id' => null, 'harga_satuan' => 80000, 'jumlah_diusulkan' => 6480000];
        // Cue Card
        $anggaranData[] = ['kak_id' => $kakId, 'kategori_belanja_id' => $id_brg, 'uraian' => 'Cue Card', 'volume1' => 3, 'satuan1_id' => $id_pcs, 'volume2' => 1, 'satuan2_id' => $id_paket, 'volume3' => null, 'satuan3_id' => null, 'harga_satuan' => 15000, 'jumlah_diusulkan' => 45000];
        // Plakat Narasumber
        $anggaranData[] = ['kak_id' => $kakId, 'kategori_belanja_id' => $id_brg, 'uraian' => 'Plakat Narasumber', 'volume1' => 2, 'satuan1_id' => $id_pcs, 'volume2' => 1, 'satuan2_id' => $id_paket, 'volume3' => null, 'satuan3_id' => null, 'harga_satuan' => 150000, 'jumlah_diusulkan' => 300000];

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
            $anggaranData[] = ['kak_id' => $kakId, 'kategori_belanja_id' => $id_brg, 'uraian' => $prize[0], 'volume1' => 1, 'satuan1_id' => $id_paket, 'volume2' => 1, 'satuan2_id' => $id_paket, 'volume3' => null, 'satuan3_id' => null, 'harga_satuan' => $prize[1], 'jumlah_diusulkan' => $prize[1]];
        }

        // Belanja Jasa
        // Narasumber
        $anggaranData[] = ['kak_id' => $kakId, 'kategori_belanja_id' => $id_jsa, 'uraian' => 'Narasumber', 'volume1' => 2, 'satuan1_id' => $id_org, 'volume2' => 1, 'satuan2_id' => $id_paket, 'volume3' => null, 'satuan3_id' => null, 'harga_satuan' => 500000, 'jumlah_diusulkan' => 1000000];
        // Performer
        $anggaranData[] = ['kak_id' => $kakId, 'kategori_belanja_id' => $id_jsa, 'uraian' => 'Performer', 'volume1' => 1, 'satuan1_id' => $id_paket, 'volume2' => 1, 'satuan2_id' => $id_paket, 'volume3' => null, 'satuan3_id' => null, 'harga_satuan' => 400000, 'jumlah_diusulkan' => 400000];
        // Zoom
        $anggaranData[] = ['kak_id' => $kakId, 'kategori_belanja_id' => $id_jsa, 'uraian' => 'Zoom Meeting Premium', 'volume1' => 5, 'satuan1_id' => $id_hari, 'volume2' => 1, 'satuan2_id' => $id_paket, 'volume3' => null, 'satuan3_id' => null, 'harga_satuan' => 100000, 'jumlah_diusulkan' => 500000];
        // Media Partner
        $anggaranData[] = ['kak_id' => $kakId, 'kategori_belanja_id' => $id_jsa, 'uraian' => 'Media Partner External', 'volume1' => 1, 'satuan1_id' => $id_paket, 'volume2' => 1, 'satuan2_id' => $id_paket, 'volume3' => null, 'satuan3_id' => null, 'harga_satuan' => 300000, 'jumlah_diusulkan' => 300000];
        // Domain
        $anggaranData[] = ['kak_id' => $kakId, 'kategori_belanja_id' => $id_jsa, 'uraian' => 'Domain itechno.com', 'volume1' => 1, 'satuan1_id' => $id_paket, 'volume2' => 1, 'satuan2_id' => $id_paket, 'volume3' => null, 'satuan3_id' => null, 'harga_satuan' => 200000, 'jumlah_diusulkan' => 200000];

        // Belanja Perjalanan Dinas
        // Transport Survey (using 100k total as per PDF final sum)
        $anggaranData[] = ['kak_id' => $kakId, 'kategori_belanja_id' => $id_pjl, 'uraian' => 'Transport Survey', 'volume1' => 1, 'satuan1_id' => $id_paket, 'volume2' => 1, 'satuan2_id' => $id_paket, 'volume3' => null, 'satuan3_id' => null, 'harga_satuan' => 100000, 'jumlah_diusulkan' => 100000];

        $this->table('t_kak_anggaran')->insert($anggaranData)->saveData();

        // 4. Insert Manfaat
        $manfaatData = [
            ['kak_id' => $kakId, 'manfaat' => 'Dapat meningkatkan reputasi perguruan tinggi sebagai lembaga yang mendukung dan mempromosikan inovasi serta prestasi siswa.'],
            ['kak_id' => $kakId, 'manfaat' => 'Perguruan tinggi dapat memperluas jaringan dan membangun hubungan positif dengan institusi pendidikan lainnya.'],
            ['kak_id' => $kakId, 'manfaat' => 'Mengenal lebih jauh tentang Jurusan Teknik Informatika dan Komputer Politeknik Negeri Jakarta kepada para mahasiswa/i sederajat tingkat nasional.'],
            ['kak_id' => $kakId, 'manfaat' => 'Sebagai wadah yang menampung seluruh mahasiswa/i untuk mengembangkan potensi diri.'],
            ['kak_id' => $kakId, 'manfaat' => 'Sebagai forum komunikasi, ajang kompetisi, dan unjuk kebolehan generasi muda pada bidang TIK.'],
        ];
        $this->table('t_kak_manfaat')->insert($manfaatData)->saveData();

        // 5. Insert Tahapan
        $tahapanData = [
            ['kak_id' => $kakId, 'nama_tahapan' => 'Registrasi', 'urutan' => 1],
            ['kak_id' => $kakId, 'nama_tahapan' => 'Technical Meeting', 'urutan' => 2],
            ['kak_id' => $kakId, 'nama_tahapan' => 'Pembukaan', 'urutan' => 3],
            ['kak_id' => $kakId, 'nama_tahapan' => 'Submit Karya', 'urutan' => 4],
            ['kak_id' => $kakId, 'nama_tahapan' => 'Pengumuman Finalis', 'urutan' => 5],
            ['kak_id' => $kakId, 'nama_tahapan' => 'Final Technical Meeting', 'urutan' => 6],
            ['kak_id' => $kakId, 'nama_tahapan' => 'Final Online', 'urutan' => 7],
            ['kak_id' => $kakId, 'nama_tahapan' => 'Final Offline', 'urutan' => 8],
            ['kak_id' => $kakId, 'nama_tahapan' => 'Penutupan & Seminar', 'urutan' => 9],
        ];
        $this->table('t_kak_tahapan')->insert($tahapanData)->saveData();

        // 6. Insert Indikator
        $indikatorData = [
            ['kak_id' => $kakId, 'deskripsi_indikator' => 'Jumlah peserta yang mengikuti seminar, jumlah tim yang mendaftar lomba pemrograman, tingkat keberhasilan proyek yang dikembangkan'],
        ];
        $this->table('t_kak_indikator')->insert($indikatorData)->saveData();

        // 7. Insert Target
        $targetData = [
            ['kak_id' => $kakId, 'bulan_indikator' => 'Juni', 'deskripsi_target' => 'Perekrutan Panitia ITECHNO CUP 2025, Persiapan Panitia', 'persentase_target' => 20.00],
            ['kak_id' => $kakId, 'bulan_indikator' => 'Juli', 'deskripsi_target' => 'Persiapan acara (sponsorship), Pengajuan KAK, Kontak narasumber, Guideline', 'persentase_target' => 40.00],
            ['kak_id' => $kakId, 'bulan_indikator' => 'Agustus', 'deskripsi_target' => 'Kontak performer, Percetakan Lanyard, Technical Meeting', 'persentase_target' => 60.00],
            ['kak_id' => $kakId, 'bulan_indikator' => 'September', 'deskripsi_target' => 'Pelaksanaan Acara (Opening, Lomba)', 'persentase_target' => 90.00],
            ['kak_id' => $kakId, 'bulan_indikator' => 'Oktober', 'deskripsi_target' => 'Final Offline & Penutupan', 'persentase_target' => 100.00],
        ];
        $this->table('t_kak_target')->insert($targetData)->saveData();

        // 8. Insert IKU
        $ikuData = [
            [
                'kak_id' => $kakId,
                'iku_id' => $id_iku2,
                'target' => 100, // Target number
                'satuan_id' => $id_persen, // Satuan for percentage
            ],
        ];
        $this->table('t_kak_iku')->insert($ikuData)->saveData();
    }
}

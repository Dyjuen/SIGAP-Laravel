<?php

declare(strict_types=1);

use Phinx\Seed\AbstractSeed;

class CIVFESTSeeder extends AbstractSeed
{
    public function run(): void
    {
        // 1. Get Reference IDs
        $user = $this->fetchRow("SELECT user_id FROM m_users WHERE username = 'jurusansipil'");
        if (! $user) {
            // Fallback to a known ID or pick the first pengusul if 'jurusansipil' not found
            $user = $this->fetchRow('SELECT user_id FROM m_users WHERE role_id = 3 LIMIT 1');
            if (! $user) {
                // If even the fallback fails, log and use a default of 1, though this implies missing master data
                $this->output->writeln('<error>Warning: Default user for CIVFESTSeeder not found. Using user_id 1.</error>');
                $userId = 1;
            } else {
                $userId = $user['user_id'];
            }
        } else {
            $userId = $user['user_id'];
        }

        $tipe = $this->fetchRow("SELECT tipe_kegiatan_id FROM m_tipe_kegiatan WHERE nama_tipe LIKE '%Kemahasiswaan%'");
        $tipeId = $tipe ? $tipe['tipe_kegiatan_id'] : 1; // Fallback

        $ma = $this->fetchRow("SELECT mata_anggaran_id FROM m_mata_anggaran WHERE kode_anggaran = 'PNBP-2025'");
        $maId = $ma ? $ma['mata_anggaran_id'] : 1;

        $status = $this->fetchRow("SELECT status_id FROM m_kegiatan_status WHERE nama_status = 'Draft'");
        $statusId = $status ? $status['status_id'] : 1;

        // Satuan
        $s_paket = $this->fetchRow("SELECT satuan_id FROM m_satuan WHERE nama_satuan = 'Paket'");
        $id_paket = $s_paket ? $s_paket['satuan_id'] : 1;

        $s_pcs = $this->fetchRow("SELECT satuan_id FROM m_satuan WHERE nama_satuan = 'Pcs'");
        $id_pcs = $s_pcs ? $s_pcs['satuan_id'] : 1; // Use Pcs for Buah

        $s_org = $this->fetchRow("SELECT satuan_id FROM m_satuan WHERE nama_satuan = 'Orang'");
        $id_org = $s_org ? $s_org['satuan_id'] : 1;

        // Add Satuan for 'Persen' (if it doesn't exist)
        $s_persen = $this->fetchRow("SELECT satuan_id FROM m_satuan WHERE nama_satuan = 'Persen'");
        if (! $s_persen) {
            $this->table('m_satuan')->insert(['nama_satuan' => 'Persen'])->saveData();
            $s_persen = $this->fetchRow("SELECT satuan_id FROM m_satuan WHERE nama_satuan = 'Persen'");
        }
        $id_persen = $s_persen ? $s_persen['satuan_id'] : 1; // Fallback to 1 if not found/created

        // Kategori Belanja
        $k_brg = $this->fetchRow("SELECT kategori_belanja_id FROM m_kategori_belanja WHERE kode = 'BRG'");
        $id_brg = $k_brg ? $k_brg['kategori_belanja_id'] : 1;

        // IKU
        $iku2 = $this->fetchRow("SELECT iku_id FROM m_iku WHERE kode_iku = 'IKU-2'");
        $id_iku2 = $iku2 ? $iku2['iku_id'] : 1;

        // 2. Insert Main KAK
        $kakData = [
            'tipe_kegiatan_id' => $tipeId,
            'nama_kegiatan' => 'CIVIL ENGINEERING FESTIVAL 2025',
            'deskripsi_kegiatan' => 'Kegiatan ini bertemakan "Building Infrastructure Resilience in Facing Future Challenges". Tujuan utama diadakannya acara ini adalah untuk mengembangkan nilai kreativitas, inovasi dan inspirasi bagi seluruh mahasiswa/I dan siswa/i SMA/SMK sederajat Indonesia demi ikut serta menciptakan pembangunan infrastruktur yang tangguh di Indonesia melalui serangkaian acara dan lomba (Seminar Nasional, Lomba Jembatan Nasional, Lomba Beton Nasional, Lomba Maket, Lomba Tender Nasional, dan Lomba BIM Nasional).',
            'sasaran_utama' => 'Seluruh mahasiswa/i dan Siswa/i SMA/SMK Sederajat Indonesia',
            'metode_pelaksanaan' => 'Dilakukan secara Hybrid (online dan offline). Seleksi lomba dilakukan secara online sedangkan pengujian final dilakukan secara Offline di Politeknik Negeri Jakarta.',
            'kurun_waktu_pelaksanaan' => '21 April 2025 hingga 30 Agustus 2025',
            'tanggal_mulai' => '2025-04-21',
            'tanggal_selesai' => '2025-08-30',
            'lokasi' => 'Politeknik Negeri Jakarta',
            'pengusul_user_id' => $userId,
            'mata_anggaran_id' => $maId,
            'status_id' => $statusId,
            'created_at' => date('Y-m-d H:i:s'),
            'updated_at' => date('Y-m-d H:i:s'),
        ];

        $this->table('t_kak')->insert($kakData)->saveData();

        // Get inserted ID
        $kakRow = $this->fetchRow("SELECT kak_id FROM t_kak WHERE nama_kegiatan = 'CIVIL ENGINEERING FESTIVAL 2025' ORDER BY kak_id DESC LIMIT 1");
        $kakId = $kakRow['kak_id'];

        // 3. Insert Anggaran
        // Note: Since I don't have "Kali" as a unit in master data (based on reading MasterDataSeeder), I'll ignore the "Kali" multiplier for volume2/3 or treat it as 1.
        // Format: Volume 1 (Buah/Paket), Volume 2 (Paket), Volume 3 (Kali).
        // Actually `t_kak_anggaran` allows volume1, volume2, volume3.
        // PDF: "6 Buah x 1 Paket x 1 Kali".
        // I will map: vol1=6 sat1=Pcs, vol2=1 sat2=Paket, vol3=1 sat3=null (or similar).

        $anggaranData = [
            // I. Belanja Bahan
            [
                'kak_id' => $kakId,
                'kategori_belanja_id' => $id_brg,
                'uraian' => 'Stand Banner',
                'volume1' => 6, 'satuan1_id' => $id_pcs,
                'volume2' => 1, 'satuan2_id' => $id_paket,
                'volume3' => 1, 'satuan3_id' => null, // 'Kali' not avail, assume 1
                'harga_satuan' => 79000,
                'jumlah_diusulkan' => 474000,
            ],
            [
                'kak_id' => $kakId,
                'kategori_belanja_id' => $id_brg,
                'uraian' => 'Banner',
                'volume1' => 7, 'satuan1_id' => $id_pcs,
                'volume2' => 1, 'satuan2_id' => $id_paket,
                'volume3' => 1, 'satuan3_id' => null,
                'harga_satuan' => 123000,
                'jumlah_diusulkan' => 861000,
            ],
            // II. Belanja Barang - Lomba Jembatan
            [
                'kak_id' => $kakId,
                'kategori_belanja_id' => $id_brg,
                'uraian' => 'Sertifikat Juara 1,2,3 dan Dosen Pembimbing (Lomba Jembatan)',
                'volume1' => 12, 'satuan1_id' => $id_org, // Using Orang as per PDF "12 Orang"
                'volume2' => 1, 'satuan2_id' => $id_paket,
                'volume3' => 1, 'satuan3_id' => null,
                'harga_satuan' => 7000,
                'jumlah_diusulkan' => 84000,
            ],
            [
                'kak_id' => $kakId,
                'kategori_belanja_id' => $id_brg,
                'uraian' => 'Sertifikat Juara Favorit (Lomba Jembatan)',
                'volume1' => 4, 'satuan1_id' => $id_org,
                'volume2' => 1, 'satuan2_id' => $id_paket,
                'volume3' => 1, 'satuan3_id' => null,
                'harga_satuan' => 7000,
                'jumlah_diusulkan' => 28000,
            ],
            [
                'kak_id' => $kakId,
                'kategori_belanja_id' => $id_brg,
                'uraian' => 'Sertifikat Juri (Lomba Jembatan)',
                'volume1' => 3, 'satuan1_id' => $id_org,
                'volume2' => 1, 'satuan2_id' => $id_paket,
                'volume3' => 1, 'satuan3_id' => null,
                'harga_satuan' => 7000,
                'jumlah_diusulkan' => 21000,
            ],
            // Lomba Beton
            [
                'kak_id' => $kakId,
                'kategori_belanja_id' => $id_brg,
                'uraian' => 'Sertifikat Juara 1,2,3 dan Dosen Pembimbing (Lomba Beton)',
                'volume1' => 12, 'satuan1_id' => $id_paket, // PDF says "paket" in col 3 but "12 Orang" in calcs. I'll stick to 12 paket as volume1. Wait, row 1 says "12 paket" in col Volume. But calc says "12 Orang". I'll use 'Paket' for consistency with Volume column.
                'volume2' => 1, 'satuan2_id' => $id_paket, // Just mapping to structure
                'volume3' => null, 'satuan3_id' => null,
                'harga_satuan' => 7000,
                'jumlah_diusulkan' => 84000,
            ],
            [
                'kak_id' => $kakId,
                'kategori_belanja_id' => $id_brg,
                'uraian' => 'Sertifikat Juara Favorit (Lomba Beton)',
                'volume1' => 4, 'satuan1_id' => $id_paket,
                'volume2' => 1, 'satuan2_id' => $id_paket,
                'volume3' => null, 'satuan3_id' => null,
                'harga_satuan' => 7000,
                'jumlah_diusulkan' => 28000,
            ],
            [
                'kak_id' => $kakId,
                'kategori_belanja_id' => $id_brg,
                'uraian' => 'Sertifikat Juri (Lomba Beton)',
                'volume1' => 3, 'satuan1_id' => $id_paket,
                'volume2' => 1, 'satuan2_id' => $id_paket,
                'volume3' => null, 'satuan3_id' => null,
                'harga_satuan' => 7000,
                'jumlah_diusulkan' => 21000,
            ],
            // Lomba BIM
            [
                'kak_id' => $kakId,
                'kategori_belanja_id' => $id_brg,
                'uraian' => 'Sertifikat Juara 1,2,3 dan Dosen Pembimbing (Lomba BIM)',
                'volume1' => 12, 'satuan1_id' => $id_paket,
                'volume2' => 1, 'satuan2_id' => $id_paket,
                'volume3' => null, 'satuan3_id' => null,
                'harga_satuan' => 7000,
                'jumlah_diusulkan' => 84000,
            ],
            [
                'kak_id' => $kakId,
                'kategori_belanja_id' => $id_brg,
                'uraian' => 'Sertifikat Juara Favorit (Lomba BIM)',
                'volume1' => 4, 'satuan1_id' => $id_paket,
                'volume2' => 1, 'satuan2_id' => $id_paket,
                'volume3' => null, 'satuan3_id' => null,
                'harga_satuan' => 7000,
                'jumlah_diusulkan' => 28000,
            ],
            [
                'kak_id' => $kakId,
                'kategori_belanja_id' => $id_brg,
                'uraian' => 'Sertifikat Juri (Lomba BIM)',
                'volume1' => 3, 'satuan1_id' => $id_paket,
                'volume2' => 1, 'satuan2_id' => $id_paket,
                'volume3' => null, 'satuan3_id' => null,
                'harga_satuan' => 7000,
                'jumlah_diusulkan' => 21000,
            ],
            // Lomba Maket
            [
                'kak_id' => $kakId,
                'kategori_belanja_id' => $id_brg,
                'uraian' => 'Sertifikat Juara 1,2,3 dan Dosen Pembimbing (Lomba Maket)',
                'volume1' => 12, 'satuan1_id' => $id_paket,
                'volume2' => 1, 'satuan2_id' => $id_paket,
                'volume3' => null, 'satuan3_id' => null,
                'harga_satuan' => 7000,
                'jumlah_diusulkan' => 84000,
            ],
            [
                'kak_id' => $kakId,
                'kategori_belanja_id' => $id_brg,
                'uraian' => 'Sertifikat Juara Favorit (Lomba Maket)',
                'volume1' => 4, 'satuan1_id' => $id_paket,
                'volume2' => 1, 'satuan2_id' => $id_paket,
                'volume3' => null, 'satuan3_id' => null,
                'harga_satuan' => 7000,
                'jumlah_diusulkan' => 28000,
            ],
            [
                'kak_id' => $kakId,
                'kategori_belanja_id' => $id_brg,
                'uraian' => 'Sertifikat Juri (Lomba Maket)',
                'volume1' => 3, 'satuan1_id' => $id_paket,
                'volume2' => 1, 'satuan2_id' => $id_paket,
                'volume3' => null, 'satuan3_id' => null,
                'harga_satuan' => 7000,
                'jumlah_diusulkan' => 21000,
            ],
            // Lomba Tender
            [
                'kak_id' => $kakId,
                'kategori_belanja_id' => $id_brg,
                'uraian' => 'Sertifikat Juara 1,2,3 dan Dosen Pembimbing (Lomba Tender)',
                'volume1' => 12, 'satuan1_id' => $id_paket,
                'volume2' => 1, 'satuan2_id' => $id_paket,
                'volume3' => null, 'satuan3_id' => null,
                'harga_satuan' => 7000,
                'jumlah_diusulkan' => 84000,
            ],
            [
                'kak_id' => $kakId,
                'kategori_belanja_id' => $id_brg,
                'uraian' => 'Sertifikat Juara Favorit (Lomba Tender)',
                'volume1' => 4, 'satuan1_id' => $id_paket,
                'volume2' => 1, 'satuan2_id' => $id_paket,
                'volume3' => null, 'satuan3_id' => null,
                'harga_satuan' => 7000,
                'jumlah_diusulkan' => 28000,
            ],
            [
                'kak_id' => $kakId,
                'kategori_belanja_id' => $id_brg,
                'uraian' => 'Sertifikat Juri (Lomba Tender)',
                'volume1' => 3, 'satuan1_id' => $id_paket,
                'volume2' => 1, 'satuan2_id' => $id_paket,
                'volume3' => null, 'satuan3_id' => null,
                'harga_satuan' => 7000,
                'jumlah_diusulkan' => 21000,
            ],
        ];
        $this->table('t_kak_anggaran')->insert($anggaranData)->saveData();

        // 4. Insert Manfaat
        $manfaatData = [
            [
                'kak_id' => $kakId,
                'manfaat' => 'Mempererat kerja sama antara mahasiswa dari berbagai universitas guna menciptakan hubungan yang harmonis dan produktif dalam bidang akademik.',
            ],
            [
                'kak_id' => $kakId,
                'manfaat' => 'Menginspirasi mahasiswa Teknik Sipil untuk menghasilkan ide-ide kreatif dan inovatif dalam bidang konstruksi yang sesuai dengan perkembangan teknologi masa kini.',
            ],
            [
                'kak_id' => $kakId,
                'manfaat' => 'Menyediakan platform komunikasi bagi perguruan tinggi untuk bertukar informasi dan pengalaman dalam upaya meningkatkan kualitas sumber daya manusia demi pembangunan yang tangguh di masa depan.',
            ],
            [
                'kak_id' => $kakId,
                'manfaat' => 'Memberikan edukasi dan pelatihan kepada siswa/i SMA/SMK sederajat agar memiliki pemahaman yang lebih baik mengenai Teknik perancangan dan pembangunan bangunan.',
            ],
            [
                'kak_id' => $kakId,
                'manfaat' => 'Menyiapkan individu yang kompeten dan siap menghadapi tantangan serta perubahan dalam industri konstruksi seiring dengan kemajuan zaman.',
            ],
        ];
        $this->table('t_kak_manfaat')->insert($manfaatData)->saveData();

        // 5. Insert Tahapan
        $tahapanData = [
            ['kak_id' => $kakId, 'nama_tahapan' => 'Rapat persiapan pembentukan panitia', 'urutan' => 1],
            ['kak_id' => $kakId, 'nama_tahapan' => 'Sounding Civil Engineering Festival 2025', 'urutan' => 2],
            ['kak_id' => $kakId, 'nama_tahapan' => 'Open Registration Panitia Civil Engineering Festival 2025', 'urutan' => 3],
            ['kak_id' => $kakId, 'nama_tahapan' => 'First Gathering Civil Engineering Festival 2025 dan rapat pleno 1', 'urutan' => 4],
            ['kak_id' => $kakId, 'nama_tahapan' => 'Opening Ceremony Civil Engineering Festival 2025', 'urutan' => 5],
            ['kak_id' => $kakId, 'nama_tahapan' => 'Awarding dan Closing Ceremony Civil Engineering Festival 2025', 'urutan' => 6],
        ];
        $this->table('t_kak_tahapan')->insert($tahapanData)->saveData();

        // 6. Insert Indikator
        $indikatorData = [
            ['kak_id' => $kakId, 'deskripsi_indikator' => 'Mahasiswa berkegiatan/meraih prestasi di luar program studi'],
        ];
        $this->table('t_kak_indikator')->insert($indikatorData)->saveData();

        // 7. Insert Target
        $targetData = [
            [
                'kak_id' => $kakId,
                'bulan_indikator' => 'April',
                'deskripsi_target' => 'Rapat Persiapan, Pembentukan Panitia, First Gathering Panitia',
                'persentase_target' => 15.00,
            ],
            [
                'kak_id' => $kakId,
                'bulan_indikator' => 'Mei',
                'deskripsi_target' => 'Registrasi Lomba, Roadshow, Pleno 1',
                'persentase_target' => 40.00,
            ],
            [
                'kak_id' => $kakId,
                'bulan_indikator' => 'Juni',
                'deskripsi_target' => 'Registrasi Lomba',
                'persentase_target' => 60.00,
            ],
            [
                'kak_id' => $kakId,
                'bulan_indikator' => 'Juli',
                'deskripsi_target' => 'Pleno 2',
                'persentase_target' => 85.00,
            ],
            [
                'kak_id' => $kakId,
                'bulan_indikator' => 'Agustus',
                'deskripsi_target' => 'Opening Ceremony, Seminar Nasional, Pleno 3, Opening Lomba (Tender, Maket, Beton, BIM, Jembatan), Closing Ceremony',
                'persentase_target' => 100.00,
            ],
        ];
        $this->table('t_kak_target')->insert($targetData)->saveData();

        // 8. Insert IKU (IKU-2)
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

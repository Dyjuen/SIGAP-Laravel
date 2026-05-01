<?php

namespace Database\Seeders;

use App\Models\KAK;
use App\Models\Kegiatan;
use App\Models\KegiatanApproval;
use App\Models\KAKAnggaran;
use App\Models\KAKManfaat;
use App\Models\KAKTahapan;
use App\Models\KAKTarget;
use App\Models\KAKIku;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DummyKegiatanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // User ID 6 is 'jurusantik'
        $userId = 6;

        // Clear existing to avoid duplicates if re-run
        // DB::table('t_kegiatan_approval')->truncate();
        // DB::table('t_kegiatan')->truncate();

        // 1. Stage: PPK (Step 1 Active)
        $this->createActivity($userId, 'Workshop TIK 2026', 1);

        // 2. Stage: Wadir 2 (Step 2 Active)
        $this->createActivity($userId, 'Seminar Nasional SENTI', 2);

        // 3. Stage: Pencairan (Step 3 Active)
        $this->createActivity($userId, 'Lomba Coding Mahasiswa', 3);

        // 4. Stage: LPJ (Step 4 Active)
        $this->createActivity($userId, 'Pengembangan Lab Komputer', 4);

        // 5. Stage: Selesai (Step 5 Completed)
        $this->createActivity($userId, 'Pelatihan IoT Dasar', 6); // 6 means all done
    }

    private function createActivity($userId, $name, $activeStep)
    {
        $kak = KAK::create([
            'nama_kegiatan' => $name,
            'deskripsi_kegiatan' => 'Deskripsi untuk ' . $name,
            'metode_pelaksanaan' => 'Metode Pelaksanaan',
            'tanggal_mulai' => now()->addDays(rand(1, 30))->format('Y-m-d'),
            'tanggal_selesai' => now()->addDays(31)->format('Y-m-d'),
            'lokasi' => 'Gedung TIK',
            'tipe_kegiatan_id' => 1,
            'pengusul_user_id' => $userId,
            'status_id' => 6, // Generic approved KAK
            'kurun_waktu_pelaksanaan' => '1 Hari',
        ]);

        $this->addChildren($kak);

        $kegiatan = Kegiatan::create([
            'kak_id' => $kak->kak_id,
            'penanggung_jawab_manual' => 'PJ ' . $name,
            'pelaksana_manual' => 'Panitia ' . $name,
            'tanggal_mulai_final' => $kak->tanggal_mulai,
        ]);

        $steps = ['PPK', 'Wadir2', 'Bendahara-Cair', 'Bendahara-LPJ', 'Bendahara-Setor'];
        
        foreach ($steps as $index => $level) {
            $stepNum = $index + 1;
            $status = 'Menunggu';
            
            if ($stepNum < $activeStep) {
                $status = 'Disetujui';
            } elseif ($stepNum === $activeStep) {
                $status = 'Aktif';
            } elseif ($activeStep > 5) {
                $status = 'Disetujui'; // All done
            }

            KegiatanApproval::create([
                'kegiatan_id' => $kegiatan->kegiatan_id,
                'approval_level' => $level,
                'status' => $status,
                'updated_at' => $status === 'Disetujui' ? now()->subDays(5 - $index) : now(),
            ]);
        }
    }

    private function addChildren(KAK $kak)
    {
        KAKManfaat::create(['kak_id' => $kak->kak_id, 'manfaat' => 'Peningkatan kualitas lulusan']);
        KAKTahapan::create(['kak_id' => $kak->kak_id, 'nama_tahapan' => 'Persiapan', 'urutan' => 1]);
        KAKTarget::create(['kak_id' => $kak->kak_id, 'deskripsi_target' => 'Target tercapai', 'persentase_target' => 100]);
        KAKIku::create(['kak_id' => $kak->kak_id, 'iku_id' => 1, 'target' => 100, 'satuan_id' => 1]);
        KAKAnggaran::create([
            'kak_id' => $kak->kak_id,
            'kategori_belanja_id' => 1,
            'uraian' => 'Konsumsi',
            'volume1' => 10,
            'satuan1_id' => 1,
            'harga_satuan' => 50000,
            'jumlah_diusulkan' => 500000,
        ]);
    }
}

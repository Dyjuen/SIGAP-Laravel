<?php

namespace Database\Seeders;

use App\Models\KAK;
use App\Models\KAKAnggaran;
use App\Models\Kegiatan;
use App\Models\KegiatanApproval;
use App\Models\PencairanDana;
use Faker\Factory;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class DummyDashboardDataSeeder extends Seeder
{
    public function run(): void
    {
        // Hapus data lama agar tidak tumpang tindih
        DB::table('t_pencairan_dana')->delete();
        DB::table('t_kegiatan_approval')->delete();
        DB::table('t_kegiatan')->delete();
        DB::table('t_kak_anggaran')->delete();
        DB::table('t_kak')->delete();

        $jurusans = [
            ['user_id' => 6,  'name' => 'Teknik Informatika Komputer', 'count' => 12, 'base_budget' => 20000000, 'completion_rate' => 0.8],
            ['user_id' => 7,  'name' => 'Teknik Sipil',                'count' => 8,  'base_budget' => 35000000, 'completion_rate' => 0.6],
            ['user_id' => 8,  'name' => 'Teknik Mesin',                'count' => 10, 'base_budget' => 25000000, 'completion_rate' => 0.5],
            ['user_id' => 9,  'name' => 'Teknik Grafika dan Penerbitan', 'count' => 6,  'base_budget' => 15000000, 'completion_rate' => 0.9],
            ['user_id' => 10, 'name' => 'Akuntansi',                   'count' => 15, 'base_budget' => 10000000, 'completion_rate' => 0.4],
            ['user_id' => 11, 'name' => 'Administrasi Niaga',          'count' => 7,  'base_budget' => 18000000, 'completion_rate' => 0.7],
            ['user_id' => 12, 'name' => 'Teknik Elektro',              'count' => 9,  'base_budget' => 30000000, 'completion_rate' => 0.65],
        ];

        $faker = Factory::create('id_ID');

        foreach ($jurusans as $jurusan) {
            for ($i = 0; $i < $jurusan['count']; $i++) {
                // Tentukan status KAK
                $isCompleted = (mt_rand(1, 100) / 100) <= $jurusan['completion_rate'];
                $isStuck = ! $isCompleted && mt_rand(1, 100) <= 30; // 30% dari yang belum selesai itu nyangkut (priority feed)

                // Variasi tanggal
                $createdAt = Carbon::now()->subDays(mt_rand(1, 180));

                $kak = KAK::create([
                    'pengusul_user_id' => $jurusan['user_id'],
                    'mata_anggaran_id' => 1,
                    'tipe_kegiatan_id' => mt_rand(1, 4),
                    'nama_kegiatan' => 'Kegiatan '.ucwords($faker->words(2, true)).' '.$jurusan['name'],
                    'deskripsi_kegiatan' => $faker->paragraph(),
                    'sasaran_utama' => $faker->sentence(),
                    'tanggal_mulai' => $createdAt->copy()->addDays(10),
                    'tanggal_selesai' => $createdAt->copy()->addDays(15),
                    'status_id' => 14, // Disetujui
                    'created_at' => $createdAt,
                    'updated_at' => $createdAt,
                ]);

                // Buat Anggaran
                $jumlahDiusulkan = $jurusan['base_budget'] * (mt_rand(8, 15) / 10);
                $anggaran = KAKAnggaran::create([
                    'kak_id' => $kak->kak_id,
                    'kategori_belanja_id' => mt_rand(1, 3),
                    'uraian' => 'Biaya '.$faker->words(3, true),
                    'volume1' => 1,
                    'satuan1_id' => 4, // Paket
                    'harga_satuan' => $jumlahDiusulkan,
                    'jumlah_diusulkan' => $jumlahDiusulkan,
                    'realisasi_volume1' => 1,
                    'realisasi_harga_satuan' => $jumlahDiusulkan,
                    'realisasi_jumlah' => $jumlahDiusulkan,
                ]);

                // Buat Kegiatan
                $kegiatan = Kegiatan::create([
                    'kak_id' => $kak->kak_id,
                    'created_at' => $createdAt,
                    'updated_at' => $createdAt,
                ]);

                if ($isCompleted) {
                    // Selesai -> ada approval dari Bendahara
                    KegiatanApproval::create([
                        'kegiatan_id' => $kegiatan->kegiatan_id,
                        'approver_user_id' => 15, // Bendahara
                        'approval_level' => 'Bendahara-Setor',
                        'status' => 'Disetujui',
                        'catatan' => 'Selesai disetujui',
                        'created_at' => $createdAt->copy()->addDays(5),
                        'updated_at' => $createdAt->copy()->addDays(5),
                    ]);

                    PencairanDana::create([
                        'kegiatan_id' => $kegiatan->kegiatan_id,
                        'jumlah_dicairkan' => $jumlahDiusulkan,
                        'tanggal_pencairan' => $createdAt->copy()->addDays(6),
                        'keterangan' => 'Lunas',
                        'created_by' => 15,
                        'created_at' => $createdAt->copy()->addDays(6),
                    ]);
                } else {
                    if ($isStuck) {
                        // Macet di meja tertentu (Priority Feed)
                        $levels = ['PPK', 'Wadir2'];
                        $level = $levels[array_rand($levels)];
                        $userId = $level == 'PPK' ? 13 : 14;

                        KegiatanApproval::create([
                            'kegiatan_id' => $kegiatan->kegiatan_id,
                            'approver_user_id' => $userId,
                            'approval_level' => $level,
                            'status' => 'Aktif',
                            'catatan' => 'Menunggu persetujuan',
                            // Tanggal stuck (buat mundur bbrp hari/minggu lalu agar kelihatan di feed)
                            'created_at' => Carbon::now()->subDays(mt_rand(4, 20)),
                            'updated_at' => Carbon::now()->subDays(mt_rand(4, 20)),
                        ]);

                        // Dana dicairkan sebagian jika sudah proses
                        PencairanDana::create([
                            'kegiatan_id' => $kegiatan->kegiatan_id,
                            'jumlah_dicairkan' => $jumlahDiusulkan * 0.3, // 30% cair (misal DP)
                            'tanggal_pencairan' => Carbon::now()->subDays(mt_rand(21, 30)),
                            'keterangan' => 'DP',
                            'created_by' => 15,
                            'created_at' => Carbon::now()->subDays(mt_rand(21, 30)),
                        ]);

                    } else {
                        // Sedang jalan lancar
                        KegiatanApproval::create([
                            'kegiatan_id' => $kegiatan->kegiatan_id,
                            'approver_user_id' => 15,
                            'approval_level' => 'Bendahara',
                            'status' => 'Aktif',
                            'catatan' => 'Sedang proses pencairan',
                            'created_at' => Carbon::now()->subDays(1),
                            'updated_at' => Carbon::now()->subDays(1),
                        ]);
                    }
                }
            }
        }
    }
}

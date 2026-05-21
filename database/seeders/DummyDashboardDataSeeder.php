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
            ['user_id' => 6,  'name' => 'Teknik Informatika Komputer',  'count' => 12, 'base_budget' => 20000000, 'completion_rate' => 0.8],
            ['user_id' => 7,  'name' => 'Teknik Sipil',                 'count' => 8,  'base_budget' => 35000000, 'completion_rate' => 0.6],
            ['user_id' => 8,  'name' => 'Teknik Mesin',                 'count' => 10, 'base_budget' => 25000000, 'completion_rate' => 0.5],
            ['user_id' => 9,  'name' => 'Teknik Grafika dan Penerbitan', 'count' => 6,  'base_budget' => 15000000, 'completion_rate' => 0.9],
            ['user_id' => 10, 'name' => 'Akuntansi',                    'count' => 15, 'base_budget' => 10000000, 'completion_rate' => 0.4],
            ['user_id' => 11, 'name' => 'Administrasi Niaga',           'count' => 7,  'base_budget' => 18000000, 'completion_rate' => 0.7],
            ['user_id' => 12, 'name' => 'Teknik Elektro',               'count' => 9,  'base_budget' => 30000000, 'completion_rate' => 0.65],
        ];

        // IKU IDs yang ada di m_iku
        $availableIkuIds = DB::table('m_iku')->pluck('iku_id')->toArray();
        if (empty($availableIkuIds)) {
            $availableIkuIds = [1, 2, 3, 4, 5];
        }

        $faker = Factory::create('id_ID');

        foreach ($jurusans as $jurusan) {
            for ($i = 0; $i < $jurusan['count']; $i++) {
                $isCompleted = (mt_rand(1, 100) / 100) <= $jurusan['completion_rate'];
                $isStuck = ! $isCompleted && mt_rand(1, 100) <= 30;

                // ── Tanggal rencana (KAK) ──────────────────────────────────────────
                $createdAt = Carbon::now()->subDays(mt_rand(30, 180));
                $rencanaStart = $createdAt->copy()->addDays(10);
                $rencanaDurasi = mt_rand(14, 45);
                $rencanaEnd = $rencanaStart->copy()->addDays($rencanaDurasi);

                $kak = KAK::create([
                    'pengusul_user_id' => $jurusan['user_id'],
                    'mata_anggaran_id' => 1,
                    'tipe_kegiatan_id' => mt_rand(1, 4),
                    'nama_kegiatan' => 'Kegiatan '.ucwords($faker->words(2, true)).' '.$jurusan['name'],
                    'deskripsi_kegiatan' => $faker->paragraph(),
                    'sasaran_utama' => $faker->sentence(),
                    'tanggal_mulai' => $rencanaStart,
                    'tanggal_selesai' => $rencanaEnd,
                    'status_id' => 14,
                    'created_at' => $createdAt,
                    'updated_at' => $createdAt,
                ]);

                // ── IKU (C3): 2–4 IKU per KAK, sebagian terpenuhi ────────────────
                $ikuCount = mt_rand(2, min(4, count($availableIkuIds)));
                $selectedIkus = array_slice($availableIkuIds, 0, $ikuCount);
                $ikuTerpenuhi = $isCompleted
                    ? mt_rand((int) ceil($ikuCount * 0.5), $ikuCount)
                    : mt_rand(0, 1);

                foreach ($selectedIkus as $idx => $ikuId) {
                    DB::table('t_kak_iku')->insert([
                        'kak_id' => $kak->kak_id,
                        'iku_id' => $ikuId,
                        'target' => mt_rand(1, 10),
                        'satuan_id' => 1,
                        'terpenuhi' => ($idx < $ikuTerpenuhi) ? DB::raw('true') : DB::raw('false'),
                    ]);
                }

                // ── Anggaran (C2): deviasi ±0–20% ─────────────────────────────────
                $jumlahDiusulkan = $jurusan['base_budget'] * (mt_rand(8, 15) / 10);
                $deviasiPct = mt_rand(0, 20) / 100;
                $direction = mt_rand(0, 1) === 0 ? 1 : -1;
                $realisasiHarga = $jumlahDiusulkan * (1 + $direction * $deviasiPct);

                KAKAnggaran::create([
                    'kak_id' => $kak->kak_id,
                    'kategori_belanja_id' => mt_rand(1, 3),
                    'uraian' => 'Biaya '.$faker->words(3, true),
                    'volume1' => 1,
                    'satuan1_id' => 4,
                    'harga_satuan' => $jumlahDiusulkan,
                    'jumlah_diusulkan' => $jumlahDiusulkan,
                    'realisasi_volume1' => 1,
                    'realisasi_volume2' => 1,
                    'realisasi_volume3' => 1,
                    'realisasi_harga_satuan' => $realisasiHarga,
                    'realisasi_jumlah' => $realisasiHarga,
                ]);

                // ── Kegiatan ───────────────────────────────────────────────────────
                $kegiatan = Kegiatan::create([
                    'kak_id' => $kak->kak_id,
                    'created_at' => $createdAt,
                    'updated_at' => $createdAt,
                ]);

                if ($isCompleted) {
                    // ── Tanggal aktual (C1): deviasi ±0–30% dari rencana ──────────
                    $aktualStart = $rencanaStart->copy()->addDays(mt_rand(-2, 5));
                    $aktualDeviasiDays = (int) ($rencanaDurasi * (mt_rand(0, 30) / 100));
                    $aktualDurasi = max(1, $rencanaDurasi + (mt_rand(0, 1) === 0 ? 1 : -1) * $aktualDeviasiDays);
                    $aktualEnd = $aktualStart->copy()->addDays($aktualDurasi);
                    $lpjSubmitted = $aktualEnd->copy()->addDays(mt_rand(1, 5));

                    $kegiatan->update([
                        'tanggal_mulai_final' => $aktualStart,
                        'tanggal_selesai_final' => $aktualEnd,
                        'lpj_submitted_at' => $lpjSubmitted,
                        // Tidak mengisi spk_* agar kalkulasi otomatis berjalan
                    ]);

                    // ── Approvals (semua selesai) ──────────────────────────────────
                    $steps = ['PPK', 'Wadir2', 'Bendahara-Cair', 'Bendahara-LPJ', 'Bendahara-Setor'];
                    $time = $createdAt->copy();

                    foreach ($steps as $step) {
                        $activated = $time->copy();
                        // C4: Bendahara-LPJ sengaja bervariasi (beberapa >14 hari)
                        $daysToApprove = ($step === 'Bendahara-LPJ')
                            ? mt_rand(3, 25)
                            : mt_rand(1, 4);
                        $approved = $time->addDays($daysToApprove)->copy();

                        KegiatanApproval::create([
                            'kegiatan_id' => $kegiatan->kegiatan_id,
                            'approval_level' => $step,
                            'status' => 'Disetujui',
                            'catatan' => 'Persetujuan '.$step,
                            'activated_at' => $activated,
                            'approved_at' => $approved,
                            'created_at' => $activated,
                            'updated_at' => $approved,
                        ]);
                    }

                    PencairanDana::create([
                        'kegiatan_id' => $kegiatan->kegiatan_id,
                        'jumlah_dicairkan' => $realisasiHarga,
                        'tanggal_pencairan' => $createdAt->copy()->addDays(4),
                        'keterangan' => 'Lunas',
                        'created_by' => 15,
                        'created_at' => $createdAt->copy()->addDays(4),
                    ]);
                } else {
                    if ($isStuck) {
                        $level = mt_rand(0, 1) === 0 ? 'PPK' : 'Wadir2';

                        KegiatanApproval::create([
                            'kegiatan_id' => $kegiatan->kegiatan_id,
                            'approval_level' => 'PPK',
                            'status' => $level === 'PPK' ? 'Aktif' : 'Disetujui',
                            'catatan' => $level === 'PPK' ? 'Menunggu persetujuan' : 'Disetujui PPK',
                            'activated_at' => $createdAt,
                            'approved_at' => $level === 'Wadir2' ? $createdAt->copy()->addDays(2) : null,
                            'created_at' => $createdAt,
                            'updated_at' => $createdAt,
                        ]);

                        if ($level === 'Wadir2') {
                            KegiatanApproval::create([
                                'kegiatan_id' => $kegiatan->kegiatan_id,
                                'approval_level' => 'Wadir2',
                                'status' => 'Aktif',
                                'catatan' => 'Menunggu persetujuan Wadir 2',
                                'activated_at' => $createdAt->copy()->addDays(2),
                                'created_at' => $createdAt->copy()->addDays(2),
                                'updated_at' => $createdAt->copy()->addDays(2),
                            ]);
                        }

                        $allSteps = ['PPK', 'Wadir2', 'Bendahara-Cair', 'Bendahara-LPJ', 'Bendahara-Setor'];
                        foreach ($allSteps as $s) {
                            if ($s === 'PPK' || ($level === 'Wadir2' && $s === 'Wadir2')) {
                                continue;
                            }
                            KegiatanApproval::create([
                                'kegiatan_id' => $kegiatan->kegiatan_id,
                                'approval_level' => $s,
                                'status' => 'Menunggu',
                                'created_at' => $createdAt,
                                'updated_at' => $createdAt,
                            ]);
                        }

                        PencairanDana::create([
                            'kegiatan_id' => $kegiatan->kegiatan_id,
                            'jumlah_dicairkan' => $jumlahDiusulkan * 0.3,
                            'tanggal_pencairan' => Carbon::now()->subDays(mt_rand(21, 30)),
                            'keterangan' => 'DP',
                            'created_by' => 15,
                            'created_at' => Carbon::now()->subDays(mt_rand(21, 30)),
                        ]);
                    } else {
                        $steps = ['PPK', 'Wadir2', 'Bendahara-Cair', 'Bendahara-LPJ', 'Bendahara-Setor'];
                        $time = $createdAt->copy();
                        foreach ($steps as $step) {
                            $status = 'Menunggu';
                            if ($step === 'PPK' || $step === 'Wadir2') {
                                $status = 'Disetujui';
                            } elseif ($step === 'Bendahara-Cair') {
                                $status = 'Aktif';
                            }

                            KegiatanApproval::create([
                                'kegiatan_id' => $kegiatan->kegiatan_id,
                                'approval_level' => $step,
                                'status' => $status,
                                'catatan' => $status === 'Aktif' ? 'Sedang proses pencairan' : 'Selesai '.$step,
                                'activated_at' => in_array($step, ['PPK', 'Wadir2', 'Bendahara-Cair']) ? $time->copy() : null,
                                'approved_at' => in_array($step, ['PPK', 'Wadir2']) ? $time->addDays(mt_rand(1, 2))->copy() : null,
                                'created_at' => $createdAt,
                                'updated_at' => $createdAt,
                            ]);
                        }
                    }
                }
            }
        }
    }
}

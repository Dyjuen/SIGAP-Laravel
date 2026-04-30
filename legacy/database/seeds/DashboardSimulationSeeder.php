<?php

declare(strict_types=1);

use Phinx\Seed\AbstractSeed;

class DashboardSimulationSeeder extends AbstractSeed
{
    public function run(): void
    {
        // ============================================
        // 1. SETUP & CLEANUP
        // ============================================
        $this->execute('SET FOREIGN_KEY_CHECKS = 0');

        $tables = [
            't_pencairan_dana',
            't_kegiatan_approval',
            't_kegiatan_lampiran',
            't_kegiatan_log_status',
            't_kegiatan_anggaran',
            't_kegiatan',
            't_kak_approval',
            't_kak_log_status',
            't_kak_anggaran',
            't_kak_iku',
            't_kak_target',
            't_kak',
        ];

        foreach ($tables as $table) {
            $this->execute("TRUNCATE TABLE $table");
        }

        $this->execute('SET FOREIGN_KEY_CHECKS = 1');

        // ============================================
        // 2. CONFIGURATION
        // ============================================

        // User IDs based on MasterDataSeeder
        $verifikatorIds = [2, 3, 4, 5];
        $pengusulIds = [6, 7, 8, 9, 10, 11, 12]; // Jurusan Users
        $ppkId = 13;
        $wadirId = 14;
        $bendaharaId = 15;

        // Data Pools
        $activityPrefixes = ['Workshop', 'Seminar', 'Pelatihan', 'Pengadaan', 'Sertifikasi', 'Kunjungan Industri', 'Lomba', 'Simposium', 'Kuliah Umum', 'Pameran'];
        $activityTopics = ['IoT', 'Konstruksi', 'Manajemen', 'Akuntansi Digital', 'Desain Grafis', 'Energi Terbarukan', 'Startups', 'Big Data', 'Kecerdasan Buatan', 'Hukum Bisnis'];

        $jurusanNames = [
            6 => 'TIK', 7 => 'Sipil', 8 => 'Mesin', 9 => 'TGP', 10 => 'Akuntansi', 11 => 'AN', 12 => 'Elektro',
        ];

        // ============================================
        // 3. GENERATE HISTORICAL DATA (18 Months)
        // ============================================

        $currentDate = new DateTime;
        // Modify DatePeriod logic to ensure current month is included
        // We add 1 day to endDate to make sure the loop includes the final month if needed,
        // OR we just manually append the current month after loop.
        // Better: Use a simpler loop.

        $months = 18;
        $kakCount = 0;
        $kegiatanCount = 0;

        for ($m = $months; $m >= 0; $m--) {
            // Calculate month
            $dt = (clone $currentDate)->modify("-$m months");
            $monthStr = $dt->format('Y-m');

            // Current month detection
            $isCurrentMonth = ($m === 0);

            // Random volume
            // Less activities 18 months ago, more activities recently
            $baseVol = $m > 12 ? rand(3, 6) : rand(8, 15);
            if ($isCurrentMonth) {
                $baseVol = rand(5, 10);
            } // Ensure some data for current month

            for ($i = 0; $i < $baseVol; $i++) {
                $pengusulId = $pengusulIds[array_rand($pengusulIds)];
                $jurusanName = $jurusanNames[$pengusulId];

                // Random day/time
                $day = rand(1, 28);
                // If current month, ensure day is not in future
                if ($isCurrentMonth) {
                    $maxDay = (int) $currentDate->format('d');
                    if ($day > $maxDay) {
                        $day = rand(1, $maxDay);
                    }
                }

                $createDate = clone $dt;
                $createDate->setDate((int) $dt->format('Y'), (int) $dt->format('m'), $day);
                $createDate->setTime(rand(8, 16), rand(0, 59), 0);
                $createDateStr = $createDate->format('Y-m-d H:i:s');

                // Determine Status Fate
                $statusId = $this->determineRandomStatus();

                // --- A. INSERT KAK ---
                $kakData = [
                    'tipe_kegiatan_id' => rand(1, 4),
                    'nama_kegiatan' => $activityPrefixes[array_rand($activityPrefixes)].' '.$activityTopics[array_rand($activityTopics)].' - '.$jurusanName,
                    'deskripsi_kegiatan' => 'Kegiatan rutin untuk pengembangan kompetensi di lingkungan '.$jurusanName,
                    'pengusul_user_id' => $pengusulId,
                    'mata_anggaran_id' => rand(1, 3),
                    'status_id' => $statusId, // 3 = Approved/Next Step
                    'created_at' => $createDateStr,
                    'updated_at' => $createDateStr,
                ];

                $this->table('t_kak')->insert($kakData)->saveData();
                $kakId = $this->getAdapter()->getConnection()->lastInsertId();
                $kakCount++;

                // --- B. INSERT ANGGARAN (Dana Diminta) ---
                $budget = rand(15, 250) * 1000000; // 15jt - 250jt

                // Note: Realisasi columns will be updated in simulateKegiatanFlow if completed
                $this->table('t_kak_anggaran')->insert([
                    'kak_id' => $kakId,
                    'uraian' => 'Biaya Pelaksanaan',
                    'volume1' => 1,
                    'satuan1_id' => 4, // Paket
                    'harga_satuan' => $budget,
                    'jumlah_diusulkan' => $budget,
                    'kategori_belanja_id' => rand(1, 3),
                ])->saveData();

                // --- C. PROCESS IF APPROVED ---
                if ($statusId === 3) {
                    // Create Approval Record for KAK
                    $verifId = $verifikatorIds[array_rand($verifikatorIds)];
                    $this->table('t_kak_approval')->insert([
                        'kak_id' => $kakId,
                        'approver_user_id' => $verifId,
                        'status' => 'Disetujui',
                        'catatan' => 'Lanjut ke pengajuan kegiatan.',
                        'created_at' => $createDateStr,
                    ])->saveData();

                    // --- D. INSERT KEGIATAN ---
                    $kegiatanData = [
                        'kak_id' => $kakId,
                        'created_at' => $createDateStr,
                        'updated_at' => $createDateStr,
                    ];
                    $this->table('t_kegiatan')->insert($kegiatanData)->saveData();
                    $kegiatanId = $this->getAdapter()->getConnection()->lastInsertId();
                    $kegiatanCount++;

                    // --- E. SIMULATE KEGIATAN APPROVAL FLOW & PENCAIRAN ---
                    $this->simulateKegiatanFlow($kakId, $kegiatanId, $createDate, $budget, $ppkId, $wadirId, $bendaharaId);
                }
            }
        }

        echo "✅ Seeding Completed: $kakCount KAKs, $kegiatanCount Kegiatans created over 18 months.\n";
    }

    private function determineRandomStatus()
    {
        $r = rand(1, 100);
        if ($r <= 10) {
            return 1;
        } // Draft
        if ($r <= 20) {
            return 2;
        } // Review Verif
        if ($r <= 25) {
            return 4;
        } // Ditolak
        if ($r <= 30) {
            return 5;
        } // Revisi

        return 3; // Disetujui (Proceeds to Kegiatan)
    }

    private function simulateKegiatanFlow($kakId, $kegiatanId, $startDate, $budget, $ppkId, $wadirId, $bendaharaId)
    {
        $now = new DateTime;
        $ageDays = $now->diff($startDate)->days;

        // Completion Probability
        $isDone = false;
        if ($ageDays > 90) {
            $isDone = (rand(1, 100) <= 90);
        } elseif ($ageDays > 30) {
            $isDone = (rand(1, 100) <= 50);
        } else {
            $isDone = (rand(1, 100) <= 10);
        }

        $maxStep = 4;
        if (! $isDone) {
            $maxStep = rand(0, 3);
        }

        $levels = ['PPK', 'Wadir2', 'Bendahara-Cair', 'Bendahara-LPJ', 'Bendahara-Setor'];
        $approverIds = [$ppkId, $wadirId, $bendaharaId, $bendaharaId, $bendaharaId];

        for ($i = 0; $i <= $maxStep; $i++) {
            $level = $levels[$i];
            $approverId = $approverIds[$i];

            $stepDate = clone $startDate;
            $stepDate->modify('+ '.(($i + 1) * rand(2, 5)).' days');

            if ($stepDate > $now) {
                break;
            }

            $stepDateStr = $stepDate->format('Y-m-d H:i:s');

            $status = 'Disetujui';
            $catatan = 'ACC';

            if (! $isDone && $i === $maxStep) {
                $status = 'Aktif';
                $catatan = null;
                $approverId = null;
            }

            $this->table('t_kegiatan_approval')->insert([
                'kegiatan_id' => $kegiatanId,
                'approval_level' => $level,
                'approver_user_id' => $approverId,
                'status' => $status,
                'catatan' => $catatan,
                'created_at' => $stepDateStr,
                'updated_at' => $stepDateStr,
            ])->saveData();

            // --- F. INSERT PENCAIRAN DANA ---
            if ($level === 'Bendahara-Cair' && $status === 'Disetujui') {
                $this->table('t_pencairan_dana')->insert([
                    'kegiatan_id' => $kegiatanId,
                    'jumlah_dicairkan' => $budget,
                    'keterangan' => 'Pencairan Dana Tahap 1',
                    'tanggal_pencairan' => $stepDateStr,
                    'created_by' => $bendaharaId,
                    'created_at' => $stepDateStr,
                ])->saveData();
            }

            // --- G. UPDATE REALISASI IF DONE (Bendahara-Setor) ---
            if ($level === 'Bendahara-Setor' && $status === 'Disetujui') {
                // IMPORTANT: Fix for "Realisasi Dana" Issue
                // The DashboardController calculates realization from t_kak_anggaran fields
                // if the project is marked as Done (Bendahara-Setor Approved).
                // So we MUST update t_kak_anggaran here.

                // Simulate Realization = 90% - 100% of Budget
                $realisasiHarga = $budget * (rand(90, 100) / 100);

                // Direct SQL update via Adapter to handle the update
                $sql = "UPDATE t_kak_anggaran SET 
                        realisasi_volume1 = volume1, 
                        realisasi_harga_satuan = $realisasiHarga,
                        realisasi_jumlah = $realisasiHarga
                        WHERE kak_id = $kakId";

                $this->getAdapter()->execute($sql);
            }
        }
    }
}

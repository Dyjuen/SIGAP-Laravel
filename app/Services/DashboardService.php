<?php

namespace App\Services;

use App\Models\KAK;
use App\Models\Kegiatan;
use App\Models\KegiatanApproval;
use App\Models\Panduan;
use App\Models\SpkConfig;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardService
{
    /**
     * Get guidebooks/panduans visible to a specific role.
     */
    public function getPanduans(?int $roleId): array
    {
        if (! $roleId) {
            return [];
        }

        return Panduan::where('target_role_id', $roleId)
            ->orWhereNull('target_role_id')
            ->get()
            ->map(fn ($p) => [
                'id' => $p->panduan_id,
                'judul' => $p->judul_panduan,
                'tipe' => $p->tipe_media,
                'path' => $p->path_media,
                'download_url' => route('admin.panduan.download', $p->panduan_id),
            ])
            ->toArray();
    }

    /**
     * Get stats for Pengusul role.
     */
    public function getPengusulStats(User $user): array
    {
        $uid = $user->user_id;

        $totalKak = KAK::where('pengusul_user_id', $uid)->count();
        $draftKak = KAK::where('pengusul_user_id', $uid)->where('status_id', 1)->count();
        $reviewKak = KAK::where('pengusul_user_id', $uid)->where('status_id', 2)->count();
        $approvedKak = KAK::where('pengusul_user_id', $uid)->where('status_id', 3)->count();
        $rejectedKak = KAK::where('pengusul_user_id', $uid)->whereIn('status_id', [4, 5])->count();

        $kegiatanAktif = Kegiatan::whereHas('kak', function ($q) use ($uid) {
            $q->where('pengusul_user_id', $uid);
        })->count();

        return [
            'total_kak' => $totalKak,
            'draft_kak' => $draftKak,
            'review_kak' => $reviewKak,
            'approved_kak' => $approvedKak,
            'rejected_kak' => $rejectedKak,
            'kegiatan_aktif' => $kegiatanAktif,
        ];
    }

    /**
     * Get recent KAKs for Pengusul.
     */
    public function getPengusulRecentKaks(User $user, int $limit = 5): array
    {
        return KAK::with(['status', 'tipeKegiatan'])
            ->where('pengusul_user_id', $user->user_id)
            ->orderBy('updated_at', 'desc')
            ->limit($limit)
            ->get()
            ->map(fn ($kak) => [
                'kak_id' => $kak->kak_id,
                'nama_kegiatan' => $kak->nama_kegiatan,
                'status_id' => $kak->status_id,
                'status_nama' => $kak->status?->nama_status,
                'tipe' => $kak->tipeKegiatan?->nama_tipe,
                'updated_at' => $kak->updated_at?->format('d M Y'),
            ])
            ->toArray();
    }

    /**
     * Get recent LPJs for Pengusul.
     */
    public function getPengusulRecentLpjs(User $user, int $limit = 5): array
    {
        return Kegiatan::with(['kak.status'])
            ->whereHas('kak', function ($q) use ($user) {
                $q->where('pengusul_user_id', $user->user_id)
                    ->whereIn('status_id', [10, 11, 12, 13, 14]);
            })
            ->latest('updated_at')
            ->limit($limit)
            ->get()
            ->map(fn ($kegiatan) => [
                'kegiatan_id' => $kegiatan->kegiatan_id,
                'kak_id' => $kegiatan->kak_id,
                'nama_kegiatan' => $kegiatan->kak?->nama_kegiatan ?? '-',
                'status_id' => $kegiatan->kak?->status_id,
                'status_nama' => $kegiatan->kak?->status?->nama_status ?? '-',
                'tgl_batas_lpj' => $kegiatan->tgl_batas_lpj?->format('d/m/Y') ?? '-',
            ])
            ->toArray();
    }

    /**
     * Get PPK Dashboard stats and pending list.
     */
    public function getPpkStatsAndRecent(int $limit = 5): array
    {
        $pendingCount = KegiatanApproval::where('approval_level', 'PPK')
            ->where('status', 'Aktif')
            ->count();

        $approvedCount = KegiatanApproval::where('approval_level', 'PPK')
            ->where('status', 'Disetujui')
            ->count();

        $rejectedCount = KegiatanApproval::where('approval_level', 'PPK')
            ->where('status', 'Ditolak')
            ->count();

        $totalKegiatan = Kegiatan::count();

        $pendingKegiatan = Kegiatan::with(['kak.pengusul', 'kak.tipeKegiatan'])
            ->whereHas('activeApproval', function ($q) {
                $q->where('approval_level', 'PPK')->where('status', 'Aktif');
            })
            ->latest('kegiatan_id')
            ->limit($limit)
            ->get()
            ->map(fn ($k) => [
                'kegiatan_id' => $k->kegiatan_id,
                'nama_kegiatan' => $k->kak?->nama_kegiatan,
                'pengusul' => $k->kak?->pengusul?->nama_lengkap,
                'pengusul_nama' => $k->kak?->pengusul?->nama_lengkap, // support API attribute key
                'tipe' => $k->kak?->tipeKegiatan?->nama_tipe,
                'created_at' => $k->created_at?->format('d M Y'),
            ])
            ->toArray();

        return [
            'stats' => [
                'pending_count' => $pendingCount,
                'approved_count' => $approvedCount,
                'rejected_count' => $rejectedCount,
                'total_kegiatan' => $totalKegiatan,
            ],
            'pending_kegiatan' => $pendingKegiatan,
        ];
    }

    /**
     * Get Wadir Dashboard stats and pending list.
     */
    public function getWadirStatsAndRecent(int $limit = 5): array
    {
        $pendingCount = KegiatanApproval::where('approval_level', 'Wadir2')
            ->where('status', 'Aktif')
            ->count();

        $approvedCount = KegiatanApproval::where('approval_level', 'Wadir2')
            ->where('status', 'Disetujui')
            ->count();

        $totalKegiatan = Kegiatan::count();

        $pendingKegiatan = Kegiatan::with(['kak.pengusul', 'kak.tipeKegiatan'])
            ->whereHas('activeApproval', function ($q) {
                $q->where('approval_level', 'Wadir2')->where('status', 'Aktif');
            })
            ->latest('kegiatan_id')
            ->limit($limit)
            ->get()
            ->map(fn ($k) => [
                'kegiatan_id' => $k->kegiatan_id,
                'nama_kegiatan' => $k->kak?->nama_kegiatan,
                'pengusul' => $k->kak?->pengusul?->nama_lengkap,
                'pengusul_nama' => $k->kak?->pengusul?->nama_lengkap, // support API attribute key
                'tipe' => $k->kak?->tipeKegiatan?->nama_tipe,
                'created_at' => $k->created_at?->format('d M Y'),
            ])
            ->toArray();

        return [
            'stats' => [
                'pending_count' => $pendingCount,
                'approved_count' => $approvedCount,
                'total_kegiatan' => $totalKegiatan,
            ],
            'pending_kegiatan' => $pendingKegiatan,
        ];
    }

    /**
     * Get Verifikator Dashboard stats and recent list.
     */
    public function getVerifikatorStatsAndRecent(User $user, int $limit = 5): array
    {
        // Extract tipe_kegiatan_id from username (verifikator1 → 1)
        $tipeKegiatanId = null;
        if (preg_match('/verifikator(\d+)/', $user->username, $matches)) {
            $tipeKegiatanId = (int) $matches[1];
        }

        $pendingKak = KAK::where('status_id', 2)
            ->when($tipeKegiatanId, fn ($q) => $q->where('tipe_kegiatan_id', $tipeKegiatanId))
            ->count();

        $approvedKak = KAK::where('status_id', 3)
            ->when($tipeKegiatanId, fn ($q) => $q->where('tipe_kegiatan_id', $tipeKegiatanId))
            ->count();

        $rejectedKak = KAK::whereIn('status_id', [4, 5])
            ->when($tipeKegiatanId, fn ($q) => $q->where('tipe_kegiatan_id', $tipeKegiatanId))
            ->count();

        $totalKak = KAK::when($tipeKegiatanId, fn ($q) => $q->where('tipe_kegiatan_id', $tipeKegiatanId))
            ->count();

        $recentKaks = KAK::with(['status', 'pengusul', 'tipeKegiatan'])
            ->where('status_id', 2) // HANYA Review (Menunggu Verifikasi)
            ->when($tipeKegiatanId, fn ($q) => $q->where('tipe_kegiatan_id', $tipeKegiatanId))
            ->orderBy('updated_at', 'desc')
            ->limit($limit)
            ->get()
            ->map(fn ($kak) => [
                'kak_id' => $kak->kak_id,
                'nama_kegiatan' => $kak->nama_kegiatan,
                'pengusul' => $kak->pengusul?->nama_lengkap,
                'pengusul_nama' => $kak->pengusul?->nama_lengkap, // support API attribute key
                'tipe' => $kak->tipeKegiatan?->nama_tipe,
                'status_nama' => $kak->status?->nama_status,
                'updated_at' => $kak->updated_at?->format('d M Y'),
            ])
            ->toArray();

        return [
            'stats' => [
                'pending_kak' => $pendingKak,
                'approved_kak' => $approvedKak,
                'rejected_kak' => $rejectedKak,
                'total_kak' => $totalKak,
            ],
            'recent_kaks' => $recentKaks,
        ];
    }

    /**
     * Get Bendahara Dashboard stats and activities.
     */
    public function getBendaharaStatsAndKegiatans(): array
    {
        $kegiatans = Kegiatan::with([
            'kak.pengusul',
            'approvals',
        ])
            ->withSum('pencairanDana', 'jumlah_dicairkan')
            ->whereHas('approvals', function ($query) {
                $query->where('approval_level', 'PPK')
                    ->where('status', 'Disetujui');
            })
            ->whereHas('approvals', function ($query) {
                $query->where('approval_level', 'Wadir2')
                    ->where('status', 'Disetujui');
            })
            ->get();

        $kegiatans->load(['kak' => fn ($q) => $q->withSum('anggaran', 'jumlah_diusulkan')]);

        $waitingCount = 0;
        $disbursedCount = 0;
        $lpjCount = 0;
        $totalDisbursedAmount = 0;
        $totalUndisbursedAmount = 0;

        $mappedKegiatans = $kegiatans->map(function (Kegiatan $kegiatan) use (
            &$waitingCount, &$disbursedCount, &$lpjCount,
            &$totalDisbursedAmount, &$totalUndisbursedAmount
        ) {
            $totalAnggaran = (float) ($kegiatan->kak?->anggaran_sum_jumlah_diusulkan ?? 0);
            $totalDicairkan = (float) ($kegiatan->pencairan_dana_sum_jumlah_dicairkan ?? 0);

            $currentApproval = $kegiatan->approvals->whereIn('status', ['Aktif'])->first();

            $isWaitingDisbursement = $kegiatan->approvals
                ->where('approval_level', 'Bendahara-Cair')
                ->where('status', 'Aktif')
                ->isNotEmpty();

            $isDisbursed = $kegiatan->approvals
                ->where('approval_level', 'Bendahara-Cair')
                ->where('status', 'Disetujui')
                ->isNotEmpty();

            $isLpjVerification = $kegiatan->approvals
                ->where('approval_level', 'Bendahara-LPJ')
                ->whereIn('status', ['Aktif', 'Revisi'])
                ->isNotEmpty();

            if ($isWaitingDisbursement) {
                $waitingCount++;
                $totalUndisbursedAmount += $totalAnggaran;
            }

            if ($isDisbursed) {
                $disbursedCount++;
                $totalDisbursedAmount += $totalAnggaran;
            }

            if ($isLpjVerification && $kegiatan->lpj_submitted_at) {
                $lpjCount++;
            }

            $status = 'waiting';
            if ($isLpjVerification) {
                $status = $kegiatan->lpj_submitted_at ? 'lpj_submitted' : 'lpj_waiting';
            } elseif ($isDisbursed) {
                $status = 'disbursed';
            }

            return [
                'kegiatan_id' => $kegiatan->kegiatan_id,
                'kak_id' => $kegiatan->kak_id,
                'nama_kegiatan' => $kegiatan->kak?->nama_kegiatan ?? '-',
                'pelaksana_manual' => $kegiatan->pelaksana_manual,
                'pengusul_nama' => $kegiatan->kak?->pengusul?->nama_lengkap ?? '-',
                'dana_diusulkan' => $totalAnggaran, // Match DashboardItem field
                'dana_dicairkan' => $totalDicairkan, // Match DashboardItem field
                'total_anggaran_diusulkan' => $totalAnggaran,
                'sisa_dana' => $totalAnggaran - $totalDicairkan,
                'status' => $status,
                'lpj_submitted_at' => $kegiatan->lpj_submitted_at,
                'current_approval_level' => $currentApproval?->approval_level,
            ];
        });

        $pendingLpjs = $mappedKegiatans->where('status', 'lpj_submitted')->values()->toArray();

        return [
            'stats' => [
                'waiting_count' => $waitingCount,
                'disbursed_count' => $disbursedCount,
                'lpj_pending' => $lpjCount,
                'lpj_approved' => $disbursedCount, // Placeholder for approved LPJ count if available
                'total_dana_diusulkan' => $totalUndisbursedAmount + $totalDisbursedAmount,
                'total_dana_dicairkan' => $totalDisbursedAmount,
                'total_disbursed_amount' => (float) $totalDisbursedAmount,
                'total_undisbursed_amount' => (float) $totalUndisbursedAmount,
            ],
            'pending_lpjs' => $pendingLpjs,
            'kegiatans' => $mappedKegiatans->toArray(),
        ];
    }

    /**
     * Get Direktur / Default Dashboard stats.
     */
    public function getDirekturStats(): array
    {
        $totalKak = KAK::count();
        $totalKegiatan = Kegiatan::count();
        $pendingApprovals = KegiatanApproval::where('status', 'Aktif')->count();

        $approvedKak = KAK::where('status_id', 3)->count();

        $kegiatanSelesai = Kegiatan::whereExists(function ($query) {
            $query->select(DB::raw(1))
                ->from('t_kegiatan_approval as ka')
                ->whereColumn('ka.kegiatan_id', 't_kegiatan.kegiatan_id')
                ->where('ka.approval_level', 'Bendahara-Setor')
                ->where('ka.status', 'Disetujui');
        })->count();

        return [
            'total_kak' => $totalKak,
            'total_kegiatan' => $totalKegiatan,
            'pending_approvals' => $pendingApprovals,
            'approved_kak' => $approvedKak,
            'kegiatan_selesai' => $kegiatanSelesai,
        ];
    }

    /**
     * Get Rektorat/Direktur dashboard details including trends, activities, serapan, overview.
     */
    public function getDirekturDashboardData(string $period): array
    {
        $startDate = $this->getStartDate($period);

        return [
            'overview' => $this->getOverview($startDate),
            'by_jurusan' => $this->getByJurusan($startDate),
            'trends' => $this->getTrends($startDate),
            'recent_activities' => $this->getRecentActivities(10),
            'videos' => $this->getVideos(),
            'period' => $period,
            'start_date' => $startDate->format('Y-m-d'),
            'end_date' => now()->format('Y-m-d'),
        ];
    }

    /**
     * Get FULL Direktur dashboard data for mobile API consumption.
     * Includes overview, by_jurusan (with topsis_score), topsis_activities,
     * trends, recent_activities, spk_config, and stats.
     */
    public function getDirekturFullDashboard(string $period = 'year'): array
    {
        $startDate = $this->getStartDate($period);
        $config = SpkConfig::getActive();

        // Get evaluated activities with LPJ submitted
        $kegiatansRaw = Kegiatan::with([
            'kak.pengusul',
            'kak.anggaran',
            'kak.ikus',
            'approvals',
        ])
            ->whereNotNull('lpj_submitted_at')
            ->whereHas('kak', function ($query) use ($startDate) {
                $query->where('created_at', '>=', $startDate);
            })
            ->get();

        $topsisResults = $this->calculateTopsisForService($kegiatansRaw, $config);

        // Build by_jurusan with topsis_score
        $topsisByJurusan = $topsisResults->groupBy('jurusan');
        $jurusanAverages = [];
        foreach ($topsisByJurusan as $namaJurusan => $list) {
            $jurusanAverages[$namaJurusan] = round($list->avg('topsis_score') * 100, 2);
        }

        $overview = $this->getOverview($startDate);
        $byJurusan = $this->getByJurusan($startDate);

        // Merge topsis_score into byJurusan
        foreach ($byJurusan as &$row) {
            $row['topsis_score'] = $jurusanAverages[$row['nama_jurusan']] ?? 0;
        }
        unset($row);

        // Derive best/worst unit for AI summary
        $bestUnit = collect($byJurusan)->sortByDesc('persentase_serapan')->first();
        $worstUnit = collect($byJurusan)->sortByDesc(fn ($j) => $j['dana_diminta'] - $j['dana_terserap'])->first();

        // Build stats (subset for mobile stat cards)
        $stats = [
            'total_kak' => $overview['total_kak'],
            'kegiatan_selesai' => $overview['kegiatan_selesai'],
            'total_kegiatan' => $overview['total_kegiatan'],
            'approved_kak' => KAK::where('status_id', 3)->count(),
            'draft_kak' => 0,
            'review_kak' => KAK::where('status_id', 2)->count(),
            'rejected_kak' => KAK::where('status_id', 4)->count(),
        ];

        return [
            'stats' => $stats,
            'overview' => $overview,
            'by_jurusan' => $byJurusan,
            'topsis_activities' => $topsisResults->toArray(),
            'trends' => $this->getTrends($startDate),
            'recent_activities' => $this->getRecentActivities(10),
            'spk_config' => $config ? [
                'weight_waktu' => $config->weight_waktu ?? 25,
                'weight_anggaran' => $config->weight_anggaran ?? 25,
                'weight_output' => $config->weight_output ?? 25,
                'weight_lpj' => $config->weight_lpj ?? 25,
            ] : ['weight_waktu' => 25, 'weight_anggaran' => 25, 'weight_output' => 25, 'weight_lpj' => 25],
            'period' => $period,
            'best_unit' => $bestUnit,
            'worst_unit' => $worstUnit,
        ];
    }

    /**
     * Calculate TOPSIS scores for service usage (mobile API).
     * Mirrors the logic in DashboardDirekturController::calculateTopsis().
     */
    private function calculateTopsisForService($kegiatans, $config)
    {
        if ($kegiatans->isEmpty()) {
            return collect();
        }

        $alternatives = [];
        foreach ($kegiatans as $k) {
            // C1 – Kesesuaian Waktu
            $c1DebugRencana = null;
            $c1DebugAktual = null;
            $c1DebugDeviasi = null;
            $c1Source = 'stored';

            if (! is_null($k->spk_kesesuaian_waktu)) {
                $c1 = (int) $k->spk_kesesuaian_waktu;
                $c1Source = 'stored';
            } elseif ($k->kak->tanggal_mulai && $k->kak->tanggal_selesai && $k->tanggal_mulai_final) {
                $rencanaStart = $k->kak->tanggal_mulai;
                $rencanaEnd = $k->kak->tanggal_selesai;
                $aktualStart = $k->tanggal_mulai_final;
                $aktualEnd = $k->tanggal_selesai_final ?? $k->lpj_submitted_at;

                $durasiRencana = max(1, $rencanaStart->diffInDays($rencanaEnd));
                $durasiAktual = $aktualEnd ? max(1, $aktualStart->diffInDays($aktualEnd)) : $durasiRencana;

                $deviasiPersen = abs($durasiAktual - $durasiRencana) / $durasiRencana * 100;
                $c1 = (int) max(50, min(100, round(100 - $deviasiPersen)));

                $c1DebugRencana = $durasiRencana;
                $c1DebugAktual = $durasiAktual;
                $c1DebugDeviasi = round($deviasiPersen, 2);
                $c1Source = 'calculated';
            } else {
                $c1 = (int) ($config->waktu_max ?? 100);
                $c1Source = 'default';
            }

            // C2 – Ketepatan Anggaran
            $c2DebugRencana = null;
            $c2DebugAktual = null;
            $c2DebugDeviasi = null;
            $c2Source = 'stored';

            if (! is_null($k->spk_ketepatan_anggaran)) {
                $c2 = (int) $k->spk_ketepatan_anggaran;
                $c2Source = 'stored';
            } else {
                $totalBudget = (float) $k->kak->anggaran->sum('jumlah_diusulkan');
                $totalRealization = (float) $k->kak->anggaran->sum(function ($item) {
                    return ($item->realisasi_volume1 ?? 1)
                        * ($item->realisasi_volume2 ?? 1)
                        * ($item->realisasi_volume3 ?? 1)
                        * ($item->realisasi_harga_satuan ?? 0);
                });

                if ($totalBudget > 0) {
                    $deviasiPersen = abs($totalRealization - $totalBudget) / $totalBudget * 100;
                    $c2 = (int) max(50, min(100, round(100 - $deviasiPersen)));
                    $c2DebugDeviasi = round($deviasiPersen, 2);
                } else {
                    $c2 = (int) ($config->anggaran_max ?? 100);
                }

                $c2DebugRencana = round($totalBudget);
                $c2DebugAktual = round($totalRealization);
                $c2Source = 'calculated';
            }

            // C3 – Kesesuaian Output
            $c3Source = 'stored';
            $c3DebugTotal = null;
            $c3DebugTerpenuhi = null;

            if (! is_null($k->spk_kesesuaian_output)) {
                $c3 = (int) $k->spk_kesesuaian_output;
                $c3Source = 'stored';
            } else {
                $totalIku = $k->kak->ikus->count();
                $ikuTerpenuhi = $k->kak->ikus->where('terpenuhi', true)->count();
                $persenIku = $totalIku > 0 ? round($ikuTerpenuhi / $totalIku * 100) : 100;
                $c3 = (int) $persenIku;
                $c3DebugTotal = $totalIku;
                $c3DebugTerpenuhi = $ikuTerpenuhi;
                $c3Source = 'calculated';
            }

            // C4 – Ketepatan LPJ
            $c4DebugHariTotal = null;
            $c4DebugHariTerlambat = null;
            $c4Source = 'stored';

            if (! is_null($k->spk_ketepatan_lpj)) {
                $c4 = (int) $k->spk_ketepatan_lpj;
                $c4Source = 'stored';
            } else {
                $c4 = (int) ($config->lpj_max ?? 100);
                $bendaharaLpj = $k->approvals->where('approval_level', 'Bendahara-LPJ')->first();

                if ($bendaharaLpj && $bendaharaLpj->activated_at) {
                    $start = Carbon::parse($bendaharaLpj->activated_at);
                    $end = $bendaharaLpj->approved_at
                        ? Carbon::parse($bendaharaLpj->approved_at)
                        : now();
                    $daysTaken = (int) $start->diffInDays($end);
                    $daysLate = max(0, $daysTaken - 14);
                    $c4 = (int) max(50, ($config->lpj_max ?? 100) - $daysLate);

                    $c4DebugHariTotal = $daysTaken;
                    $c4DebugHariTerlambat = $daysLate;
                }
                $c4Source = 'calculated';
            }

            $alternatives[] = [
                'kegiatan_id' => $k->kegiatan_id,
                'nama_kegiatan' => $k->kak->nama_kegiatan ?? '-',
                'pengusul' => $k->kak->pengusul->nama_lengkap ?? '-',
                'jurusan' => $this->parseJurusan($k->kak->pengusul->nama_lengkap ?? ''),
                'c1' => $c1,
                'c2' => $c2,
                'c3' => $c3,
                'c4' => $c4,
                // Debug / audit trail for the TOPSIS detail modal
                'c1_debug' => [
                    'source' => $c1Source,
                    'durasi_rencana' => $c1DebugRencana,
                    'durasi_aktual' => $c1DebugAktual,
                    'deviasi_persen' => $c1DebugDeviasi,
                    'tgl_mulai_rencana' => $k->kak->tanggal_mulai?->format('d/m/Y'),
                    'tgl_selesai_rencana' => $k->kak->tanggal_selesai?->format('d/m/Y'),
                    'tgl_mulai_aktual' => $k->tanggal_mulai_final?->format('d/m/Y'),
                    'tgl_selesai_aktual' => ($k->tanggal_selesai_final ?? $k->lpj_submitted_at)?->format('d/m/Y'),
                ],
                'c2_debug' => [
                    'source' => $c2Source,
                    'anggaran_rencana' => $c2DebugRencana,
                    'anggaran_aktual' => $c2DebugAktual,
                    'deviasi_persen' => $c2DebugDeviasi,
                ],
                'c3_debug' => [
                    'source' => $c3Source,
                    'total_iku' => $c3DebugTotal,
                    'terpenuhi' => $c3DebugTerpenuhi,
                    'persentase' => isset($c3DebugTotal) && $c3DebugTotal > 0 ? round(($c3DebugTerpenuhi / $c3DebugTotal) * 100, 1) : null,
                ],
                'c4_debug' => [
                    'source' => $c4Source,
                    'hari_di_lpj' => $c4DebugHariTotal,
                    'hari_terlambat' => $c4DebugHariTerlambat,
                    'penalty' => $c4DebugHariTerlambat,
                ],
            ];
        }

        $w1 = (float) ($config->weight_waktu ?? 25);
        $w2 = (float) ($config->weight_anggaran ?? 25);
        $w3 = (float) ($config->weight_output ?? 25);
        $w4 = (float) ($config->weight_lpj ?? 25);

        // Step 1: Normalization divisors (Euclidean norm per criterion)
        $sumC1 = array_sum(array_map(fn ($a) => $a['c1'] ** 2, $alternatives));
        $sumC2 = array_sum(array_map(fn ($a) => $a['c2'] ** 2, $alternatives));
        $sumC3 = array_sum(array_map(fn ($a) => $a['c3'] ** 2, $alternatives));
        $sumC4 = array_sum(array_map(fn ($a) => $a['c4'] ** 2, $alternatives));

        $normC1 = $sumC1 > 0 ? sqrt($sumC1) : 1;
        $normC2 = $sumC2 > 0 ? sqrt($sumC2) : 1;
        $normC3 = $sumC3 > 0 ? sqrt($sumC3) : 1;
        $normC4 = $sumC4 > 0 ? sqrt($sumC4) : 1;

        // Step 2: Weighted normalized matrix
        $weighted = [];
        foreach ($alternatives as $alt) {
            $r1 = $alt['c1'] / $normC1;
            $r2 = $alt['c2'] / $normC2;
            $r3 = $alt['c3'] / $normC3;
            $r4 = $alt['c4'] / $normC4;

            $weighted[] = array_merge($alt, [
                'r1' => round($r1, 6),
                'r2' => round($r2, 6),
                'r3' => round($r3, 6),
                'r4' => round($r4, 6),
                'v1' => round($r1 * $w1, 6),
                'v2' => round($r2 * $w2, 6),
                'v3' => round($r3 * $w3, 6),
                'v4' => round($r4 * $w4, 6),
                // Store norm values for modal reference
                'norm_c1' => round($normC1, 4),
                'norm_c2' => round($normC2, 4),
                'norm_c3' => round($normC3, 4),
                'norm_c4' => round($normC4, 4),
                'w1' => $w1, 'w2' => $w2, 'w3' => $w3, 'w4' => $w4,
            ]);
        }

        // Step 3: Ideal positive (A+) and negative (A-)
        $idealPos1 = max(array_column($weighted, 'v1'));
        $idealPos2 = max(array_column($weighted, 'v2'));
        $idealPos3 = max(array_column($weighted, 'v3'));
        $idealPos4 = max(array_column($weighted, 'v4'));

        $idealNeg1 = min(array_column($weighted, 'v1'));
        $idealNeg2 = min(array_column($weighted, 'v2'));
        $idealNeg3 = min(array_column($weighted, 'v3'));
        $idealNeg4 = min(array_column($weighted, 'v4'));

        // Step 4: Distance to ideal and score
        $results = [];
        foreach ($weighted as $wAlt) {
            $sPos = sqrt(
                ($wAlt['v1'] - $idealPos1) ** 2 +
                ($wAlt['v2'] - $idealPos2) ** 2 +
                ($wAlt['v3'] - $idealPos3) ** 2 +
                ($wAlt['v4'] - $idealPos4) ** 2
            );

            $sNeg = sqrt(
                ($wAlt['v1'] - $idealNeg1) ** 2 +
                ($wAlt['v2'] - $idealNeg2) ** 2 +
                ($wAlt['v3'] - $idealNeg3) ** 2 +
                ($wAlt['v4'] - $idealNeg4) ** 2
            );

            $divider = $sPos + $sNeg;
            $score = $divider > 0 ? round($sNeg / $divider, 6) : 0;

            $kategori = match (true) {
                $score >= 0.8 => 'Sangat Baik',
                $score >= 0.6 => 'Baik',
                $score >= 0.4 => 'Cukup',
                default => 'Kurang',
            };

            $results[] = array_merge($wAlt, [
                // Ideal solutions for modal reference
                'ideal_pos' => [
                    'v1' => round($idealPos1, 6),
                    'v2' => round($idealPos2, 6),
                    'v3' => round($idealPos3, 6),
                    'v4' => round($idealPos4, 6),
                ],
                'ideal_neg' => [
                    'v1' => round($idealNeg1, 6),
                    'v2' => round($idealNeg2, 6),
                    'v3' => round($idealNeg3, 6),
                    'v4' => round($idealNeg4, 6),
                ],
                's_pos' => round($sPos, 6),
                's_neg' => round($sNeg, 6),
                'topsis_score' => $score,
                'kategori' => $kategori,
            ]);
        }

        usort($results, fn ($a, $b) => $b['topsis_score'] <=> $a['topsis_score']);

        return collect($results);
    }

    private function getVideos()
    {
        $panduan = Panduan::all();

        $videos = [];
        foreach ($panduan as $item) {
            $isVideo = false;
            if (empty($item->tipe_media)) {
                if (! empty($item->path_media)) {
                    if (filter_var($item->path_media, FILTER_VALIDATE_URL) ||
                        strpos($item->path_media, 'youtube.com') !== false ||
                        strpos($item->path_media, 'youtu.be') !== false) {
                        $isVideo = true;
                    }
                }
            } elseif ($item->tipe_media === 'video') {
                $isVideo = true;
            }

            if ($isVideo) {
                $videos[] = [
                    'title' => $item->judul_panduan,
                    'url' => $item->path_media,
                    'thumbnail' => null,
                ];
            }
        }

        return $videos;
    }

    private function getOverview(Carbon $startDate)
    {
        $totalKak = DB::table('t_kak')
            ->where('status_id', '!=', 4)
            ->where('created_at', '>=', $startDate)
            ->count();

        $kegiatanSelesai = DB::table('t_kegiatan as k')
            ->join('t_kak as t', 'k.kak_id', '=', 't.kak_id')
            ->whereExists(function ($query) {
                $query->select(DB::raw(1))
                    ->from('t_kegiatan_approval as ka')
                    ->whereColumn('ka.kegiatan_id', 'k.kegiatan_id')
                    ->where('ka.approval_level', 'Bendahara-Setor')
                    ->where('ka.status', 'Disetujui');
            })
            ->where('t.created_at', '>=', $startDate)
            ->distinct('k.kegiatan_id')
            ->count('k.kegiatan_id');

        $kegiatanBerlangsung = DB::table('t_kegiatan as k')
            ->join('t_kak as t', 'k.kak_id', '=', 't.kak_id')
            ->whereNotExists(function ($query) {
                $query->select(DB::raw(1))
                    ->from('t_kegiatan_approval as ka')
                    ->whereColumn('ka.kegiatan_id', 'k.kegiatan_id')
                    ->where('ka.approval_level', 'Bendahara-Setor')
                    ->where('ka.status', 'Disetujui');
            })
            ->where('t.created_at', '>=', $startDate)
            ->distinct('k.kegiatan_id')
            ->count('k.kegiatan_id');

        $danaDiminta = DB::table('t_kak_anggaran as tka')
            ->join('t_kak as t', 'tka.kak_id', '=', 't.kak_id')
            ->where('t.status_id', '!=', 4)
            ->where('t.created_at', '>=', $startDate)
            ->sum('tka.jumlah_diusulkan');

        $danaTerserap = $this->getTotalDanaTerserap($startDate);

        $persentaseSerapan = $danaDiminta > 0 ? round(($danaTerserap / $danaDiminta) * 100, 2) : 0;
        $budgetGrowth = $this->calculateBudgetGrowth($startDate);

        return [
            'total_kak' => (int) $totalKak,
            'kegiatan_selesai' => (int) $kegiatanSelesai,
            'kegiatan_berlangsung' => (int) $kegiatanBerlangsung,
            'total_kegiatan' => (int) ($kegiatanSelesai + $kegiatanBerlangsung),
            'dana_diminta' => (float) $danaDiminta,
            'dana_terserap' => (float) $danaTerserap,
            'persentase_serapan' => (float) $persentaseSerapan,
            'budget_growth' => $budgetGrowth,
        ];
    }

    private function getByJurusan(Carbon $startDate)
    {
        $users = User::all();
        $jurusanUsers = [];

        foreach ($users as $user) {
            $jurusan = $this->parseJurusan($user->nama_lengkap);
            if (! isset($jurusanUsers[$jurusan])) {
                $jurusanUsers[$jurusan] = [];
            }
            $jurusanUsers[$jurusan][] = $user->user_id;
        }

        $result = [];

        foreach ($jurusanUsers as $namaJurusan => $userIds) {
            if (empty($userIds)) {
                continue;
            }

            $kakDiajukan = DB::table('t_kak')
                ->whereIn('pengusul_user_id', $userIds)
                ->where('status_id', '!=', 4)
                ->where('created_at', '>=', $startDate)
                ->count();

            $kegiatanSelesai = DB::table('t_kegiatan as k')
                ->join('t_kak as t', 'k.kak_id', '=', 't.kak_id')
                ->whereIn('t.pengusul_user_id', $userIds)
                ->whereExists(function ($query) {
                    $query->select(DB::raw(1))
                        ->from('t_kegiatan_approval as ka')
                        ->whereColumn('ka.kegiatan_id', 'k.kegiatan_id')
                        ->where('ka.approval_level', 'Bendahara-Setor')
                        ->where('ka.status', 'Disetujui');
                })
                ->where('t.created_at', '>=', $startDate)
                ->distinct('k.kegiatan_id')
                ->count('k.kegiatan_id');

            $kegiatanBerlangsung = DB::table('t_kegiatan as k')
                ->join('t_kak as t', 'k.kak_id', '=', 't.kak_id')
                ->whereIn('t.pengusul_user_id', $userIds)
                ->whereNotExists(function ($query) {
                    $query->select(DB::raw(1))
                        ->from('t_kegiatan_approval as ka')
                        ->whereColumn('ka.kegiatan_id', 'k.kegiatan_id')
                        ->where('ka.approval_level', 'Bendahara-Setor')
                        ->where('ka.status', 'Disetujui');
                })
                ->where('t.created_at', '>=', $startDate)
                ->distinct('k.kegiatan_id')
                ->count('k.kegiatan_id');

            $danaDiminta = DB::table('t_kak_anggaran as tka')
                ->join('t_kak as t', 'tka.kak_id', '=', 't.kak_id')
                ->whereIn('t.pengusul_user_id', $userIds)
                ->where('t.status_id', '!=', 4)
                ->where('t.created_at', '>=', $startDate)
                ->sum('tka.jumlah_diusulkan');

            $danaTerserap = $this->getDanaTerserapByUserIds($userIds, $startDate);

            $persentaseSerapan = $danaDiminta > 0 ? round(($danaTerserap / $danaDiminta) * 100, 2) : 0;

            $result[] = [
                'nama_jurusan' => $namaJurusan,
                'kak_diajukan' => (int) $kakDiajukan,
                'kegiatan_selesai' => (int) $kegiatanSelesai,
                'kegiatan_berlangsung' => (int) $kegiatanBerlangsung,
                'dana_diminta' => (float) $danaDiminta,
                'dana_terserap' => (float) $danaTerserap,
                'persentase_serapan' => (float) $persentaseSerapan,
            ];
        }

        usort($result, function ($a, $b) {
            return $b['dana_diminta'] <=> $a['dana_diminta'];
        });

        return $result;
    }

    private function getTrends(Carbon $startDate)
    {
        $trends = [];
        $curr = $startDate->copy()->startOfMonth();
        $end = now()->endOfMonth();

        while ($curr <= $end) {
            $s = $curr->copy()->startOfMonth()->format('Y-m-d H:i:s');
            $e = $curr->copy()->endOfMonth()->format('Y-m-d H:i:s');
            $label = $curr->translatedFormat('M Y');

            $cnt = DB::table('t_kegiatan as k')
                ->join('t_kak as t', 'k.kak_id', '=', 't.kak_id')
                ->whereBetween('t.created_at', [$s, $e])
                ->count();

            $danaRencana = DB::table('t_kak_anggaran as tka')
                ->join('t_kak as t', 'tka.kak_id', '=', 't.kak_id')
                ->whereBetween('t.created_at', [$s, $e])
                ->where('t.status_id', '!=', 4)
                ->sum('tka.jumlah_diusulkan');

            $danaRealisasi = DB::table('t_pencairan_dana')
                ->whereBetween('created_at', [$s, $e])
                ->sum('jumlah_dicairkan');

            $trends[] = [
                'periode' => $label,
                'total_kegiatan' => (int) $cnt,
                'dana_diminta' => (float) $danaRencana,
                'dana_terserap' => (float) $danaRealisasi,
            ];

            $curr->addMonth();
        }

        return $trends;
    }

    private function getRecentActivities(int $limit = 10)
    {
        $activities = DB::table('t_kegiatan_approval as ka')
            ->join('t_kegiatan as k', 'ka.kegiatan_id', '=', 'k.kegiatan_id')
            ->join('t_kak as t', 'k.kak_id', '=', 't.kak_id')
            ->join('m_users as u', 't.pengusul_user_id', '=', 'u.user_id')
            ->whereIn('ka.status', ['Aktif', 'Disetujui', 'Ditolak', 'Revisi'])
            ->select(
                't.nama_kegiatan',
                'u.nama_lengkap as pengusul_nama',
                'ka.approval_level',
                'ka.status',
                'ka.updated_at as created_at'
            )
            ->orderBy('ka.updated_at', 'desc')
            ->limit($limit)
            ->get();

        return $activities->map(function ($act) {
            $act->jurusan = $this->parseJurusan($act->pengusul_nama);

            return (array) $act;
        })->toArray();
    }

    private function parseJurusan($namaLengkap)
    {
        if (! $namaLengkap) {
            return 'Unit Lain';
        }

        $patterns = [
            'Teknik Informatika Komputer' => '/Teknik Informatika Komputer|Informatika Komputer|jurusantik@/i',
            'Teknik Sipil' => '/Teknik Sipil|jurusansipil@/i',
            'Teknik Mesin' => '/Teknik Mesin|jurusanmesin@/i',
            'Teknik Grafika dan Penerbitan' => '/Grafika dan Penerbitan|Grafika|Penerbitan|jurusantgp@/i',
            'Akuntansi' => '/Admin Jurusan Akuntansi|jurusanak@/i',
            'Administrasi Niaga' => '/Administrasi Niaga|Admin Niaga|jurusanniaga@/i',
            'Teknik Elektro' => '/Teknik Elektro|jurusante@/i',
        ];

        foreach ($patterns as $jurusan => $pattern) {
            if (preg_match($pattern, $namaLengkap)) {
                return $jurusan;
            }
        }

        return 'Unit Lain';
    }

    private function getTotalDanaTerserap(Carbon $startDate)
    {
        $totalCompleted = DB::table('t_kegiatan as k')
            ->join('t_kak as t', 'k.kak_id', '=', 't.kak_id')
            ->join('t_kak_anggaran as tka', 't.kak_id', '=', 'tka.kak_id')
            ->join('t_kegiatan_approval as ka', 'k.kegiatan_id', '=', 'ka.kegiatan_id')
            ->where('t.created_at', '>=', $startDate)
            ->where('ka.approval_level', 'Bendahara-Setor')
            ->where('ka.status', 'Disetujui')
            ->sum(DB::raw('COALESCE(tka.realisasi_volume1, 1) * COALESCE(tka.realisasi_volume2, 1) * COALESCE(tka.realisasi_volume3, 1) * COALESCE(tka.realisasi_harga_satuan, 0)'));

        $totalInProgress = DB::table('t_kegiatan as k')
            ->join('t_kak as t', 'k.kak_id', '=', 't.kak_id')
            ->join('t_pencairan_dana as pd', 'k.kegiatan_id', '=', 'pd.kegiatan_id')
            ->where('t.created_at', '>=', $startDate)
            ->whereNotExists(function ($query) {
                $query->select(DB::raw(1))
                    ->from('t_kegiatan_approval as ka')
                    ->whereColumn('ka.kegiatan_id', 'k.kegiatan_id')
                    ->where('ka.approval_level', 'Bendahara-Setor')
                    ->where('ka.status', 'Disetujui');
            })
            ->sum('pd.jumlah_dicairkan');

        return $totalCompleted + $totalInProgress;
    }

    private function getDanaTerserapByUserIds(array $userIds, Carbon $startDate)
    {
        if (empty($userIds)) {
            return 0;
        }

        $totalCompleted = DB::table('t_kegiatan as k')
            ->join('t_kak as t', 'k.kak_id', '=', 't.kak_id')
            ->join('t_kak_anggaran as tka', 't.kak_id', '=', 'tka.kak_id')
            ->join('t_kegiatan_approval as ka', 'k.kegiatan_id', '=', 'ka.kegiatan_id')
            ->whereIn('t.pengusul_user_id', $userIds)
            ->where('t.created_at', '>=', $startDate)
            ->where('ka.approval_level', 'Bendahara-Setor')
            ->where('ka.status', 'Disetujui')
            ->sum(DB::raw('COALESCE(tka.realisasi_volume1, 1) * COALESCE(tka.realisasi_volume2, 1) * COALESCE(tka.realisasi_volume3, 1) * COALESCE(tka.realisasi_harga_satuan, 0)'));

        $totalInProgress = DB::table('t_kegiatan as k')
            ->join('t_kak as t', 'k.kak_id', '=', 't.kak_id')
            ->join('t_pencairan_dana as pd', 'k.kegiatan_id', '=', 'pd.kegiatan_id')
            ->whereIn('t.pengusul_user_id', $userIds)
            ->where('t.created_at', '>=', $startDate)
            ->whereNotExists(function ($query) {
                $query->select(DB::raw(1))
                    ->from('t_kegiatan_approval as ka')
                    ->whereColumn('ka.kegiatan_id', 'k.kegiatan_id')
                    ->where('ka.approval_level', 'Bendahara-Setor')
                    ->where('ka.status', 'Disetujui');
            })
            ->sum('pd.jumlah_dicairkan');

        return $totalCompleted + $totalInProgress;
    }

    private function calculateBudgetGrowth(Carbon $startDate)
    {
        $currentStart = $startDate->copy();
        $currentEnd = now();

        $daysDiff = $currentStart->diffInDays($currentEnd);

        $previousStart = $currentStart->copy()->subDays($daysDiff);
        $previousEnd = $currentStart->copy()->subDay();

        $currentBudget = DB::table('t_kak_anggaran as tka')
            ->join('t_kak as t', 'tka.kak_id', '=', 't.kak_id')
            ->where('t.created_at', '>=', $startDate)
            ->where('t.status_id', '!=', 4)
            ->sum('tka.jumlah_diusulkan');

        $previousBudget = DB::table('t_kak_anggaran as tka')
            ->join('t_kak as t', 'tka.kak_id', '=', 't.kak_id')
            ->whereBetween('t.created_at', [$previousStart->format('Y-m-d H:i:s'), $previousEnd->format('Y-m-d H:i:s')])
            ->where('t.status_id', '!=', 4)
            ->sum('tka.jumlah_diusulkan');

        if ($previousBudget == 0) {
            return $currentBudget > 0 ? 100 : 0;
        }

        $growth = (($currentBudget - $previousBudget) / $previousBudget) * 100;

        return round($growth, 2);
    }

    private function getStartDate($period)
    {
        return match ($period) {
            '3months' => now()->subMonths(3),
            '1year' => now()->subYear(),
            'year' => now()->startOfYear(),
            'all' => Carbon::create(2020, 1, 1),
            default => now()->subMonths(6),
        };
    }
}

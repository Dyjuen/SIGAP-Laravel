<?php

namespace App\Services;

use App\Models\KAK;
use App\Models\Kegiatan;
use App\Models\KegiatanApproval;
use App\Models\Panduan;
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

        $totalKak = KAK::when($tipeKegiatanId, fn ($q) => $q->where('tipe_kegiatan_id', $tipeKegiatanId))
            ->count();

        $recentKaks = KAK::with(['status', 'pengusul', 'tipeKegiatan'])
            ->whereIn('status_id', [2, 3, 4, 5])
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
                ->where('status', 'Aktif')
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

        return [
            'total_kak' => $totalKak,
            'total_kegiatan' => $totalKegiatan,
            'pending_approvals' => $pendingApprovals,
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

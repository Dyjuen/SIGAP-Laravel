<?php

namespace App\Http\Controllers;

use App\Models\KAK;
use App\Models\Kegiatan;
use App\Models\KegiatanApproval;
use App\Models\Panduan;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    /**
     * Render the appropriate dashboard based on the user's role.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $role = $user->getRoleName();

        return match ($role) {
            'Bendahara' => $this->bendaharaDashboard($request),
            'Pengusul' => $this->pengusulDashboard($request),
            'PPK' => $this->ppkDashboard($request),
            'Wadir' => $this->wadirDashboard($request),
            'Verifikator' => $this->verifikatorDashboard($request),
            default => $this->defaultDashboard($request),
        };
    }

    // ════════════════════════════════════════════════════════════════════
    // PENGUSUL DASHBOARD
    // ════════════════════════════════════════════════════════════════════

    private function pengusulDashboard(Request $request)
    {
        $user = $request->user();

        $totalKak = KAK::where('pengusul_user_id', $user->user_id)->count();
        $draftKak = KAK::where('pengusul_user_id', $user->user_id)->where('status_id', 1)->count();
        $reviewKak = KAK::where('pengusul_user_id', $user->user_id)->where('status_id', 2)->count();
        $approvedKak = KAK::where('pengusul_user_id', $user->user_id)->where('status_id', 3)->count();
        $rejectedKak = KAK::where('pengusul_user_id', $user->user_id)->whereIn('status_id', [4, 5])->count();

        $kegiatanAktif = Kegiatan::whereHas('kak', function ($q) use ($user) {
            $q->where('pengusul_user_id', $user->user_id);
        })->count();

        // Recent KAKs
        $recentKaks = KAK::with(['status', 'tipeKegiatan'])
            ->where('pengusul_user_id', $user->user_id)
            ->orderBy('updated_at', 'desc')
            ->limit(5)
            ->get()
            ->map(fn ($kak) => [
                'kak_id' => $kak->kak_id,
                'nama_kegiatan' => $kak->nama_kegiatan,
                'status_id' => $kak->status_id,
                'status_nama' => $kak->status?->nama_status,
                'tipe' => $kak->tipeKegiatan?->nama_tipe,
                'updated_at' => $kak->updated_at?->format('d M Y'),
            ]);

        return Inertia::render('Dashboard', [
            'stats' => [
                'total_kak' => $totalKak,
                'draft_kak' => $draftKak,
                'review_kak' => $reviewKak,
                'approved_kak' => $approvedKak,
                'rejected_kak' => $rejectedKak,
                'kegiatan_aktif' => $kegiatanAktif,
            ],
            'recent_kaks' => $recentKaks,
        ]);
    }

    // ════════════════════════════════════════════════════════════════════
    // PPK DASHBOARD
    // ════════════════════════════════════════════════════════════════════

    private function ppkDashboard(Request $request)
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
            ->limit(5)
            ->get()
            ->map(fn ($k) => [
                'kegiatan_id' => $k->kegiatan_id,
                'nama_kegiatan' => $k->kak?->nama_kegiatan,
                'pengusul' => $k->kak?->pengusul?->nama_lengkap,
                'tipe' => $k->kak?->tipeKegiatan?->nama_tipe,
                'created_at' => $k->created_at?->format('d M Y'),
            ]);

        return Inertia::render('Dashboard', [
            'stats' => [
                'pending_count' => $pendingCount,
                'approved_count' => $approvedCount,
                'total_kegiatan' => $totalKegiatan,
            ],
            'pending_kegiatan' => $pendingKegiatan,
        ]);
    }

    // ════════════════════════════════════════════════════════════════════
    // WADIR DASHBOARD
    // ════════════════════════════════════════════════════════════════════

    private function wadirDashboard(Request $request)
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
            ->limit(5)
            ->get()
            ->map(fn ($k) => [
                'kegiatan_id' => $k->kegiatan_id,
                'nama_kegiatan' => $k->kak?->nama_kegiatan,
                'pengusul' => $k->kak?->pengusul?->nama_lengkap,
                'tipe' => $k->kak?->tipeKegiatan?->nama_tipe,
                'created_at' => $k->created_at?->format('d M Y'),
            ]);

        return Inertia::render('Dashboard', [
            'stats' => [
                'pending_count' => $pendingCount,
                'approved_count' => $approvedCount,
                'total_kegiatan' => $totalKegiatan,
            ],
            'pending_kegiatan' => $pendingKegiatan,
        ]);
    }

    // ════════════════════════════════════════════════════════════════════
    // VERIFIKATOR DASHBOARD
    // ════════════════════════════════════════════════════════════════════

    private function verifikatorDashboard(Request $request)
    {
        $user = $request->user();

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

        $recentKaks = KAK::with(['status', 'pengusul'])
            ->where('status_id', 2)
            ->when($tipeKegiatanId, fn ($q) => $q->where('tipe_kegiatan_id', $tipeKegiatanId))
            ->orderBy('updated_at', 'desc')
            ->limit(5)
            ->get()
            ->map(fn ($kak) => [
                'kak_id' => $kak->kak_id,
                'nama_kegiatan' => $kak->nama_kegiatan,
                'pengusul' => $kak->pengusul?->nama_lengkap,
                'updated_at' => $kak->updated_at?->format('d M Y'),
            ]);

        return Inertia::render('Dashboard', [
            'stats' => [
                'pending_kak' => $pendingKak,
                'approved_kak' => $approvedKak,
                'total_kak' => $totalKak,
            ],
            'recent_kaks' => $recentKaks,
        ]);
    }

    // ════════════════════════════════════════════════════════════════════
    // ADMIN / DEFAULT DASHBOARD
    // ════════════════════════════════════════════════════════════════════

    private function defaultDashboard(Request $request)
    {
        $totalKak = KAK::count();
        $totalKegiatan = Kegiatan::count();
        $pendingApprovals = KegiatanApproval::where('status', 'Aktif')->count();

        return Inertia::render('Dashboard', [
            'stats' => [
                'total_kak' => $totalKak,
                'total_kegiatan' => $totalKegiatan,
                'pending_approvals' => $pendingApprovals,
            ],
        ]);
    }

    // ════════════════════════════════════════════════════════════════════
    // BENDAHARA DASHBOARD
    // ════════════════════════════════════════════════════════════════════

    private function bendaharaDashboard(Request $request)
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
                'total_anggaran_diusulkan' => $totalAnggaran,
                'dana_dicairkan' => $totalDicairkan,
                'sisa_dana' => $totalAnggaran - $totalDicairkan,
                'status' => $status,
                'lpj_submitted_at' => $kegiatan->lpj_submitted_at,
                'current_approval_level' => $currentApproval?->approval_level,
            ];
        });

        $videos = [];
        if (class_exists(Panduan::class)) {
            $videos = Panduan::where('tipe_media', 'Video')
                ->limit(6)
                ->get()
                ->map(fn ($v) => [
                    'judul_panduan' => $v->judul_panduan,
                    'path_media' => $v->path_media,
                ]);
        }

        return Inertia::render('Bendahara/Dashboard', [
            'kegiatans' => $mappedKegiatans,
            'stats' => [
                'waiting_count' => $waitingCount,
                'disbursed_count' => $disbursedCount,
                'lpj_count' => $lpjCount,
                'total_disbursed_amount' => $totalDisbursedAmount,
                'total_undisbursed_amount' => $totalUndisbursedAmount,
            ],
            'videos' => $videos,
        ]);
    }
}

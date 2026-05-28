<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\KAK;
use App\Models\Kegiatan;
use App\Models\KegiatanApproval;
use Illuminate\Http\Request;

class DashboardApiController extends Controller
{
    /**
     * Verifikator Dashboard
     * GET /api/verifikator/dashboard
     */
    public function verifikator(Request $request)
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
                'pengusul_nama' => $kak->pengusul?->nama_lengkap,
                'tipe' => $kak->tipeKegiatan?->nama_tipe,
                'updated_at' => $kak->updated_at?->format('d M Y'),
            ]);

        return response()->json([
            'stats' => [
                'pending_kak' => $pendingKak,
                'approved_kak' => $approvedKak,
                'total_kak' => $totalKak,
            ],
            'recent_kaks' => $recentKaks,
        ]);
    }

    /**
     * PPK Dashboard
     * GET /api/ppk/dashboard
     */
    public function ppk(Request $request)
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
                'pengusul_nama' => $k->kak?->pengusul?->nama_lengkap,
                'tipe' => $k->kak?->tipeKegiatan?->nama_tipe,
                'created_at' => $k->created_at?->format('d M Y'),
            ]);

        return response()->json([
            'stats' => [
                'pending_count' => $pendingCount,
                'approved_count' => $approvedCount,
                'total_kegiatan' => $totalKegiatan,
            ],
            'pending_kegiatan' => $pendingKegiatan,
        ]);
    }

    /**
     * Wadir Dashboard
     * GET /api/wadir/dashboard
     */
    public function wadir(Request $request)
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
                'pengusul_nama' => $k->kak?->pengusul?->nama_lengkap,
                'tipe' => $k->kak?->tipeKegiatan?->nama_tipe,
                'created_at' => $k->created_at?->format('d M Y'),
            ]);

        return response()->json([
            'stats' => [
                'pending_count' => $pendingCount,
                'approved_count' => $approvedCount,
                'total_kegiatan' => $totalKegiatan,
            ],
            'pending_kegiatan' => $pendingKegiatan,
        ]);
    }

    /**
     * Bendahara Dashboard
     * GET /api/bendahara/dashboard
     */
    public function bendahara(Request $request)
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
                'pengusul_nama' => $kegiatan->kak?->pengusul?->nama_lengkap ?? '-',
                'total_anggaran_diusulkan' => $totalAnggaran,
                'dana_dicairkan' => $totalDicairkan,
                'sisa_dana' => $totalAnggaran - $totalDicairkan,
                'status' => $status,
            ];
        });

        return response()->json([
            'stats' => [
                'waiting_count' => $waitingCount,
                'disbursed_count' => $disbursedCount,
                'lpj_count' => $lpjCount,
                'total_disbursed_amount' => $totalDisbursedAmount,
                'total_undisbursed_amount' => $totalUndisbursedAmount,
            ],
            'kegiatans' => $mappedKegiatans,
        ]);
    }

    /**
     * Direktur Dashboard
     * GET /api/direktur/dashboard
     */
    public function direktur(Request $request)
    {
        $totalKak = KAK::count();
        $totalKegiatan = Kegiatan::count();
        $pendingApprovals = KegiatanApproval::where('status', 'Aktif')->count();

        return response()->json([
            'stats' => [
                'total_kak' => $totalKak,
                'total_kegiatan' => $totalKegiatan,
                'pending_approvals' => $pendingApprovals,
            ],
        ]);
    }
}

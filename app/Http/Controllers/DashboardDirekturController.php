<?php

namespace App\Http\Controllers;

use App\Models\KAK;
use App\Models\Kegiatan;
use App\Models\Panduan;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardDirekturController extends Controller
{
    public function index(Request $request)
    {
        $period = $request->query('period', '6months');
        $startDate = $this->getStartDate($period);

        $data = [
            'overview' => $this->getOverview($startDate),
            'by_jurusan' => $this->getByJurusan($startDate),
            'trends' => $this->getTrends($startDate),
            'recent_activities' => $this->getRecentActivities(10),
            'videos' => $this->getVideos(),
            'period' => $period,
            'start_date' => $startDate->format('Y-m-d'),
            'end_date' => now()->format('Y-m-d'),
        ];

        return Inertia::render('Direktur/Dashboard', [
            'dashboardData' => $data,
        ]);
    }

    private function getVideos()
    {
        $user = auth()->user();

        // Asumsi relasi user roles tersedia, jika tidak kita pakai eager loading atau query
        // Untuk sekarang kita fetch semua panduan bertipe video atau ber-url youtube
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
        // Total KAK diajukan (status_id != 4/Ditolak)
        $totalKak = DB::table('t_kak')
            ->where('status_id', '!=', 4)
            ->where('created_at', '>=', $startDate)
            ->count();

        // Kegiatan Selesai
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

        // Kegiatan Berlangsung
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

        // Total Dana Diminta
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
            $jurusanUsers[$jurusan][] = $user->user_id; // Primary key user adalah user_id
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
            $label = $curr->translatedFormat('M Y'); // Uses localized month

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

    private function getRecentActivities($limit = 10)
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

            // created_at passed to frontend, frontend calculates 'time ago' or we can calculate here.
            // Returning the raw string for JS compatibility, format 'Y-m-d H:i:s'
            return (array) $act;
        })->toArray();
    }

    // --- Helpers ---

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

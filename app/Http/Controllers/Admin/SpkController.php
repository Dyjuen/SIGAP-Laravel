<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Kegiatan;
use App\Models\SpkConfig;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SpkController extends Controller
{
    /**
     * Display the SPK dashboard for Super Admin.
     */
    public function index(Request $request): Response
    {
        $config = SpkConfig::getActive();

        // Get all activities that have submitted LPJ
        $kegiatansRaw = Kegiatan::with([
            'kak.pengusul',
            'kak.anggaran',
        ])
            ->whereNotNull('lpj_submitted_at')
            ->get();

        $kegiatans = $kegiatansRaw->map(function ($kegiatan) use ($config) {
            // Recalculate dynamic budget score
            $totalBudget = (float) $kegiatan->kak->anggaran->sum('jumlah_diusulkan');
            $totalRealization = (float) $kegiatan->kak->anggaran->sum('realisasi_jumlah');

            $ketepatanAnggaran = $config->anggaran_max;
            if ($totalBudget > 0) {
                $ratio = $totalRealization / $totalBudget;
                if (abs($ratio - 1) >= 0.001) {
                    $differencePercentage = abs(1 - $ratio) * 100;
                    $ketepatanAnggaran = (int) max($config->anggaran_min, min($config->anggaran_max, round($config->anggaran_max - $differencePercentage)));
                }
            }

            // Recalculate dynamic LPJ timing score
            $ketepatanLpj = $config->lpj_max;
            if ($kegiatan->tgl_batas_lpj) {
                $deadline = Carbon::parse($kegiatan->tgl_batas_lpj);
                $submissionTime = Carbon::parse($kegiatan->lpj_submitted_at);
                if ($submissionTime->gt($deadline)) {
                    $daysLate = $submissionTime->diffInDays($deadline);
                    $ketepatanLpj = (int) max($config->lpj_min, min($config->lpj_max, $config->lpj_max - ($daysLate * $config->lpj_penalty_per_day)));
                }
            }

            $waktu = (int) $kegiatan->spk_kesesuaian_waktu;
            $output = (int) $kegiatan->spk_kesesuaian_output;

            // Weighted SPK calculation
            $totalScore = (
                ($waktu * $config->weight_waktu) +
                ($ketepatanAnggaran * $config->weight_anggaran) +
                ($output * $config->weight_output) +
                ($ketepatanLpj * $config->weight_lpj)
            ) / 100.0;

            $totalScore = round($totalScore, 2);

            // Determine dynamic performance category
            if ($totalScore >= 85) {
                $kategori = 'Sangat Baik';
            } elseif ($totalScore >= 70) {
                $kategori = 'Baik';
            } elseif ($totalScore >= 55) {
                $kategori = 'Cukup';
            } else {
                $kategori = 'Kurang';
            }

            return [
                'kegiatan_id' => $kegiatan->kegiatan_id,
                'nama_kegiatan' => $kegiatan->kak->nama_kegiatan ?? '-',
                'pengusul' => $kegiatan->kak->pengusul->nama_lengkap ?? '-',
                'waktu_score' => $waktu,
                'anggaran_score' => $ketepatanAnggaran,
                'output_score' => $output,
                'lpj_score' => $ketepatanLpj,
                'total_score' => $totalScore,
                'kategori' => $kategori,
                'lpj_submitted_at' => $kegiatan->lpj_submitted_at->format('d M Y H:i'),
            ];
        });

        // Compute overall statistics
        $totalEvaluated = $kegiatans->count();
        $averageScore = $totalEvaluated > 0 ? round($kegiatans->avg('total_score'), 2) : 0;

        $highestKegiatan = null;
        $lowestKegiatan = null;
        if ($totalEvaluated > 0) {
            $sorted = $kegiatans->sortByDesc('total_score');
            $highest = $sorted->first();
            $highestKegiatan = [
                'nama_kegiatan' => $highest['nama_kegiatan'],
                'score' => $highest['total_score'],
            ];

            $lowest = $sorted->last();
            $lowestKegiatan = [
                'nama_kegiatan' => $lowest['nama_kegiatan'],
                'score' => $lowest['total_score'],
            ];
        }

        $categoryCounts = [
            'Sangat Baik' => $kegiatans->where('kategori', 'Sangat Baik')->count(),
            'Baik' => $kegiatans->where('kategori', 'Baik')->count(),
            'Cukup' => $kegiatans->where('kategori', 'Cukup')->count(),
            'Kurang' => $kegiatans->where('kategori', 'Kurang')->count(),
        ];

        return Inertia::render('Admin/Spk/Index', [
            'spk_config' => $config,
            'kegiatans' => $kegiatans,
            'statistics' => [
                'average_score' => $averageScore,
                'highest_kegiatan' => $highestKegiatan,
                'lowest_kegiatan' => $lowestKegiatan,
                'total_evaluated' => $totalEvaluated,
                'category_counts' => $categoryCounts,
            ],
        ]);
    }

    /**
     * Update the SPK weight configuration.
     */
    public function updateConfig(Request $request): RedirectResponse
    {
        $request->validate([
            'weight_waktu' => ['required', 'numeric', 'min:0', 'max:100'],
            'weight_anggaran' => ['required', 'numeric', 'min:0', 'max:100'],
            'weight_output' => ['required', 'numeric', 'min:0', 'max:100'],
            'weight_lpj' => ['required', 'numeric', 'min:0', 'max:100'],
            'waktu_min' => ['required', 'integer', 'min:0', 'max:100'],
            'waktu_max' => ['required', 'integer', 'min:0', 'max:100', 'gt:waktu_min'],
            'anggaran_min' => ['required', 'integer', 'min:0', 'max:100'],
            'anggaran_max' => ['required', 'integer', 'min:0', 'max:100', 'gt:anggaran_min'],
            'output_min' => ['required', 'integer', 'min:0', 'max:100'],
            'output_max' => ['required', 'integer', 'min:0', 'max:100', 'gt:output_min'],
            'lpj_min' => ['required', 'integer', 'min:0', 'max:100'],
            'lpj_max' => ['required', 'integer', 'min:0', 'max:100', 'gt:lpj_min'],
            'lpj_penalty_per_day' => ['required', 'integer', 'min:0', 'max:50'],
        ], [
            'required' => ':attribute wajib diisi.',
            'numeric' => ':attribute harus berupa angka.',
            'integer' => ':attribute harus berupa bilangan bulat.',
            'min' => ':attribute minimal :min.',
            'max' => ':attribute maksimal :max.',
            'gt' => ':attribute harus lebih besar dari :value.',
        ]);

        // Custom validation check: sum of weights must equal 100%
        $sum = floatval($request->weight_waktu) +
               floatval($request->weight_anggaran) +
               floatval($request->weight_output) +
               floatval($request->weight_lpj);

        if (abs($sum - 100.0) > 0.001) {
            return redirect()->back()
                ->withInput()
                ->withErrors(['weights_sum' => 'Jumlah seluruh bobot kriteria harus tepat bernilai 100% (saat ini '.$sum.'%).']);
        }

        $config = SpkConfig::getActive();
        $config->update($request->all());

        return redirect()->back()->with('success', 'Konfigurasi parameter SPK berhasil diperbarui.');
    }
}

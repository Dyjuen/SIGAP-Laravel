<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePencairanRequest;
use App\Models\Kegiatan;
use App\Services\PencairanService;
use Illuminate\Http\Request;

class PencairanApiController extends Controller
{
    protected PencairanService $pencairanService;

    public function __construct(PencairanService $pencairanService)
    {
        $this->pencairanService = $pencairanService;
    }

    /**
     * Display the Bendahara's pencairan list.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        if (! in_array($user->getRoleName(), ['Bendahara', 'Admin'])) {
            return response()->json(['message' => 'Hanya Bendahara yang dapat mengakses halaman pencairan.'], 403);
        }

        $kegiatans = Kegiatan::with([
            'kak.pengusul',
            'kak.mataAnggaran',
            'kak.tipeKegiatan',
            'approvals',
        ])
            ->withSum('pencairanDana', 'jumlah_dicairkan')
            ->whereHas('approvals', function ($query) {
                $query->where('approval_level', 'Bendahara-Cair')
                    ->where('status', 'Aktif');
            })
            ->get();

        $kegiatans->load(['kak' => fn ($q) => $q->withSum('anggaran', 'jumlah_diusulkan')]);

        $mappedKegiatans = $kegiatans->map(function (Kegiatan $kegiatan) {
            $totalAnggaran = (float) ($kegiatan->kak?->anggaran_sum_jumlah_diusulkan ?? 0);
            $totalDicairkan = (float) ($kegiatan->pencairan_dana_sum_jumlah_dicairkan ?? 0);

            $wadir2Catatan = $kegiatan->approvals
                ->where('approval_level', 'Wadir2')
                ->first()
                ?->catatan;

            return [
                'kegiatan_id' => $kegiatan->kegiatan_id,
                'kak_id' => $kegiatan->kak_id,
                'nama_kegiatan' => $kegiatan->kak?->nama_kegiatan ?? '-',
                'pelaksana_manual' => $kegiatan->pelaksana_manual,
                'penanggung_jawab_manual' => $kegiatan->penanggung_jawab_manual,
                'catatan_wadir2' => $wadir2Catatan,
                'total_anggaran_diusulkan' => $totalAnggaran,
                'dana_dicairkan' => $totalDicairkan,
                'sisa_dana' => $totalAnggaran - $totalDicairkan,
            ];
        });

        return response()->json($mappedKegiatans);
    }

    /**
     * Return the financial summary (sisa dana) for a given kegiatan.
     */
    public function sisaDana(Request $request, Kegiatan $kegiatan)
    {
        $user = $request->user();

        if (! $this->canAccessKegiatan($user, $kegiatan)) {
            return response()->json(['message' => 'Anda tidak memiliki akses ke kegiatan ini.'], 403);
        }

        $summary = $this->pencairanService->computeSisaDana($kegiatan);

        return response()->json($summary);
    }

    /**
     * Record a new disbursement transaction (only Bendahara).
     */
    public function store(StorePencairanRequest $request, Kegiatan $kegiatan)
    {
        $user = $request->user();
        if (! in_array($user->getRoleName(), ['Bendahara', 'Admin'])) {
            return response()->json(['message' => 'Akses ditolak.'], 403);
        }

        try {
            $nominalPencairan = (float) $request->nominal_pencairan;

            $this->pencairanService->store(
                $kegiatan,
                $nominalPencairan,
                $request->keterangan,
                $user
            );

            return response()->json([
                'message' => 'Pencairan dana berhasil dicatat.',
            ]);
        } catch (\App\Exceptions\PencairanException $e) {
            return response()->json([
                'message' => $e->getMessage(),
                'errors' => [
                    'nominal_pencairan' => [$e->getMessage()]
                ]
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Gagal mencatat pencairan: '.$e->getMessage(),
            ], 500);
        }
    }

    /**
     * Complete the disbursement phase.
     */
    public function selesai(Request $request, Kegiatan $kegiatan)
    {
        $user = $request->user();

        if (! in_array($user->getRoleName(), ['Bendahara', 'Admin'])) {
            return response()->json(['message' => 'Hanya Bendahara yang dapat menyelesaikan proses pencairan.'], 403);
        }

        try {
            $this->pencairanService->selesai($kegiatan, $user);

            return response()->json([
                'message' => 'Proses pencairan berhasil diselesaikan dan tahap LPJ telah dimulai.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Gagal menyelesaikan proses pencairan: '.$e->getMessage(),
            ], 500);
        }
    }

    /**
     * Helper to check access.
     */
    private function canAccessKegiatan($user, Kegiatan $kegiatan): bool
    {
        $role = $user->getRoleName();

        if (in_array($role, ['Bendahara', 'Admin'])) {
            return true;
        }

        if ($role === 'Pengusul') {
            $kak = $kegiatan->kak;
            return $kak && $kak->pengusul_user_id === $user->user_id;
        }

        return false;
    }
}

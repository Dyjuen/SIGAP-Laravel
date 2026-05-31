<?php

namespace App\Http\Controllers;

use App\Exceptions\PencairanException;
use App\Http\Requests\StorePencairanRequest;
use App\Models\Kegiatan;
use App\Services\PencairanService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PencairanController extends Controller
{
    protected PencairanService $pencairanService;

    public function __construct(PencairanService $pencairanService)
    {
        $this->pencairanService = $pencairanService;
    }

    /**
     * Display the Bendahara's pencairan list page.
     * Only shows kegiatan where Bendahara-Cair approval is Aktif.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        // Only Bendahara and Admin can access this page
        if (! in_array($user->getRoleName(), ['Bendahara', 'Admin'])) {
            abort(403, 'Hanya Bendahara yang dapat mengakses halaman pencairan.');
        }

        // Build query with aggregate sums to avoid N+1.
        $query = Kegiatan::with([
            'kak.pengusul',
            'kak.mataAnggaran',
            'kak.tipeKegiatan',
            'approvals',
        ])
            ->withSum('pencairanDana', 'jumlah_dicairkan')
            ->whereHas('approvals', function ($query) {
                $query->where('approval_level', 'Bendahara-Cair')
                    ->where('status', 'Aktif');
            });

        // Apply filters
        if ($request->filled('start_date')) {
            $query->whereHas('pencairanDana', function ($q) use ($request) {
                $q->whereDate('tanggal_pencairan', '>=', $request->start_date);
            });
        }
        if ($request->filled('end_date')) {
            $query->whereHas('pencairanDana', function ($q) use ($request) {
                $q->whereDate('tanggal_pencairan', '<=', $request->end_date);
            });
        }

        $kegiatans = $query->get();

        // Eager-load the budget sum on each kegiatan's KAK (1 query for all records).
        $kegiatans->load(['kak' => fn ($q) => $q->withSum('anggaran', 'jumlah_diusulkan')]);

        $kegiatans = $kegiatans->map(function (Kegiatan $kegiatan) {
            // Pre-computed sums from withSum / loadSum — no extra queries per row.
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

        return Inertia::render('Pencairan/Index', [
            'kegiatans' => $kegiatans,
        ]);
    }

    /**
     * Return the financial summary (sisa dana) for a given kegiatan.
     * Access: Bendahara, Admin, or the Pengusul who owns the kegiatan.
     */
    public function sisaDana(Request $request, Kegiatan $kegiatan): JsonResponse
    {
        $user = $request->user();

        if (! $this->canAccessKegiatan($user, $kegiatan)) {
            abort(403, 'Anda tidak memiliki akses ke kegiatan ini.');
        }

        $summary = $this->pencairanService->computeSisaDana($kegiatan);

        return response()->json($summary);
    }

    /**
     * Record a new disbursement transaction (only Bendahara).
     */
    public function store(StorePencairanRequest $request, Kegiatan $kegiatan): RedirectResponse
    {
        try {
            $nominalPencairan = (float) $request->nominal_pencairan;

            $this->pencairanService->store(
                $kegiatan,
                $nominalPencairan,
                $request->keterangan,
                $request->user()
            );

            return redirect()->back()->with('success', 'Pencairan dana berhasil dicatat.');
        } catch (PencairanException $e) {
            // Handle error response specifically for nominal validation
            if ($e->getMessage() === 'Nominal pencairan melebihi sisa dana yang tersedia.') {
                return redirect()->back()->withErrors([
                    'nominal_pencairan' => $e->getMessage(),
                ]);
            }

            return redirect()->back()->withErrors([
                'message' => $e->getMessage(),
            ]);
        } catch (\Exception $e) {
            return redirect()->back()->withErrors([
                'message' => 'Gagal mencatat pencairan: '.$e->getMessage(),
            ]);
        }
    }

    /**
     * Complete the disbursement phase (UM Selesai).
     * Sets Bendahara-Cair → Disetujui, activates Bendahara-LPJ, updates KAK status to 10.
     */
    public function selesai(Request $request, Kegiatan $kegiatan): RedirectResponse
    {
        $user = $request->user();

        // Only Bendahara or Admin
        if (! in_array($user->getRoleName(), ['Bendahara', 'Admin'])) {
            abort(403, 'Hanya Bendahara yang dapat menyelesaikan proses pencairan.');
        }

        try {
            $this->pencairanService->selesai($kegiatan, $user);

            return redirect()->back()->with('success', 'Proses pencairan berhasil diselesaikan dan tahap LPJ telah dimulai.');
        } catch (\Exception $e) {
            return redirect()->back()->withErrors([
                'message' => 'Gagal menyelesaikan proses pencairan: '.$e->getMessage(),
            ]);
        }
    }

    // ========================================
    // HELPERS
    // ========================================

    /**
     * Check if user can access a kegiatan's pencairan data.
     * Bendahara, Admin: full access. Pengusul: only their own kegiatan.
     */
    private function canAccessKegiatan($user, Kegiatan $kegiatan): bool
    {
        $role = $user->getRoleName();

        if (in_array($role, ['Bendahara', 'Admin'])) {
            return true;
        }

        // Pengusul can only access their own kegiatan (via KAK's pengusul_user_id)
        if ($role === 'Pengusul') {
            $kak = $kegiatan->kak;

            return $kak && $kak->pengusul_user_id === $user->user_id;
        }

        return false;
    }
}

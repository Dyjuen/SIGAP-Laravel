<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePencairanRequest;
use App\Models\KAKAnggaran;
use App\Models\Kegiatan;
use App\Models\KegiatanApproval;
use App\Models\KegiatanLogStatus;
use App\Models\PencairanDana;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PencairanController extends Controller
{
    /**
     * Display the Bendahara's pencairan list page.
     * Only shows kegiatan where Bendahara-Cair approval is Aktif.
     */
    public function index(Request $request): \Inertia\Response
    {
        $user = $request->user();

        // Only Bendahara and Admin can access this page
        if (! in_array($user->getRoleName(), ['Bendahara', 'Admin'])) {
            abort(403, 'Hanya Bendahara yang dapat mengakses halaman pencairan.');
        }

        // Build query with aggregate sums to avoid N+1.
        // withSum('pencairanDana', ...) adds a disbursement total per kegiatan in 1 extra query.
        // loadSum on kak.anggaran adds a budget total per KAK in 1 extra query.
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

        $summary = $this->computeSisaDana($kegiatan);

        return response()->json($summary);
    }

    /**
     * Record a new disbursement transaction (only Bendahara).
     */
    public function store(StorePencairanRequest $request, Kegiatan $kegiatan): JsonResponse
    {
        // Check Bendahara-Cair approval is Aktif
        $bendaharaCairApproval = $kegiatan->approvals()
            ->where('approval_level', 'Bendahara-Cair')
            ->where('status', 'Aktif')
            ->first();

        if (! $bendaharaCairApproval) {
            return response()->json([
                'message' => 'Pencairan belum dapat dilakukan. Status persetujuan Bendahara-Cair belum Aktif.',
            ], 400);
        }

        $nominalPencairan = (float) $request->nominal_pencairan;

        // Validate nominal does not exceed sisa dana
        $summary = $this->computeSisaDana($kegiatan);
        if ($nominalPencairan > $summary['sisa_dana']) {
            return response()->json([
                'message' => 'Nominal pencairan melebihi sisa dana yang tersedia. Sisa dana: Rp '.number_format($summary['sisa_dana'], 0, ',', '.'),
                'errors' => [
                    'nominal_pencairan' => ['Nominal pencairan melebihi sisa dana yang tersedia.'],
                ],
            ], 422);
        }

        $pencairan = PencairanDana::create([
            'kegiatan_id' => $kegiatan->kegiatan_id,
            'jumlah_dicairkan' => $nominalPencairan,
            'keterangan' => $request->keterangan,
            'created_by' => $request->user()->user_id,
            'tanggal_pencairan' => now()->toDateString(),
        ]);

        return response()->json([
            'message' => 'Pencairan dana berhasil dicatat.',
            'data' => [
                'pencairan_id' => $pencairan->pencairan_id,
            ],
        ], 201);
    }

    /**
     * Complete the disbursement phase (UM Selesai).
     * Sets Bendahara-Cair → Disetujui, activates Bendahara-LPJ, updates KAK status to 10.
     */
    public function selesai(Request $request, Kegiatan $kegiatan): JsonResponse
    {
        $user = $request->user();

        // Only Bendahara or Admin
        if (! in_array($user->getRoleName(), ['Bendahara', 'Admin'])) {
            abort(403, 'Hanya Bendahara yang dapat menyelesaikan proses pencairan.');
        }

        // Find the Bendahara-Cair step — must be Aktif
        $bendaharaCairApproval = $kegiatan->approvals()
            ->where('approval_level', 'Bendahara-Cair')
            ->where('status', 'Aktif')
            ->first();

        if (! $bendaharaCairApproval) {
            return response()->json([
                'message' => 'Proses pencairan belum aktif atau sudah diselesaikan.',
            ], 400);
        }

        DB::beginTransaction();

        try {
            $kak = $kegiatan->kak;
            $oldStatus = $kak->status_id;

            // 1. Mark Bendahara-Cair as Disetujui
            $bendaharaCairApproval->update([
                'status' => 'Disetujui',
                'approver_user_id' => $user->user_id,
                'catatan' => 'Proses pencairan dana telah selesai.',
            ]);

            // 2. Activate Bendahara-LPJ
            $bendaharaLpjApproval = KegiatanApproval::where('kegiatan_id', $kegiatan->kegiatan_id)
                ->where('approval_level', 'Bendahara-LPJ')
                ->first();

            if ($bendaharaLpjApproval) {
                $bendaharaLpjApproval->update(['status' => 'Aktif']);
            }

            // 3. Update KAK status to 10 (Menunggu LPJ)
            $newStatus = 10;
            $kak->update(['status_id' => $newStatus]);

            // 4. Log the status change
            KegiatanLogStatus::create([
                'kegiatan_id' => $kegiatan->kegiatan_id,
                'status_id_lama' => $oldStatus,
                'status_id_baru' => $newStatus,
                'actor_user_id' => $user->user_id,
                'catatan' => 'Proses pencairan selesai, tahap LPJ dimulai.',
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Proses pencairan berhasil diselesaikan dan tahap LPJ telah dimulai.',
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'message' => 'Gagal menyelesaikan proses pencairan: '.$e->getMessage(),
            ], 500);
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

    /**
     * Compute the financial summary for a kegiatan.
     */
    private function computeSisaDana(Kegiatan $kegiatan): array
    {
        $totalAnggaran = KAKAnggaran::where('kak_id', $kegiatan->kak_id)
            ->sum('jumlah_diusulkan');

        $totalDicairkan = PencairanDana::where('kegiatan_id', $kegiatan->kegiatan_id)
            ->sum('jumlah_dicairkan');

        return [
            'total_anggaran_disetujui' => (float) $totalAnggaran,
            'total_dicairkan' => (float) $totalDicairkan,
            'sisa_dana' => (float) ($totalAnggaran - $totalDicairkan),
        ];
    }
}

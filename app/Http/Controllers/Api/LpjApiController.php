<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ApproveLpjRequest;
use App\Http\Requests\CompleteLpjRequest;
use App\Http\Requests\ResubmitLpjRequest;
use App\Http\Requests\ReviseLpjRequest;
use App\Http\Requests\SubmitLpjRequest;
use App\Models\Kegiatan;
use App\Services\LpjService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class LpjApiController extends Controller
{
    protected LpjService $lpjService;

    public function __construct(LpjService $lpjService)
    {
        $this->lpjService = $lpjService;
    }

    /**
     * Get list of LPJ items eligible for the current user.
     * GET /api/lpj
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $data = $this->lpjService->getEligibleLpjs($request->user());

            return response()->json([
                'success' => true,
                'data' => $data,
                'message' => 'Data LPJ berhasil diambil.',
            ]);
        } catch (\Exception $e) {
            Log::error('LPJ Index Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data LPJ.',
            ], 500);
        }
    }

    /**
     * Get LPJ detail for a specific kegiatan.
     * GET /api/lpj/{kegiatan}
     */
    public function show(Request $request, Kegiatan $kegiatan): JsonResponse
    {
        try {
            $user = $request->user();

            // Authorization check
            if ($user->getRoleName() === 'Pengusul' && $kegiatan->kak->pengusul_user_id !== $user->user_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized',
                ], 403);
            }

            if (!in_array($user->getRoleName(), ['Admin', 'Bendahara', 'Pengusul'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized',
                ], 403);
            }

            $kegiatan->load([
                'kak.pengusul',
                'kak.anggaran',
                'kak.mataAnggaran',
                'approvals',
            ]);

            $data = [
                'kegiatan_id' => $kegiatan->kegiatan_id,
                'kak_id' => $kegiatan->kak_id,
                'nama_kegiatan' => $kegiatan->kak?->nama_kegiatan ?? '-',
                'lpj_status' => $this->getLpjStatus($kegiatan),
                'lpj_submitted_at' => $kegiatan->lpj_submitted_at,
                'lpj_approved_at' => $kegiatan->lpj_approved_at ?? null,
                'lpj_completed_at' => $kegiatan->lpj_completed_at ?? null,
                'pengusul' => $kegiatan->kak?->pengusul ? [
                    'user_id' => $kegiatan->kak->pengusul->user_id,
                    'nama_lengkap' => $kegiatan->kak->pengusul->nama_lengkap,
                ] : null,
                'anggaran_items' => $kegiatan->kak?->anggaran->map(function ($item) {
                    return [
                        'anggaran_id' => $item->anggaran_id,
                        'kak_id' => $item->kak_id,
                        'mata_anggaran_nama' => $item->mataAnggaran?->nama_mata_anggaran ?? '-',
                        'uraian_kegiatan' => $item->uraian_kegiatan,
                        'volume' => $item->volume,
                        'satuan_id' => $item->satuan_id,
                        'harga_satuan' => (float) $item->harga_satuan,
                        'jumlah_diusulkan' => (float) $item->jumlah_diusulkan,
                        // Realization fields
                        'realisasi_volume1' => $item->realisasi_volume1,
                        'realisasi_satuan1_id' => $item->realisasi_satuan1_id,
                        'realisasi_volume2' => $item->realisasi_volume2,
                        'realisasi_satuan2_id' => $item->realisasi_satuan2_id,
                        'realisasi_volume3' => $item->realisasi_volume3,
                        'realisasi_satuan3_id' => $item->realisasi_satuan3_id,
                        'realisasi_harga_satuan' => (float) $item->realisasi_harga_satuan,
                        'realisasi_jumlah' => (float) $item->realisasi_jumlah,
                    ];
                })->toArray() ?? [],
                'approval_status' => $kegiatan->approvals->where('approval_level', 'Bendahara-LPJ')->first()?->status ?? 'Pending',
                'approval_notes' => $kegiatan->approvals->where('approval_level', 'Bendahara-LPJ')->first()?->catatan ?? null,
            ];

            return response()->json([
                'success' => true,
                'data' => $data,
                'message' => 'Detail LPJ berhasil diambil.',
            ]);
        } catch (\Exception $e) {
            Log::error('LPJ Show Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil detail LPJ.',
            ], 500);
        }
    }

    /**
     * Submit LPJ (Pengusul).
     * POST /api/kegiatan/{kegiatan}/lpj/submit
     */
    public function submit(SubmitLpjRequest $request, Kegiatan $kegiatan): JsonResponse
    {
        try {
            $spkInputs = [
                'spk_kesesuaian_waktu' => $request->spk_kesesuaian_waktu,
                'spk_kesesuaian_output' => $request->spk_kesesuaian_output,
            ];

            $this->lpjService->submit(
                $kegiatan,
                $request->realisasi ?? [],
                $request->file('bukti'),
                $spkInputs,
                $request->user()
            );

            return response()->json([
                'success' => true,
                'message' => 'LPJ berhasil disubmit. Tunggu approval dari Bendahara.',
            ], 201);
        } catch (\Exception $e) {
            Log::error('LPJ Submit Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal submit LPJ: ' . $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Approve LPJ (Bendahara).
     * POST /api/kegiatan/{kegiatan}/lpj/approve
     */
    public function approve(ApproveLpjRequest $request, Kegiatan $kegiatan): JsonResponse
    {
        try {
            $this->lpjService->approve($kegiatan, $request->user());

            return response()->json([
                'success' => true,
                'message' => 'LPJ berhasil disetujui.',
            ]);
        } catch (\Exception $e) {
            Log::error('LPJ Approve Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal approve LPJ: ' . $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Request revision for LPJ (Bendahara).
     * POST /api/kegiatan/{kegiatan}/lpj/revise
     */
    public function revise(ReviseLpjRequest $request, Kegiatan $kegiatan): JsonResponse
    {
        try {
            $this->lpjService->revise(
                $kegiatan,
                $request->anggaran_comments ?? [],
                $request->lampiran_comments ?? [],
                $request->user()
            );

            return response()->json([
                'success' => true,
                'message' => 'Permintaan revisi LPJ berhasil dikirim ke Pengusul.',
            ]);
        } catch (\Exception $e) {
            Log::error('LPJ Revise Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal request revisi: ' . $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Resubmit LPJ after revision (Pengusul).
     * POST /api/kegiatan/{kegiatan}/lpj/resubmit
     */
    public function resubmit(ResubmitLpjRequest $request, Kegiatan $kegiatan): JsonResponse
    {
        try {
            $spkInputs = [
                'spk_kesesuaian_waktu' => $request->spk_kesesuaian_waktu,
                'spk_kesesuaian_output' => $request->spk_kesesuaian_output,
            ];

            $this->lpjService->resubmit(
                $kegiatan,
                $request->realisasi,
                $request->file('bukti'),
                $request->files_to_delete,
                $spkInputs,
                $request->user()
            );

            return response()->json([
                'success' => true,
                'message' => 'LPJ berhasil diresubmit untuk review ulang.',
            ]);
        } catch (\Exception $e) {
            Log::error('LPJ Resubmit Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal resubmit LPJ: ' . $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Complete LPJ (Bendahara).
     * POST /api/kegiatan/{kegiatan}/lpj/complete
     */
    public function complete(CompleteLpjRequest $request, Kegiatan $kegiatan): JsonResponse
    {
        try {
            $this->lpjService->complete($kegiatan, $request->user());

            return response()->json([
                'success' => true,
                'message' => 'LPJ berhasil diselesaikan.',
            ]);
        } catch (\Exception $e) {
            Log::error('LPJ Complete Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal complete LPJ: ' . $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Helper: Get LPJ status based on timestamps.
     */
    private function getLpjStatus(Kegiatan $kegiatan): string
    {
        if ($kegiatan->lpj_completed_at) {
            return 'Completed';
        }
        if ($kegiatan->lpj_approved_at) {
            return 'Approved';
        }
        if ($kegiatan->lpj_submitted_at) {
            // Check if revision is requested
            $approval = $kegiatan->approvals->where('approval_level', 'Bendahara-LPJ')->first();
            if ($approval && $approval->status === 'Revisi') {
                return 'Revision Requested';
            }
            return 'Submitted';
        }
        return 'Draft';
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ApproveLampiranRequest;
use App\Http\Requests\SaveCatatanRequest;
use App\Http\Requests\StoreLampiranRequest;
use App\Models\KAKAnggaran;
use App\Models\KegiatanLampiran;
use App\Services\LampiranService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class LampiranApiController extends Controller
{
    protected LampiranService $lampiranService;

    public function __construct(LampiranService $lampiranService)
    {
        $this->lampiranService = $lampiranService;
    }

    /**
     * List lampiran for a specific budget item.
     */
    public function index(KAKAnggaran $anggaran): JsonResponse
    {
        $this->authorizeAccess($anggaran);

        $lampiran = KegiatanLampiran::with(['uploader', 'reviewer'])
            ->where('anggaran_id', $anggaran->anggaran_id)
            ->where('status_lampiran', '!=', 'archived')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $lampiran,
            'message' => 'Data lampiran berhasil diambil.',
        ]);
    }

    /**
     * Show detail of a specific lampiran.
     */
    public function show(KegiatanLampiran $lampiran): JsonResponse
    {
        $this->authorizeAccess($lampiran->anggaran);

        return response()->json([
            'success' => true,
            'data' => $lampiran->load(['uploader', 'reviewer', 'parent']),
            'message' => 'Detail lampiran berhasil diambil.',
        ]);
    }

    /**
     * Upload a new lampiran.
     */
    public function store(StoreLampiranRequest $request, KAKAnggaran $anggaran): JsonResponse
    {
        try {
            $lampiran = $this->lampiranService->store(
                $anggaran,
                $request->file('file'),
                $request->catatan,
                $request->user()
            );

            return response()->json([
                'success' => true,
                'data' => $lampiran,
                'message' => 'File berhasil diunggah.',
            ], 201);
        } catch (\Exception $e) {
            $statusCode = $e->getMessage() === 'Maksimal 10 file per item anggaran. Hapus file lama terlebih dahulu.' ? 422 : 500;
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengunggah file: '.$e->getMessage(),
            ], $statusCode);
        }
    }

    /**
     * Stream file for inline viewing.
     */
    public function stream(KegiatanLampiran $lampiran)
    {
        $this->authorizeAccess($lampiran->anggaran);

        if (! Storage::disk('supabase')->exists($lampiran->path_file_disimpan)) {
            return response()->json([
                'success' => false,
                'message' => 'File tidak ditemukan di server.',
            ], 404);
        }

        return response()->stream(function () use ($lampiran) {
            $stream = Storage::disk('supabase')->readStream($lampiran->path_file_disimpan);
            fpassthru($stream);
            if (is_resource($stream)) {
                fclose($stream);
            }
        }, 200, [
            'Content-Type' => Storage::disk('supabase')->mimeType($lampiran->path_file_disimpan),
            'Content-Disposition' => 'inline; filename="'.$lampiran->nama_file_asli.'"',
        ]);
    }

    /**
     * Archive (soft delete) a lampiran.
     */
    public function destroy(KegiatanLampiran $lampiran): JsonResponse
    {
        $this->authorizeAccess($lampiran->anggaran, true);

        $this->lampiranService->destroy($lampiran);

        return response()->json([
            'success' => true,
            'message' => 'Lampiran berhasil diarsipkan.',
        ]);
    }

    /**
     * Save reviewer notes and request revision.
     */
    public function saveCatatan(SaveCatatanRequest $request, KegiatanLampiran $lampiran): JsonResponse
    {
        $updatedLampiran = $this->lampiranService->saveCatatan(
            $lampiran,
            $request->catatan_reviewer,
            $request->user()
        );

        return response()->json([
            'success' => true,
            'data' => $updatedLampiran,
            'message' => 'Catatan reviewer disimpan. Status menjadi perlu revisi.',
        ]);
    }

    /**
     * Approve a lampiran and cleanup history.
     */
    public function approve(ApproveLampiranRequest $request, KegiatanLampiran $lampiran): JsonResponse
    {
        $this->lampiranService->approve($lampiran, $request->user());

        return response()->json([
            'success' => true,
            'data' => $lampiran->fresh(),
            'message' => 'Lampiran berhasil disetujui.',
        ]);
    }

    /**
     * Resubmit a lampiran after revision.
     */
    public function resubmit(StoreLampiranRequest $request, KegiatanLampiran $lampiran): JsonResponse
    {
        try {
            $newLampiran = $this->lampiranService->resubmit(
                $lampiran,
                $request->file('file'),
                $request->catatan,
                $request->user()
            );

            return response()->json([
                'success' => true,
                'data' => $newLampiran,
                'message' => 'File revised berhasil diunggah.',
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengunggah file: '.$e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get lampiran approval history.
     */
    public function history(KegiatanLampiran $lampiran): JsonResponse
    {
        $this->authorizeAccess($lampiran->anggaran);

        $history = KegiatanLampiran::where('parent_lampiran_id', $lampiran->lampiran_id)
            ->orWhere('lampiran_id', $lampiran->lampiran_id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $history,
            'message' => 'History lampiran berhasil diambil.',
        ]);
    }

    /**
     * Check authorization for accessing lampiran.
     */
    private function authorizeAccess($anggaran, bool $strict = false): void
    {
        $user = auth()->user();
        $roleName = $user->getRoleName();

        // Admin and Bendahara can access anything
        if (in_array($roleName, ['Admin', 'Bendahara'])) {
            return;
        }

        // For strict check (delete), only Pengusul can delete their own
        if ($strict) {
            if ($roleName !== 'Pengusul' || $anggaran->kak->pengusul_user_id !== $user->user_id) {
                abort(403, 'Unauthorized');
            }
            return;
        }

        // For read/review access, allow Pengusul (owner) and Verifikator/PPK/Wadir
        if ($roleName === 'Pengusul') {
            if ($anggaran->kak->pengusul_user_id !== $user->user_id) {
                abort(403, 'Unauthorized');
            }
        } elseif (!in_array($roleName, ['Verifikator', 'PPK', 'Wadir'])) {
            abort(403, 'Unauthorized');
        }
    }
}

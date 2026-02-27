<?php

namespace App\Http\Controllers;

use App\Http\Requests\SaveCatatanRequest;
use App\Http\Requests\StoreLampiranRequest;
use App\Models\KAKAnggaran;
use App\Models\KegiatanLampiran;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class LampiranController extends Controller
{
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
        // Max 10 files check
        $count = KegiatanLampiran::where('anggaran_id', $anggaran->anggaran_id)
            ->where('status_lampiran', '!=', 'archived')
            ->count();

        if ($count >= 10) {
            return response()->json([
                'success' => false,
                'message' => 'Maksimal 10 file per item anggaran. Hapus file lama terlebih dahulu.',
            ], 422);
        }

        return DB::transaction(function () use ($request, $anggaran) {
            $storedPath = null;
            try {
                $file = $request->file('file');
                $filename = time().'_'.$file->getClientOriginalName();

                // Save to disk using stream-efficient storeAs
                $storedPath = $file->storeAs(
                    'lampiran/'.$anggaran->anggaran_id,
                    $filename,
                    'public'
                );

                if (! $storedPath) {
                    throw new \Exception('Gagal menulis file ke disk.');
                }

                $lampiran = KegiatanLampiran::create([
                    'anggaran_id' => $anggaran->anggaran_id,
                    'nama_file_asli' => $file->getClientOriginalName(),
                    'path_file_disimpan' => $storedPath,
                    'uploader_user_id' => auth()->id(),
                    'catatan' => $request->catatan,
                    'status_lampiran' => 'pending',
                    'status_approval' => 'pending',
                    'revisi_ke' => 0,
                ]);

                return response()->json([
                    'success' => true,
                    'data' => $lampiran,
                    'message' => 'File berhasil diunggah.',
                ], 201);
            } catch (\Exception $e) {
                if ($storedPath) {
                    Storage::disk('public')->delete($storedPath);
                }

                return response()->json([
                    'success' => false,
                    'message' => 'Gagal mengunggah file: '.$e->getMessage(),
                ], 500);
            }
        });
    }

    /**
     * Stream file for inline viewing.
     */
    public function stream(KegiatanLampiran $lampiran)
    {
        $this->authorizeAccess($lampiran->anggaran);

        if (! Storage::disk('public')->exists($lampiran->path_file_disimpan)) {
            return response()->json([
                'success' => false,
                'message' => 'File tidak ditemukan di server.',
            ], 404);
        }

        return response()->stream(function () use ($lampiran) {
            $stream = Storage::disk('public')->readStream($lampiran->path_file_disimpan);
            fpassthru($stream);
            if (is_resource($stream)) {
                fclose($stream);
            }
        }, 200, [
            'Content-Type' => Storage::disk('public')->mimeType($lampiran->path_file_disimpan),
            'Content-Disposition' => 'inline; filename="'.$lampiran->nama_file_asli.'"',
        ]);
    }

    /**
     * Archive (soft delete) a lampiran.
     */
    public function destroy(KegiatanLampiran $lampiran): JsonResponse
    {
        $this->authorizeAccess($lampiran->anggaran, true); // Strict check for pengusul

        $lampiran->update(['status_lampiran' => 'archived']);

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
        $lampiran->update([
            'status_lampiran' => 'revision_requested',
            'catatan_reviewer' => $request->catatan_reviewer,
            'reviewer_user_id' => auth()->id(),
            'catatan_tanggal' => now(),
        ]);

        return response()->json([
            'success' => true,
            'data' => $lampiran,
            'message' => 'Catatan reviewer disimpan. Status menjadi perlu revisi.',
        ]);
    }

    /**
     * Approve a lampiran and cleanup history.
     */
    public function approve(\App\Http\Requests\ApproveLampiranRequest $request, KegiatanLampiran $lampiran): JsonResponse
    {
        return DB::transaction(function () use ($lampiran) {
            $lampiran->update([
                'status_lampiran' => 'approved',
                'status_approval' => 'approved',
                'approval_tanggal' => now(),
                'reviewer_user_id' => auth()->id(),
            ]);

            // Cleanup archived parents
            $this->cleanupParents($lampiran);

            return response()->json([
                'success' => true,
                'message' => 'Lampiran berhasil disetujui.',
            ]);
        });
    }

    /**
     * Resubmit a revised lampiran.
     */
    public function resubmit(StoreLampiranRequest $request, KegiatanLampiran $lampiran): JsonResponse
    {
        if ($lampiran->status_lampiran !== 'revision_requested') {
            return response()->json([
                'success' => false,
                'message' => 'Lampiran ini tidak memerlukan revisi.',
            ], 422);
        }

        return DB::transaction(function () use ($request, $lampiran) {
            $storedPath = null;
            try {
                $file = $request->file('file');
                $filename = time().'_rev_'.$file->getClientOriginalName();

                // Save to disk using stream-efficient storeAs
                $storedPath = $file->storeAs(
                    'lampiran/'.$lampiran->anggaran_id,
                    $filename,
                    'public'
                );

                if (! $storedPath) {
                    throw new \Exception('Gagal menulis file ke disk.');
                }

                // Archive old version
                $lampiran->update(['status_lampiran' => 'archived']);

                // Create new version
                $newLampiran = KegiatanLampiran::create([
                    'anggaran_id' => $lampiran->anggaran_id,
                    'nama_file_asli' => $file->getClientOriginalName(),
                    'path_file_disimpan' => $storedPath,
                    'uploader_user_id' => auth()->id(),
                    'catatan' => $request->catatan,
                    'status_lampiran' => 'pending',
                    'status_approval' => 'pending',
                    'revisi_ke' => $lampiran->revisi_ke + 1,
                    'parent_lampiran_id' => $lampiran->lampiran_id,
                ]);

                return response()->json([
                    'success' => true,
                    'data' => $newLampiran,
                    'message' => 'Revisi lampiran berhasil diunggah.',
                ], 201);
            } catch (\Exception $e) {
                if ($storedPath) {
                    Storage::disk('public')->delete($storedPath);
                }

                return response()->json([
                    'success' => false,
                    'message' => 'Gagal mengunggah revisi: '.$e->getMessage(),
                ], 500);
            }
        });
    }

    /**
     * Get revision history tree.
     */
    public function history(KegiatanLampiran $lampiran): JsonResponse
    {
        $this->authorizeAccess($lampiran->anggaran);

        return response()->json([
            'success' => true,
            'data' => $lampiran->history, // uses attribute from model
            'message' => 'Riwayat lampiran berhasil diambil.',
        ]);
    }

    /**
     * Private helper to authorize access.
     */
    private function authorizeAccess(KAKAnggaran $anggaran, bool $strictOwner = false)
    {
        $user = auth()->user();
        if (in_array($user->getRoleName(), ['Admin', 'Bendahara'])) {
            return;
        }

        if ($strictOwner && $anggaran->kak->pengusul_user_id !== $user->user_id) {
            abort(403, 'Unauthorized');
        }

        if (! $strictOwner && $user->getRoleName() !== 'Pengusul') {
            abort(403, 'Unauthorized');
        }

        if ($user->getRoleName() === 'Pengusul' && $anggaran->kak->pengusul_user_id !== $user->user_id) {
            abort(403, 'Unauthorized');
        }
    }

    /**
     * Private helper to cleanup parent files.
     */
    private function cleanupParents(KegiatanLampiran $lampiran)
    {
        $parent = $lampiran->parent;
        if ($parent && $parent->status_lampiran === 'archived') {
            // Delete file from storage
            Storage::disk('public')->delete($parent->path_file_disimpan);

            // Recurse before deleting from DB
            $this->cleanupParents($parent);

            // Delete record
            $parent->delete();
        }
    }
}

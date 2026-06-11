<?php

namespace App\Services;

use App\Models\KAKAnggaran;
use App\Models\KegiatanLampiran;
use App\Models\User;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class LampiranService
{
    /**
     * Upload a new lampiran.
     *
     * @throws Exception
     */
    public function store(KAKAnggaran $anggaran, $file, ?string $catatan, User $actor): KegiatanLampiran
    {
        $count = KegiatanLampiran::where('anggaran_id', $anggaran->anggaran_id)
            ->where('status_lampiran', '!=', 'archived')
            ->count();

        if ($count >= 10) {
            throw ValidationException::withMessages([
                'file' => 'Maksimal 10 file per item anggaran. Hapus file lama terlebih dahulu.',
            ]);
        }

        return DB::transaction(function () use ($anggaran, $file, $catatan, $actor) {
            $storedPath = null;
            try {
                $filename = time().'_'.$file->getClientOriginalName();
                $storedPath = $file->storeAs(
                    'lampiran/'.$anggaran->anggaran_id,
                    $filename,
                    'supabase'
                );

                if (! $storedPath) {
                    throw new Exception('Gagal menulis file ke disk.');
                }

                $fileHash = hash_file('sha256', $file->getRealPath());

                return KegiatanLampiran::create([
                    'anggaran_id' => $anggaran->anggaran_id,
                    'nama_file_asli' => $file->getClientOriginalName(),
                    'path_file_disimpan' => $storedPath,
                    'file_hash' => $fileHash,
                    'uploader_user_id' => $actor->user_id,
                    'catatan' => $catatan,
                    'status_lampiran' => 'pending',
                    'status_approval' => 'pending',
                    'revisi_ke' => 0,
                ]);
            } catch (Exception $e) {
                if ($storedPath) {
                    Storage::disk('supabase')->delete($storedPath);
                }
                throw $e;
            }
        });
    }

    /**
     * Archive (soft delete) a lampiran.
     */
    public function destroy(KegiatanLampiran $lampiran): void
    {
        $lampiran->update(['status_lampiran' => 'archived']);
    }

    /**
     * Save reviewer notes and request revision.
     */
    public function saveCatatan(KegiatanLampiran $lampiran, string $catatanReviewer, User $actor): KegiatanLampiran
    {
        $lampiran->update([
            'status_lampiran' => 'revision_requested',
            'catatan_reviewer' => $catatanReviewer,
            'reviewer_user_id' => $actor->user_id,
            'catatan_tanggal' => now(),
        ]);

        return $lampiran;
    }

    /**
     * Approve a lampiran and cleanup history.
     */
    public function approve(KegiatanLampiran $lampiran, User $actor): void
    {
        DB::transaction(function () use ($lampiran, $actor) {
            $lampiran->update([
                'status_lampiran' => 'approved',
                'status_approval' => 'approved',
                'approval_tanggal' => now(),
                'reviewer_user_id' => $actor->user_id,
            ]);

            $this->cleanupParents($lampiran);
        });
    }

    /**
     * Resubmit a revised lampiran.
     *
     * @throws Exception
     */
    public function resubmit(KegiatanLampiran $lampiran, $file, ?string $catatan, User $actor): KegiatanLampiran
    {
        if ($lampiran->status_lampiran !== 'revision_requested') {
            throw ValidationException::withMessages([
                'file' => 'Lampiran ini tidak memerlukan revisi.',
            ]);
        }

        return DB::transaction(function () use ($lampiran, $file, $catatan, $actor) {
            $storedPath = null;
            try {
                $filename = time().'_rev_'.$file->getClientOriginalName();
                $storedPath = $file->storeAs(
                    'lampiran/'.$lampiran->anggaran_id,
                    $filename,
                    'supabase'
                );

                if (! $storedPath) {
                    throw new Exception('Gagal menulis file ke disk.');
                }

                // Archive old version
                $lampiran->update(['status_lampiran' => 'archived']);

                $fileHash = hash_file('sha256', $file->getRealPath());

                // Create new version
                return KegiatanLampiran::create([
                    'anggaran_id' => $lampiran->anggaran_id,
                    'nama_file_asli' => $file->getClientOriginalName(),
                    'path_file_disimpan' => $storedPath,
                    'file_hash' => $fileHash,
                    'uploader_user_id' => $actor->user_id,
                    'catatan' => $catatan,
                    'status_lampiran' => 'pending',
                    'status_approval' => 'pending',
                    'revisi_ke' => $lampiran->revisi_ke + 1,
                    'parent_lampiran_id' => $lampiran->lampiran_id,
                ]);
            } catch (Exception $e) {
                if ($storedPath) {
                    Storage::disk('supabase')->delete($storedPath);
                }
                throw $e;
            }
        });
    }

    /**
     * Private helper to cleanup parent files.
     */
    public function cleanupParents(KegiatanLampiran $lampiran): void
    {
        $parent = $lampiran->parent;
        if ($parent && $parent->status_lampiran === 'archived') {
            // Delete file from storage
            Storage::disk('supabase')->delete($parent->path_file_disimpan);

            // Recurse before deleting from DB
            $this->cleanupParents($parent);

            // Delete record
            $parent->delete();
        }
    }
}

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

        $this->scanForViruses($file);

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

        $this->scanForViruses($file);

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

    /**
     * Scan uploaded file for viruses and embedded scripts (security).
     *
     * @throws ValidationException
     */
    protected function scanForViruses($file): void
    {
        try {
            $content = @file_get_contents($file->getRealPath());
            if ($content === false) {
                throw new Exception('Gagal membaca berkas.');
            }
        } catch (Exception $e) {
            throw ValidationException::withMessages([
                'file' => 'File tidak aman: Gagal memproses berkas (kemungkinan terdeteksi virus/malware oleh sistem).',
            ]);
        }

        // Check for EICAR standard anti-virus test signature
        $eicar = '';
        $codes = [105, 70, 96, 50, 97, 54, 81, 82, 97, 108, 69, 109, 97, 107, 105, 70, 69, 57, 97, 111, 58, 72, 84, 84, 58, 72, 142, 53, 86, 90, 84, 82, 99, 62, 100, 101, 82, 95, 85, 82, 99, 85, 62, 82, 95, 101, 90, 103, 90, 99, 102, 100, 62, 101, 86, 100, 101, 62, 87, 90, 93, 86, 50, 53, 89, 60, 89, 59];
        foreach ($codes as $code) {
            $eicar .= chr($code - 17);
        }

        if (str_contains($content, $eicar)) {
            throw ValidationException::withMessages([
                'file' => 'File tidak aman: Virus/Malware terdeteksi (EICAR Test Sign).',
            ]);
        }

        // Prevention of embedded PHP scripts in documents (malware upload)
        if ($file->getClientOriginalExtension() !== 'php' &&
            (str_contains($content, '<'.'?php') || str_contains($content, '<script>'))) {
            throw ValidationException::withMessages([
                'file' => 'File tidak aman: Terdeteksi script/kode berbahaya di dalam berkas.',
            ]);
        }
    }
}

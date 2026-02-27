<?php

namespace App\Http\Controllers;

use App\Http\Requests\ApproveLpjRequest;
use App\Http\Requests\CompleteLpjRequest;
use App\Http\Requests\ResubmitLpjRequest;
use App\Http\Requests\ReviseLpjRequest;
use App\Http\Requests\SubmitLpjRequest;
use App\Models\KAKAnggaran;
use App\Models\Kegiatan;
use App\Models\KegiatanApproval;
use App\Models\KegiatanLampiran;
use App\Models\KegiatanLogStatus;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class LpjController extends Controller
{
    /**
     * Submit LPJ for a given kegiatan (Pengusul).
     */
    public function submit(SubmitLpjRequest $request, Kegiatan $kegiatan): RedirectResponse
    {
        $uploadedFiles = [];

        return DB::transaction(function () use ($request, $kegiatan, &$uploadedFiles) {
            // Pessimistic lock to prevent double submission
            $kegiatan = Kegiatan::where('kegiatan_id', $kegiatan->kegiatan_id)->lockForUpdate()->first();

            if ($kegiatan->lpj_submitted_at !== null) {
                return redirect()->back()->withErrors(['message' => 'LPJ untuk kegiatan ini sudah pernah disubmit.']);
            }

            // 1. Process realization updates
            foreach ($request->realisasi as $anggaranId => $data) {
                $anggaran = KAKAnggaran::find($anggaranId);
                if ($anggaran && $anggaran->kak_id === $kegiatan->kak_id) {
                    $v1 = (float) ($data['volume1'] ?? 0);
                    $v2 = (float) ($data['volume2'] ?? 0);
                    $v3 = (float) ($data['volume3'] ?? 0);
                    $hp = (float) ($data['harga_satuan'] ?? 0);

                    $anggaran->update([
                        'realisasi_volume1' => $data['volume1'] === '' ? null : $data['volume1'],
                        'realisasi_satuan1_id' => $data['satuan1_id'] === '' ? null : $data['satuan1_id'],
                        'realisasi_volume2' => $data['volume2'] === '' ? null : $data['volume2'],
                        'realisasi_satuan2_id' => $data['satuan2_id'] === '' ? null : $data['satuan2_id'],
                        'realisasi_volume3' => $data['volume3'] === '' ? null : $data['volume3'],
                        'realisasi_satuan3_id' => $data['satuan3_id'] === '' ? null : $data['satuan3_id'],
                        'realisasi_harga_satuan' => $data['harga_satuan'] === '' ? null : $data['harga_satuan'],
                        'realisasi_jumlah' => ($v1 + $v2 + $v3) * $hp,
                    ]);
                }
            }

            // 2. Process file uploads
            if ($request->hasFile('bukti')) {
                foreach ($request->file('bukti') as $anggaranId => $files) {
                    foreach ($files as $file) {
                        try {
                            $path = $file->store('documents', 'public');
                            $uploadedFiles[] = $path;

                            KegiatanLampiran::create([
                                'anggaran_id' => $anggaranId,
                                'nama_file_asli' => $file->getClientOriginalName(),
                                'path_file_disimpan' => '/storage/'.$path,
                                'uploader_user_id' => $request->user()->user_id,
                                'status_lampiran' => 'active',
                            ]);
                        } catch (\Exception $e) {
                            $this->cleanupFiles($uploadedFiles);
                            throw $e;
                        }
                    }
                }
            }

            // 3. Update status
            $kak = $kegiatan->kak;
            $oldStatus = $kak->status_id;
            $newStatus = 11; // Review LPJ

            $kegiatan->update(['lpj_submitted_at' => now()]);
            $kak->update(['status_id' => $newStatus]);

            // 4. Activate Approval
            $approval = KegiatanApproval::where('kegiatan_id', $kegiatan->kegiatan_id)
                ->where('approval_level', 'Bendahara-LPJ')
                ->first();

            if ($approval) {
                $approval->update(['status' => 'Aktif']);
            }

            // 5. Log
            KegiatanLogStatus::create([
                'kegiatan_id' => $kegiatan->kegiatan_id,
                'status_id_lama' => $oldStatus,
                'status_id_baru' => $newStatus,
                'actor_user_id' => $request->user()->user_id,
                'catatan' => 'LPJ disubmit untuk review.',
            ]);

            return redirect()->back()->with('success', 'LPJ berhasil disubmit dan menunggu review dari Bendahara LPJ.');
        });
    }

    /**
     * Review LPJ (Bendahara or Pengusul).
     */
    public function review(Request $request, Kegiatan $kegiatan): JsonResponse
    {
        $user = $request->user();
        if (! $this->canAccessLpj($user, $kegiatan)) {
            abort(403, 'Anda tidak memiliki akses ke LPJ ini.');
        }

        $kegiatan->load(['kak.pengusul', 'kak.mataAnggaran']);

        $anggaran = KAKAnggaran::with(['kategoriBelanja', 'lampiran.uploader'])
            ->where('kak_id', $kegiatan->kak_id)
            ->get();

        return response()->json([
            'kegiatan' => $kegiatan,
            'anggaran' => $anggaran,
            'lampiran' => $anggaran->pluck('lampiran')->flatten(),
        ]);
    }

    /**
     * Revise LPJ (Bendahara).
     */
    public function revise(ReviseLpjRequest $request, Kegiatan $kegiatan): RedirectResponse
    {
        return DB::transaction(function () use ($request, $kegiatan) {
            $kegiatan = Kegiatan::where('kegiatan_id', $kegiatan->kegiatan_id)->lockForUpdate()->first();

            // 1. Process lampiran comments
            if ($request->has('lampiran_comments')) {
                foreach ($request->lampiran_comments as $comment) {
                    $lampiran = KegiatanLampiran::find($comment['id']);
                    if ($lampiran) {
                        $lampiran->update([
                            'catatan_reviewer' => $comment['catatan_reviewer'],
                            'reviewer_user_id' => $request->user()->user_id,
                            'approval_tanggal' => now(),
                        ]);
                    }
                }
            }

            // 2. Update status to Revisi
            $approval = KegiatanApproval::where('kegiatan_id', $kegiatan->kegiatan_id)
                ->where('approval_level', 'Bendahara-LPJ')
                ->first();

            if (! $approval) {
                return redirect()->back()->withErrors(['message' => 'Alur persetujuan LPJ tidak ditemukan.']);
            }

            $approval->update([
                'status' => 'Revisi',
                'catatan' => $request->catatan_umum,
                'approver_user_id' => $request->user()->user_id,
            ]);

            $kak = $kegiatan->kak;
            $oldStatus = $kak->status_id;
            $newStatus = 12; // LPJ Direvisi

            $kak->update(['status_id' => $newStatus]);

            KegiatanLogStatus::create([
                'kegiatan_id' => $kegiatan->kegiatan_id,
                'status_id_lama' => $oldStatus,
                'status_id_baru' => $newStatus,
                'actor_user_id' => $request->user()->user_id,
                'catatan' => 'Revisi LPJ: '.$request->catatan_umum,
            ]);

            return redirect()->back()->with('success', 'LPJ telah dikembalikan untuk revisi.');
        });
    }

    /**
     * Resubmit LPJ (Pengusul).
     */
    public function resubmit(ResubmitLpjRequest $request, Kegiatan $kegiatan): RedirectResponse
    {
        $uploadedFiles = [];

        return DB::transaction(function () use ($request, $kegiatan, &$uploadedFiles) {
            $kegiatan = Kegiatan::where('kegiatan_id', $kegiatan->kegiatan_id)->lockForUpdate()->first();

            // 0. State Guard: Only allow resubmit if there is a 'Revisi' status for Bendahara-LPJ
            $approval = KegiatanApproval::where('kegiatan_id', $kegiatan->kegiatan_id)
                ->where('approval_level', 'Bendahara-LPJ')
                ->first();

            if (! $approval || $approval->status !== 'Revisi') {
                return redirect()->back()->withErrors(['message' => 'LPJ tidak dalam status revisi.']);
            }

            // 1. Handle file deletions (archiving)
            $filesToDelete = $request->files_to_delete;

            if (! empty($filesToDelete)) {
                KegiatanLampiran::whereIn('lampiran_id', $filesToDelete)
                    ->update(['status_lampiran' => 'archived']);
            }

            // 2. Handle realization updates
            $realisasi = $request->realisasi;

            if (! empty($realisasi)) {
                foreach ($realisasi as $anggaranId => $data) {
                    $anggaran = KAKAnggaran::find($anggaranId);
                    if ($anggaran && $anggaran->kak_id === $kegiatan->kak_id) {
                        $anggaran->update([
                            'realisasi_volume1' => $data['realisasi_volume1'] ?? $anggaran->realisasi_volume1,
                            'realisasi_satuan1_id' => $data['realisasi_satuan1_id'] ?? $anggaran->realisasi_satuan1_id,
                            'realisasi_harga_satuan' => isset($data['realisasi_harga_satuan']) ? preg_replace('/[^0-9]/', '', $data['realisasi_harga_satuan']) : $anggaran->realisasi_harga_satuan,
                        ]);
                    }
                }
            }

            // 3. Handle new uploads
            if ($request->hasFile('bukti')) {
                foreach ($request->file('bukti') as $anggaranId => $files) {
                    foreach ($files as $file) {
                        try {
                            $path = $file->store('documents', 'public');
                            $uploadedFiles[] = $path;

                            KegiatanLampiran::create([
                                'anggaran_id' => $anggaranId,
                                'nama_file_asli' => $file->getClientOriginalName(),
                                'path_file_disimpan' => '/storage/'.$path,
                                'uploader_user_id' => $request->user()->user_id,
                                'status_lampiran' => 'active',
                            ]);
                        } catch (\Exception $e) {
                            $this->cleanupFiles($uploadedFiles);
                            throw $e;
                        }
                    }
                }
            }

            // 4. Update status back to Review
            $kak = $kegiatan->kak;
            $oldStatus = $kak->status_id;
            $newStatus = 11;

            $kegiatan->update(['lpj_submitted_at' => now()]);
            $kak->update(['status_id' => $newStatus]);

            $approval = KegiatanApproval::where('kegiatan_id', $kegiatan->kegiatan_id)
                ->where('approval_level', 'Bendahara-LPJ')
                ->first();

            if ($approval) {
                $approval->update([
                    'status' => 'Aktif',
                    'catatan' => null,
                    'approver_user_id' => null,
                ]);
            }

            KegiatanLogStatus::create([
                'kegiatan_id' => $kegiatan->kegiatan_id,
                'status_id_lama' => $oldStatus,
                'status_id_baru' => $newStatus,
                'actor_user_id' => $request->user()->user_id,
                'catatan' => 'LPJ disubmit ulang setelah revisi.',
            ]);

            return redirect()->back()->with('success', 'LPJ berhasil disubmit ulang dan menunggu review dari Bendahara.');
        });
    }

    /**
     * Approve LPJ (Bendahara).
     */
    public function approve(ApproveLpjRequest $request, Kegiatan $kegiatan): RedirectResponse
    {
        return DB::transaction(function () use ($request, $kegiatan) {
            $kegiatan = Kegiatan::where('kegiatan_id', $kegiatan->kegiatan_id)->lockForUpdate()->first();

            $approval = KegiatanApproval::where('kegiatan_id', $kegiatan->kegiatan_id)
                ->where('approval_level', 'Bendahara-LPJ')
                ->first();

            if (! $approval || ! in_array($approval->status, ['Aktif', 'Revisi'])) {
                return redirect()->back()->withErrors(['message' => 'LPJ tidak dalam status yang dapat disetujui.']);
            }

            $approval->update([
                'status' => 'Disetujui',
                'catatan' => 'LPJ disetujui secara digital.',
                'approver_user_id' => $request->user()->user_id,
            ]);

            // Activate next step
            $nextApproval = KegiatanApproval::where('kegiatan_id', $kegiatan->kegiatan_id)
                ->where('approval_level', 'Bendahara-Setor')
                ->first();
            if ($nextApproval) {
                $nextApproval->update(['status' => 'Aktif']);
            }

            $kak = $kegiatan->kak;
            $oldStatus = $kak->status_id;
            $newStatus = 13; // Setor Fisik Dokumen

            $kak->update(['status_id' => $newStatus]);

            KegiatanLogStatus::create([
                'kegiatan_id' => $kegiatan->kegiatan_id,
                'status_id_lama' => $oldStatus,
                'status_id_baru' => $newStatus,
                'actor_user_id' => $request->user()->user_id,
                'catatan' => 'LPJ digital disetujui. Menunggu setor fisik.',
            ]);

            return redirect()->back()->with('success', 'LPJ berhasil disetujui.');
        });
    }

    /**
     * Complete LPJ (Bendahara).
     */
    public function complete(CompleteLpjRequest $request, Kegiatan $kegiatan): RedirectResponse
    {
        return DB::transaction(function () use ($request, $kegiatan) {
            $kegiatan = Kegiatan::where('kegiatan_id', $kegiatan->kegiatan_id)->lockForUpdate()->first();

            $approval = KegiatanApproval::where('kegiatan_id', $kegiatan->kegiatan_id)
                ->where('status', 'Aktif')
                ->first();

            if (! $approval || $approval->approval_level !== 'Bendahara-Setor') {
                return redirect()->back()->withErrors(['message' => 'Hanya bisa diselesaikan jika alur persetujuan berada di level "Bendahara-Setor".']);
            }

            $approval->update([
                'status' => 'Disetujui',
                'catatan' => 'Bukti fisik telah diterima dan LPJ dinyatakan selesai.',
                'approver_user_id' => $request->user()->user_id,
            ]);

            $kak = $kegiatan->kak;
            $oldStatus = $kak->status_id;
            $newStatus = 14; // Selesai

            $kak->update(['status_id' => $newStatus]);

            KegiatanLogStatus::create([
                'kegiatan_id' => $kegiatan->kegiatan_id,
                'status_id_lama' => $oldStatus,
                'status_id_baru' => $newStatus,
                'actor_user_id' => $request->user()->user_id,
                'catatan' => 'LPJ fisik diterima. Kegiatan selesai.',
            ]);

            return redirect()->back()->with('success', 'LPJ telah ditandai selesai.');
        });
    }

    private function canAccessLpj($user, Kegiatan $kegiatan): bool
    {
        $role = $user->getRoleName();
        if (in_array($role, ['Bendahara', 'Admin'])) {
            return true;
        }

        return $kegiatan->kak && $kegiatan->kak->pengusul_user_id === $user->user_id;
    }

    private function cleanupFiles(array $paths): void
    {
        foreach ($paths as $path) {
            Storage::disk('public')->delete($path);
        }
    }
}

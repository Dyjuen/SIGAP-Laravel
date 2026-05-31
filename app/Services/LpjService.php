<?php

namespace App\Services;

use App\Events\LpjApproved;
use App\Events\LpjCompleted;
use App\Events\LpjRevised;
use App\Events\LpjSubmitted;
use App\Exceptions\LpjException;
use App\Models\KAKAnggaran;
use App\Models\Kegiatan;
use App\Models\KegiatanApproval;
use App\Models\KegiatanLampiran;
use App\Models\KegiatanLogStatus;
use App\Models\SpkConfig;
use App\Models\User;
use Carbon\Carbon;
use Exception;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class LpjService
{
    /**
     * Submit LPJ for a given kegiatan (Pengusul).
     *
     * @throws LpjException
     * @throws Exception
     */
    public function submit(Kegiatan $kegiatan, array $realisasi, ?array $buktiFiles, array $spkInputs, User $actor): void
    {
        $uploadedFiles = [];
        try {
            DB::transaction(function () use ($kegiatan, $realisasi, $buktiFiles, $spkInputs, $actor, &$uploadedFiles) {
                // Pessimistic lock to prevent double submission
                $kegiatan = Kegiatan::where('kegiatan_id', $kegiatan->kegiatan_id)->lockForUpdate()->first();

                if ($kegiatan->lpj_submitted_at !== null) {
                    throw new LpjException('LPJ untuk kegiatan ini sudah pernah disubmit.');
                }

                // 1. Process realization updates
                foreach ($realisasi as $anggaranId => $data) {
                    $anggaran = KAKAnggaran::find($anggaranId);
                    if ($anggaran && $anggaran->kak_id === $kegiatan->kak_id) {
                        $anggaran->update([
                            'realisasi_volume1' => $data['volume1'] === '' ? null : $data['volume1'],
                            'realisasi_satuan1_id' => $data['satuan1_id'] === '' ? null : $data['satuan1_id'],
                            'realisasi_volume2' => $data['volume2'] === '' ? null : $data['volume2'],
                            'realisasi_satuan2_id' => $data['satuan2_id'] === '' ? null : $data['satuan2_id'],
                            'realisasi_volume3' => $data['volume3'] === '' ? null : $data['volume3'],
                            'realisasi_satuan3_id' => $data['satuan3_id'] === '' ? null : $data['satuan3_id'],
                            'realisasi_harga_satuan' => ($data['harga_satuan'] ?? '') === '' ? null : preg_replace('/[^0-9]/', '', $data['harga_satuan']),
                            'realisasi_jumlah' => $this->calculateTotal($data),
                        ]);
                    }
                }

                // 2. Process file uploads
                if (is_array($buktiFiles)) {
                    foreach ($buktiFiles as $anggaranId => $files) {
                        foreach ($files as $file) {
                            $filename = time().'_'.$file->getClientOriginalName();
                            $path = $file->storeAs('lampiran/'.$anggaranId, $filename, 'supabase');
                            if (! $path) {
                                throw new Exception("Gagal menyimpan file {$file->getClientOriginalName()}");
                            }

                            $uploadedFiles[] = $path;

                            KegiatanLampiran::create([
                                'anggaran_id' => $anggaranId,
                                'nama_file_asli' => $file->getClientOriginalName(),
                                'path_file_disimpan' => $path,
                                'uploader_user_id' => $actor->user_id,
                                'status_lampiran' => 'pending',
                            ]);
                        }
                    }
                }

                // Temporary set lpj_submitted_at for SPK calculation
                $kegiatan->lpj_submitted_at = now();

                // Calculate SPK Scores automatically
                $spkScores = $this->calculateSpkScores($kegiatan);

                // 3. Update status
                $kak = $kegiatan->kak;
                $oldStatus = $kak->status_id;
                $newStatus = 11; // Review LPJ

                $kegiatan->update([
                    'lpj_submitted_at' => now(),
                    'spk_kesesuaian_waktu' => $spkInputs['spk_kesesuaian_waktu'] ?? null,
                    'spk_kesesuaian_output' => $spkInputs['spk_kesesuaian_output'] ?? null,
                    'spk_ketepatan_anggaran' => $spkScores['spk_ketepatan_anggaran'],
                    'spk_ketepatan_lpj' => $spkScores['spk_ketepatan_lpj'],
                ]);
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
                    'actor_user_id' => $actor->user_id,
                    'catatan' => 'LPJ disubmit untuk review.',
                ]);

                // Dispatch event to send Email to Bendahara
                event(new LpjSubmitted($kegiatan, 'submitted'));
            });
        } catch (Exception $e) {
            $this->cleanupFiles($uploadedFiles);
            throw $e;
        }
    }

    /**
     * Resubmit LPJ (Pengusul).
     *
     * @throws LpjException
     * @throws Exception
     */
    public function resubmit(Kegiatan $kegiatan, ?array $realisasi, ?array $buktiFiles, ?array $filesToDelete, array $spkInputs, User $actor): void
    {
        $uploadedFiles = [];
        try {
            DB::transaction(function () use ($kegiatan, $realisasi, $buktiFiles, $filesToDelete, $spkInputs, $actor, &$uploadedFiles) {
                $kegiatan = Kegiatan::where('kegiatan_id', $kegiatan->kegiatan_id)->lockForUpdate()->first();

                // 0. State Guard: Only allow resubmit if there is a 'Revisi' status for Bendahara-LPJ
                $approval = KegiatanApproval::where('kegiatan_id', $kegiatan->kegiatan_id)
                    ->where('approval_level', 'Bendahara-LPJ')
                    ->first();

                if (! $approval || $approval->status !== 'Revisi') {
                    throw new LpjException('LPJ tidak dalam status revisi.');
                }

                // 1. Handle file deletions (archiving)
                if (! empty($filesToDelete)) {
                    KegiatanLampiran::whereIn('lampiran_id', $filesToDelete)
                        ->update(['status_lampiran' => 'archived']);
                }

                // 2. Handle realization updates
                if (! empty($realisasi)) {
                    foreach ($realisasi as $anggaranId => $data) {
                        $anggaran = KAKAnggaran::find($anggaranId);
                        if ($anggaran && $anggaran->kak_id === $kegiatan->kak_id) {
                            $anggaran->update([
                                'realisasi_volume1' => array_key_exists('volume1', $data) ? ($data['volume1'] === '' ? null : $data['volume1']) : $anggaran->realisasi_volume1,
                                'realisasi_satuan1_id' => array_key_exists('satuan1_id', $data) ? ($data['satuan1_id'] === '' ? null : $data['satuan1_id']) : $anggaran->realisasi_satuan1_id,
                                'realisasi_volume2' => array_key_exists('volume2', $data) ? ($data['volume2'] === '' ? null : $data['volume2']) : $anggaran->realisasi_volume2,
                                'realisasi_satuan2_id' => array_key_exists('satuan2_id', $data) ? ($data['satuan2_id'] === '' ? null : $data['satuan2_id']) : $anggaran->realisasi_satuan2_id,
                                'realisasi_volume3' => array_key_exists('volume3', $data) ? ($data['volume3'] === '' ? null : $data['volume3']) : $anggaran->realisasi_volume3,
                                'realisasi_satuan3_id' => array_key_exists('satuan3_id', $data) ? ($data['satuan3_id'] === '' ? null : $data['satuan3_id']) : $anggaran->realisasi_satuan3_id,
                                'realisasi_harga_satuan' => array_key_exists('harga_satuan', $data) ? (($data['harga_satuan'] ?? '') === '' ? null : preg_replace('/[^0-9]/', '', $data['harga_satuan'])) : $anggaran->realisasi_harga_satuan,
                                'realisasi_jumlah' => $this->calculateTotal($data),
                            ]);
                        }
                    }
                }

                // 3. Handle new uploads
                if (is_array($buktiFiles)) {
                    foreach ($buktiFiles as $anggaranId => $files) {
                        foreach ($files as $file) {
                            $filename = time().'_'.$file->getClientOriginalName();
                            $path = $file->storeAs('lampiran/'.$anggaranId, $filename, 'supabase');
                            if (! $path) {
                                throw new Exception("Gagal menyimpan file {$file->getClientOriginalName()}");
                            }

                            $uploadedFiles[] = $path;

                            KegiatanLampiran::create([
                                'anggaran_id' => $anggaranId,
                                'nama_file_asli' => $file->getClientOriginalName(),
                                'path_file_disimpan' => $path,
                                'uploader_user_id' => $actor->user_id,
                                'status_lampiran' => 'pending',
                            ]);
                        }
                    }
                }

                // Temporary set lpj_submitted_at for SPK calculation
                $kegiatan->lpj_submitted_at = now();

                // Calculate SPK Scores automatically
                $spkScores = $this->calculateSpkScores($kegiatan);

                // 4. Update status back to Review
                $kak = $kegiatan->kak;
                $oldStatus = $kak->status_id;
                $newStatus = 11;

                $kegiatan->update([
                    'lpj_submitted_at' => now(),
                    'spk_kesesuaian_waktu' => $spkInputs['spk_kesesuaian_waktu'] ?? $kegiatan->spk_kesesuaian_waktu,
                    'spk_kesesuaian_output' => $spkInputs['spk_kesesuaian_output'] ?? $kegiatan->spk_kesesuaian_output,
                    'spk_ketepatan_anggaran' => $spkScores['spk_ketepatan_anggaran'],
                    'spk_ketepatan_lpj' => $spkScores['spk_ketepatan_lpj'],
                ]);
                $kak->update(['status_id' => $newStatus]);

                $approval->update([
                    'status' => 'Aktif',
                    'catatan' => null,
                    'approver_user_id' => null,
                ]);

                KegiatanLogStatus::create([
                    'kegiatan_id' => $kegiatan->kegiatan_id,
                    'status_id_lama' => $oldStatus,
                    'status_id_baru' => $newStatus,
                    'actor_user_id' => $actor->user_id,
                    'catatan' => 'LPJ disubmit ulang setelah revisi.',
                ]);

                // Dispatch event to send Email to Bendahara
                event(new LpjSubmitted($kegiatan, 'resubmitted'));
            });
        } catch (Exception $e) {
            $this->cleanupFiles($uploadedFiles);
            throw $e;
        }
    }

    /**
     * Revise LPJ (Bendahara).
     *
     * @throws LpjException
     */
    public function revise(Kegiatan $kegiatan, ?array $anggaranComments, ?array $lampiranComments, User $actor): void
    {
        DB::transaction(function () use ($kegiatan, $anggaranComments, $lampiranComments, $actor) {
            $kegiatan = Kegiatan::where('kegiatan_id', $kegiatan->kegiatan_id)->lockForUpdate()->first();

            // 1. Clear old comments before applying new ones
            KegiatanLampiran::whereHas('anggaran', function ($q) use ($kegiatan) {
                $q->where('kak_id', $kegiatan->kak_id);
            })->update([
                'catatan_reviewer' => null,
                'reviewer_user_id' => null,
                'approval_tanggal' => null,
            ]);

            KAKAnggaran::where('kak_id', $kegiatan->kak_id)->update([
                'catatan_verifikator' => null,
            ]);

            // 2. Process lampiran comments from request
            if (! empty($lampiranComments)) {
                foreach ($lampiranComments as $comment) {
                    $lampiran = KegiatanLampiran::find($comment['id']);
                    if ($lampiran) {
                        $lampiran->update([
                            'catatan_reviewer' => $comment['catatan_reviewer'],
                            'reviewer_user_id' => $actor->user_id,
                            'approval_tanggal' => now(),
                        ]);
                    }
                }
            }

            // Process anggaran comments from request
            if (! empty($anggaranComments)) {
                foreach ($anggaranComments as $comment) {
                    $anggaran = KAKAnggaran::find($comment['id']);
                    if ($anggaran) {
                        $anggaran->update([
                            'catatan_verifikator' => $comment['catatan_reviewer'],
                        ]);
                    }
                }
            }

            // 2. Update status to Revisi
            $approval = KegiatanApproval::where('kegiatan_id', $kegiatan->kegiatan_id)
                ->where('approval_level', 'Bendahara-LPJ')
                ->first();

            if (! $approval) {
                throw new LpjException('Alur persetujuan LPJ tidak ditemukan.');
            }

            $approval->update([
                'status' => 'Revisi',
                'catatan' => 'LPJ dikembalikan untuk revisi.',
                'approver_user_id' => $actor->user_id,
            ]);

            $kak = $kegiatan->kak;
            $oldStatus = $kak->status_id;
            $newStatus = 12; // LPJ Direvisi

            $kak->update(['status_id' => $newStatus]);

            KegiatanLogStatus::create([
                'kegiatan_id' => $kegiatan->kegiatan_id,
                'status_id_lama' => $oldStatus,
                'status_id_baru' => $newStatus,
                'actor_user_id' => $actor->user_id,
                'catatan' => 'LPJ dikembalikan untuk revisi.',
            ]);

            // Dispatch event for revised LPJ
            event(new LpjRevised($kegiatan, 'LPJ Anda memerlukan revisi. Silakan cek catatan di aplikasi.'));
        });
    }

    /**
     * Approve LPJ (Bendahara).
     *
     * @throws LpjException
     */
    public function approve(Kegiatan $kegiatan, User $actor): void
    {
        DB::transaction(function () use ($kegiatan, $actor) {
            $kegiatan = Kegiatan::where('kegiatan_id', $kegiatan->kegiatan_id)->lockForUpdate()->first();

            $approval = KegiatanApproval::where('kegiatan_id', $kegiatan->kegiatan_id)
                ->where('approval_level', 'Bendahara-LPJ')
                ->first();

            if (! $approval || ! in_array($approval->status, ['Aktif', 'Revisi'])) {
                throw new LpjException('LPJ tidak dalam status yang dapat disetujui.');
            }

            $approval->update([
                'status' => 'Disetujui',
                'catatan' => 'LPJ disetujui secara digital.',
                'approver_user_id' => $actor->user_id,
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
                'actor_user_id' => $actor->user_id,
                'catatan' => 'LPJ digital disetujui. Menunggu setor fisik.',
            ]);

            // Dispatch event for approved LPJ
            event(new LpjApproved($kegiatan, 'LPJ digital Anda telah disetujui. Silakan segera setor berkas fisik ke Bendahara.'));
        });
    }

    /**
     * Complete LPJ (Bendahara).
     *
     * @throws LpjException
     */
    public function complete(Kegiatan $kegiatan, User $actor): void
    {
        DB::transaction(function () use ($kegiatan, $actor) {
            $kegiatan = Kegiatan::where('kegiatan_id', $kegiatan->kegiatan_id)->lockForUpdate()->first();

            $approval = KegiatanApproval::where('kegiatan_id', $kegiatan->kegiatan_id)
                ->where('status', 'Aktif')
                ->first();

            if (! $approval || $approval->approval_level !== 'Bendahara-Setor') {
                throw new LpjException('Hanya bisa diselesaikan jika alur persetujuan berada di level "Bendahara-Setor".');
            }

            $approval->update([
                'status' => 'Disetujui',
                'catatan' => 'Bukti fisik telah diterima dan LPJ dinyatakan selesai.',
                'approver_user_id' => $actor->user_id,
            ]);

            $kak = $kegiatan->kak;
            $oldStatus = $kak->status_id;
            $newStatus = 14; // Selesai

            $kak->update(['status_id' => $newStatus]);

            KegiatanLogStatus::create([
                'kegiatan_id' => $kegiatan->kegiatan_id,
                'status_id_lama' => $oldStatus,
                'status_id_baru' => $newStatus,
                'actor_user_id' => $actor->user_id,
                'catatan' => 'LPJ fisik diterima. Kegiatan selesai.',
            ]);

            // Dispatch event for completed LPJ
            event(new LpjCompleted($kegiatan, 'Selamat! Seluruh tahapan LPJ telah selesai dan berkas fisik telah diterima.'));
        });
    }

    /**
     * Calculate automatic SPK scores.
     */
    public function calculateSpkScores(Kegiatan $kegiatan): array
    {
        $config = SpkConfig::getActive();

        // 1. Calculate Ketepatan Anggaran score (anggaran_min - anggaran_max)
        $totalBudget = 0;
        $totalRealization = 0;
        $anggarans = KAKAnggaran::where('kak_id', $kegiatan->kak_id)->get();
        foreach ($anggarans as $anggaran) {
            $totalBudget += (float) $anggaran->jumlah_diusulkan;
            $totalRealization += (float) ($anggaran->realisasi_jumlah ?? 0);
        }

        $ketepatanAnggaran = $config->anggaran_max;
        if ($totalBudget > 0) {
            $ratio = $totalRealization / $totalBudget;
            if (abs($ratio - 1) >= 0.001) {
                $differencePercentage = abs(1 - $ratio) * 100;
                $ketepatanAnggaran = (int) max($config->anggaran_min, min($config->anggaran_max, round($config->anggaran_max - $differencePercentage)));
            }
        }

        // 2. Calculate Ketepatan LPJ score (lpj_min - lpj_max)
        $ketepatanLpj = $config->lpj_max;
        if ($kegiatan->tgl_batas_lpj) {
            $deadline = Carbon::parse($kegiatan->tgl_batas_lpj);
            $submissionTime = $kegiatan->lpj_submitted_at ? Carbon::parse($kegiatan->lpj_submitted_at) : now();
            if ($submissionTime->gt($deadline)) {
                $daysLate = $submissionTime->diffInDays($deadline);
                $ketepatanLpj = (int) max($config->lpj_min, min($config->lpj_max, $config->lpj_max - ($daysLate * $config->lpj_penalty_per_day)));
            }
        }

        return [
            'spk_ketepatan_anggaran' => $ketepatanAnggaran,
            'spk_ketepatan_lpj' => $ketepatanLpj,
        ];
    }

    /**
     * Helper to calculate a single budget line total.
     */
    public function calculateTotal(array $data): float
    {
        $v1 = (float) ($data['volume1'] ?? 0);
        $v2 = (float) (isset($data['volume2']) && $data['volume2'] !== '' ? $data['volume2'] : 1);
        $v3 = (float) (isset($data['volume3']) && $data['volume3'] !== '' ? $data['volume3'] : 1);
        $price = (float) (isset($data['harga_satuan']) ? preg_replace('/[^0-9]/', '', $data['harga_satuan']) : 0);

        return $v1 * $v2 * $v3 * $price;
    }

    /**
     * File cleanup helper.
     */
    private function cleanupFiles(array $paths): void
    {
        foreach ($paths as $path) {
            Storage::disk('supabase')->delete($path);
        }
    }

    /**
     * Get LPJ list eligible for the user (role-aware).
     *
     * @throws AuthorizationException
     */
    public function getEligibleLpjs(User $user): Collection
    {
        $role = $user->getRoleName();

        if (! in_array($role, ['Admin', 'Bendahara', 'Pengusul'])) {
            throw new AuthorizationException('Anda tidak memiliki akses ke LPJ.');
        }

        $query = Kegiatan::select([
            'kegiatan_id',
            'kak_id',
            'lpj_submitted_at',
            'lpj_approved_at',
            'lpj_completed_at',
        ])->with([
            'kak' => fn ($q) => $q->select([
                'kak_id',
                'nama_kegiatan',
                'status_id',
                'pengusul_user_id',
                'mata_anggaran_id',
                'tipe_kegiatan_id',
            ]),
            'kak.pengusul' => fn ($q) => $q->select(['user_id', 'nama_lengkap']),
            'kak.mataAnggaran' => fn ($q) => $q->select(['mata_anggaran_id', 'nama_mata_anggaran']),
            'kak.tipeKegiatan' => fn ($q) => $q->select(['tipe_kegiatan_id', 'nama_tipe']),
            'kak.status' => fn ($q) => $q->select(['status_id', 'nama_status']),
            'approvals' => fn ($q) => $q->select(['approval_kegiatan_id', 'kegiatan_id', 'approval_level', 'status', 'approved_at']),
        ])->whereHas('kak', function ($q) {
            // Only show kegiatan with status >= 10 (Approved KAK) and not rejected
            $q->where('status_id', '>=', 10)->where('status_id', '!=', 14);
        });

        if ($role === 'Pengusul') {
            $query->whereHas('kak', function ($q) use ($user) {
                $q->where('pengusul_user_id', $user->user_id);
            });
        }

        $kegiatans = $query->get();
        $kegiatans->load(['kak' => fn ($q) => $q->select([
            'kak_id',
            'nama_kegiatan',
            'status_id',
            'pengusul_user_id',
            'mata_anggaran_id',
            'tipe_kegiatan_id',
        ])->withSum('anggaran', 'jumlah_diusulkan')]);

        return $kegiatans->map(function (Kegiatan $kegiatan) {
            $totalAnggaran = (float) ($kegiatan->kak?->anggaran_sum_jumlah_diusulkan ?? 0);
            $totalDicairkan = $kegiatan->pencairanDana()->sum('jumlah_dicairkan');

            return [
                'kegiatan_id' => $kegiatan->kegiatan_id,
                'kak_id' => $kegiatan->kak_id,
                'nama_kegiatan' => $kegiatan->kak?->nama_kegiatan ?? '-',
                'status_id' => $kegiatan->kak?->status_id,
                'status_nama' => $kegiatan->kak?->status?->nama_status ?? '-',
                'total_anggaran_diusulkan' => $totalAnggaran,
                'dana_dicairkan' => $totalDicairkan,
                'sisa_dana' => $totalAnggaran - $totalDicairkan,
                'lpj_submitted_at' => $kegiatan->lpj_submitted_at,
                'lpj_status' => $this->getLpjStatus($kegiatan),
            ];
        });
    }

    /**
     * Get LPJ status based on timestamps.
     */
    public function getLpjStatus(Kegiatan $kegiatan): string
    {
        if ($kegiatan->lpj_completed_at) {
            return 'Completed';
        }
        if ($kegiatan->lpj_approved_at) {
            return 'Approved';
        }
        if ($kegiatan->lpj_submitted_at) {
            $approval = $kegiatan->approvals->where('approval_level', 'Bendahara-LPJ')->first();
            if ($approval && $approval->status === 'Revisi') {
                return 'Revision Requested';
            }

            return 'Submitted';
        }

        return 'Draft';
    }
}

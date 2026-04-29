<?php

namespace App\Http\Controllers;

use App\Http\Requests\ApproveLpjRequest;
use App\Http\Requests\CompleteLpjRequest;
use App\Http\Requests\ResubmitLpjRequest;
use App\Http\Requests\ReviseLpjRequest;
use App\Http\Requests\SubmitLpjRequest;
use App\Mail\LPJWorkflowMail;
use App\Models\KAKAnggaran;
use App\Models\Kegiatan;
use App\Models\KegiatanApproval;
use App\Models\KegiatanLampiran;
use App\Models\KegiatanLogStatus;
use App\Models\Satuan;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class LpjController extends Controller
{
    /**
     * Display the LPJ index page for Admin, Bendahara, and Pengusul.
     */
    public function index(Request $request): \Inertia\Response
    {
        $user = $request->user();
        $role = $user->getRoleName();

        if (! in_array($role, ['Admin', 'Bendahara', 'Pengusul'])) {
            abort(403, 'Anda tidak memiliki akses ke halaman ini.');
        }

        $query = Kegiatan::with([
            'kak.pengusul',
            'kak.mataAnggaran',
            'kak.tipeKegiatan',
            'kak.status',
            'approvals',
        ])->whereHas('kak', function ($q) {
            $q->where('status_id', '>=', 10)->where('status_id', '!=', 14);
        });

        if ($role === 'Pengusul') {
            $query->whereHas('kak', function ($q) use ($user) {
                $q->where('pengusul_user_id', $user->user_id);
            });
        }

        $kegiatans = $query->get();

        // For accurate total_anggaran, we need to load the sum of anggaran
        $kegiatans->load(['kak' => fn ($q) => $q->withSum('anggaran', 'jumlah_diusulkan')]);

        $kegiatans = $kegiatans->map(function (Kegiatan $kegiatan) {
            $totalAnggaran = (float) ($kegiatan->kak?->anggaran_sum_jumlah_diusulkan ?? 0);

            // Re-use logic from Pencairan to get total dicairkan and calculate sisa dana
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
            ];
        });

        return Inertia::render('Lpj/Index', [
            'kegiatans' => $kegiatans,
        ]);
    }

    /**
     * Submit LPJ for a given kegiatan (Pengusul).
     */
    public function submit(SubmitLpjRequest $request, Kegiatan $kegiatan): RedirectResponse
    {
        Log::info('LPJ Submit Method Reached', [
            'user_id' => $request->user()->user_id,
            'kegiatan_id' => $kegiatan->kegiatan_id,
            'has_realisasi' => $request->has('realisasi'),
            'has_bukti' => ! empty($request->file('bukti')),
        ]);

        $uploadedFiles = [];

        try {
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
                if (is_array($request->file('bukti'))) {
                    foreach ($request->file('bukti') as $anggaranId => $files) {
                        foreach ($files as $file) {
                            $filename = time().'_'.$file->getClientOriginalName();
                            // Consistent with LampiranController: use 'public' disk and relative path
                            $path = $file->storeAs('lampiran/'.$anggaranId, $filename, 'supabase');
                            if (! $path) {
                                throw new \Exception("Gagal menyimpan file {$file->getClientOriginalName()}");
                            }

                            $uploadedFiles[] = $path;

                            KegiatanLampiran::create([
                                'anggaran_id' => $anggaranId,
                                'nama_file_asli' => $file->getClientOriginalName(),
                                'path_file_disimpan' => $path,
                                'uploader_user_id' => $request->user()->user_id,
                                'status_lampiran' => 'pending',
                            ]);
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

                // Send Email to Bendahara
                $this->sendLpjMailToBendahara($kegiatan, 'submitted');

                return redirect()->route('lpj.index')->with('success', 'LPJ berhasil disubmit dan menunggu review dari Bendahara LPJ.');
            });
        } catch (\Exception $e) {
            Log::error('LPJ Submit Failed', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            $this->cleanupFiles($uploadedFiles);

            return redirect()->back()->withErrors(['message' => 'Terjadi kesalahan saat submit LPJ: '.$e->getMessage()]);
        }
    }

    /**
     * Review LPJ (Bendahara or Pengusul).
     */
    public function review(Request $request, Kegiatan $kegiatan): \Inertia\Response
    {
        $user = $request->user();
        if (! $this->canAccessLpj($user, $kegiatan)) {
            abort(403, 'Anda tidak memiliki akses ke LPJ ini.');
        }

        $kegiatan->load(['kak.pengusul', 'kak.mataAnggaran', 'approvals']);

        $anggaran = KAKAnggaran::with(['kategoriBelanja', 'lampiran.uploader'])
            ->where('kak_id', $kegiatan->kak_id)
            ->get();

        // Resolve storage URLs for lampiran
        $lampirans = $anggaran->pluck('lampiran')->flatten()->map(function ($l) {
            if ($l->path_file_disimpan && ! str_starts_with($l->path_file_disimpan, 'http')) {
                $l->path_file_disimpan = Storage::disk('supabase')->url($l->path_file_disimpan);
            }

            return $l;
        });

        return Inertia::render('Lpj/Form', [
            'kegiatan' => $kegiatan,
            'anggaran' => $anggaran,
            'lampiran' => $lampirans,
            'satuans' => Satuan::all(),
        ]);
    }

    /**
     * Revise LPJ (Bendahara).
     */
    public function revise(ReviseLpjRequest $request, Kegiatan $kegiatan): RedirectResponse
    {
        return DB::transaction(function () use ($request, $kegiatan) {
            $kegiatan = Kegiatan::where('kegiatan_id', $kegiatan->kegiatan_id)->lockForUpdate()->first();

            // 1. Clear old comments before applying new ones
            // Clear lampiran comments for this kegiatan
            KegiatanLampiran::whereHas('anggaran', function ($q) use ($kegiatan) {
                $q->where('kak_id', $kegiatan->kak_id);
            })->update([
                'catatan_reviewer' => null,
                'reviewer_user_id' => null,
                'approval_tanggal' => null,
            ]);

            // Clear anggaran comments for this kegiatan
            KAKAnggaran::where('kak_id', $kegiatan->kak_id)->update([
                'catatan_verifikator' => null,
            ]);

            // 2. Process lampiran comments from request
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

            // Process anggaran comments from request
            if ($request->has('anggaran_comments')) {
                foreach ($request->anggaran_comments as $comment) {
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
                return redirect()->back()->withErrors(['message' => 'Alur persetujuan LPJ tidak ditemukan.']);
            }

            $approval->update([
                'status' => 'Revisi',
                'catatan' => 'LPJ dikembalikan untuk revisi.',
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
                'catatan' => 'LPJ dikembalikan untuk revisi.',
            ]);

            // Send Email to Pengusul
            $this->sendLpjMailToPengusul($kegiatan, 'revised', 'LPJ Anda memerlukan revisi. Silakan cek catatan di aplikasi.');

            return redirect()->route('lpj.index')->with('success', 'LPJ telah dikembalikan untuk revisi.');
        });
    }

    /**
     * Resubmit LPJ (Pengusul).
     */
    public function resubmit(ResubmitLpjRequest $request, Kegiatan $kegiatan): RedirectResponse
    {
        Log::info('LPJ Resubmit Method Reached', [
            'user_id' => $request->user()->user_id,
            'kegiatan_id' => $kegiatan->kegiatan_id,
        ]);

        $uploadedFiles = [];

        try {
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
                                'realisasi_volume1' => $data['volume1'] ?? $anggaran->realisasi_volume1,
                                'realisasi_satuan1_id' => $data['satuan1_id'] ?? $anggaran->realisasi_satuan1_id,
                                'realisasi_volume2' => $data['volume2'] ?? $anggaran->realisasi_volume2,
                                'realisasi_satuan2_id' => $data['satuan2_id'] ?? $anggaran->realisasi_satuan2_id,
                                'realisasi_volume3' => $data['volume3'] ?? $anggaran->realisasi_volume3,
                                'realisasi_satuan3_id' => $data['satuan3_id'] ?? $anggaran->realisasi_satuan3_id,
                                'realisasi_harga_satuan' => isset($data['harga_satuan']) ? preg_replace('/[^0-9]/', '', $data['harga_satuan']) : $anggaran->realisasi_harga_satuan,
                                'realisasi_jumlah' => $this->calculateTotal($data),
                            ]);
                        }
                    }
                }

                // 3. Handle new uploads
                if (is_array($request->file('bukti'))) {
                    foreach ($request->file('bukti') as $anggaranId => $files) {
                        foreach ($files as $file) {
                            $filename = time().'_'.$file->getClientOriginalName();
                            $path = $file->storeAs('lampiran/'.$anggaranId, $filename, 'supabase');
                            if (! $path) {
                                throw new \Exception("Gagal menyimpan file {$file->getClientOriginalName()}");
                            }

                            $uploadedFiles[] = $path;

                            KegiatanLampiran::create([
                                'anggaran_id' => $anggaranId,
                                'nama_file_asli' => $file->getClientOriginalName(),
                                'path_file_disimpan' => $path,
                                'uploader_user_id' => $request->user()->user_id,
                                'status_lampiran' => 'pending',
                            ]);
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

                // Send Email to Bendahara
                $this->sendLpjMailToBendahara($kegiatan, 'resubmitted');

                return redirect()->route('lpj.index')->with('success', 'LPJ berhasil disubmit ulang dan menunggu review dari Bendahara.');
            });
        } catch (\Exception $e) {
            Log::error('LPJ Resubmit Failed', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            $this->cleanupFiles($uploadedFiles);

            return redirect()->back()->withErrors(['message' => 'Terjadi kesalahan saat submit ulang LPJ: '.$e->getMessage()]);
        }
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

            // Send Email to Pengusul
            $this->sendLpjMailToPengusul($kegiatan, 'approved', 'LPJ digital Anda telah disetujui. Silakan segera setor berkas fisik ke Bendahara.');

            return redirect()->route('lpj.index')->with('success', 'LPJ berhasil disetujui.');
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

            // Send Email to Pengusul
            $this->sendLpjMailToPengusul($kegiatan, 'completed', 'Selamat! Seluruh tahapan LPJ telah selesai dan berkas fisik telah diterima.');

            return redirect()->route('lpj.index')->with('success', 'LPJ telah ditandai selesai.');
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

    public function calculateTotal(array $data): float
    {
        $v1 = (float) ($data['volume1'] ?? 0);
        $v2 = (float) (isset($data['volume2']) && $data['volume2'] !== '' ? $data['volume2'] : 1);
        $v3 = (float) (isset($data['volume3']) && $data['volume3'] !== '' ? $data['volume3'] : 1);
        $price = (float) (isset($data['harga_satuan']) ? preg_replace('/[^0-9]/', '', $data['harga_satuan']) : 0);

        return $v1 * $v2 * $v3 * $price;
    }

    private function cleanupFiles(array $paths): void
    {
        foreach ($paths as $path) {
            Storage::disk('supabase')->delete($path);
        }
    }

    private function sendLpjMailToBendahara(Kegiatan $kegiatan, string $type)
    {
        $bendahara = User::whereHas('role', function ($q) {
            $q->where('nama_role', 'Bendahara');
        })->first();

        if ($bendahara && $bendahara->email) {
            $isResubmit = ($type === 'resubmitted');
            $data = [
                'subject' => $isResubmit ? '🔄 LPJ Direvisi - Perlu Review Ulang' : '📋 LPJ Baru Perlu Review - SIGAP PNJ',
                'title' => 'Review LPJ Baru',
                'recipient_name' => $bendahara->nama_lengkap,
                'body' => $isResubmit
                    ? 'Halo <strong>Bendahara</strong>,<br><br>LPJ yang sebelumnya diminta revisi telah diajukan kembali oleh pengusul.'
                    : 'Halo <strong>Bendahara</strong>,<br><br>Ada LPJ baru yang telah disubmit dan memerlukan review Anda.',
                'details' => [
                    'Nama Kegiatan' => $kegiatan->kak->nama_kegiatan,
                    'Pengusul' => $kegiatan->kak->pengusul->nama_lengkap,
                ],
                'action_link' => config('app.url')."/lpj/review/{$kegiatan->kegiatan_id}",
                'status_color' => '#dc3545',
            ];

            Mail::to($bendahara->email)->send(new LPJWorkflowMail($data));
        }
    }

    private function sendLpjMailToPengusul(Kegiatan $kegiatan, string $type, string $message)
    {
        $pengusul = $kegiatan->kak->pengusul;

        if ($pengusul && $pengusul->email) {
            $data = [
                'subject' => 'Status LPJ: '.strtoupper($type).' - SIGAP PNJ',
                'title' => 'Update Status LPJ',
                'recipient_name' => $pengusul->nama_lengkap,
                'body' => $message,
                'details' => [
                    'Nama Kegiatan' => $kegiatan->kak->nama_kegiatan,
                ],
                'action_link' => config('app.url').'/lpj',
                'status_color' => ($type === 'revised' ? '#ffc107' : '#28a745'),
            ];

            Mail::to($pengusul->email)->send(new LPJWorkflowMail($data));
        }
    }
}

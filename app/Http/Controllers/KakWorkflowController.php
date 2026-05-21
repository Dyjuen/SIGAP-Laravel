<?php

namespace App\Http\Controllers;

use App\Mail\KAKWorkflowMail;
use App\Models\KAK;
use App\Models\KAKApproval;
use App\Models\KAKLogStatus;
use App\Models\MataAnggaran;
use App\Models\User;
use App\Traits\AuthorizesKakAccess;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;

class KakWorkflowController extends Controller
{
    use AuthorizesKakAccess;

    /**
     * Submit KAK for verification (Draft -> Review)
     */
    public function submit(KAK $kak)
    {
        $this->authorizeAccess($kak, false, true); // workflow action

        if (! in_array($kak->status_id, [1, 5])) { // Draft or Revisi
            abort(403, 'Anda hanya dapat mengajukan KAK dengan status Draft atau Revisi.');
        }

        DB::transaction(function () use ($kak) {
            $oldStatus = $kak->status_id;

            // Update Status to Review (2)
            $kak->status_id = 2;

            // NOTE: We do NOT clear catatan fields here anymore, per new requirement.
            // They are preserved as history.

            $kak->save();

            // Log Status
            $this->logStatus($kak, $oldStatus, 2);

            // Send Email to Verifikator
            $this->sendMailToVerifikator($kak, 'submitted');
        });

        return back()->with('success', 'KAK berhasil diajukan untuk verifikasi.');
    }

    /**
     * Approve KAK (Review -> Disetujui)
     */
    public function approve(Request $request, KAK $kak)
    {
        $this->authorizeAccess($kak, false, true);

        if ($kak->status_id !== 2) {
            abort(403, 'Hanya KAK dalam status Review yang dapat disetujui.');
        }

        $request->validate([
            'mata_anggaran_id' => 'nullable|exists:m_mata_anggaran,mata_anggaran_id',
            'kode_anggaran' => 'required_without:mata_anggaran_id|string|nullable',
            'nama_sumber_dana' => 'required_without:mata_anggaran_id|string|nullable',
            'tahun_anggaran' => 'required_without:mata_anggaran_id|integer|nullable',
            'total_pagu' => 'required_without:mata_anggaran_id|numeric|nullable',
        ]);

        DB::transaction(function () use ($request, $kak) {
            $oldStatus = $kak->status_id;

            if ($request->filled('mata_anggaran_id')) {
                $mataAnggaranId = $request->mata_anggaran_id;
            } else {
                // Handle Mata Anggaran Baru
                $mataAnggaran = MataAnggaran::firstOrCreate(
                    ['kode_anggaran' => $request->kode_anggaran],
                    [
                        'nama_sumber_dana' => $request->nama_sumber_dana,
                        'tahun_anggaran' => $request->tahun_anggaran,
                        'total_pagu' => $request->total_pagu,
                    ]
                );
                $mataAnggaranId = $mataAnggaran->mata_anggaran_id;
            }

            // Update KAK
            $kak->status_id = 3; // Disetujui
            $kak->mata_anggaran_id = $mataAnggaranId;

            // Clear catatan on Approval
            $this->clearCatatan($kak);

            $kak->save();

            // Log Status
            $this->logStatus($kak, $oldStatus, 3);

            // Update Approval
            KAKApproval::create([
                'kak_id' => $kak->kak_id,
                'approver_user_id' => Auth::id(),
                'status' => 'Disetujui',
                'tanggal_telaah' => now(),
                'catatan' => null,
            ]);

            // Send Email to Pengusul
            $this->sendMailToPengusul($kak, 'approved');
        });

        return back()->with('success', 'KAK berhasil disetujui.');
    }

    /**
     * Reject KAK (Review -> Ditolak)
     */
    public function reject(Request $request, KAK $kak)
    {
        $this->authorizeVerifikator($kak);

        if ($kak->status_id !== 2) {
            abort(403, 'Hanya KAK dalam status Review yang dapat ditolak.');
        }

        $request->validate([
            'catatan' => 'required|string',
        ]);

        DB::transaction(function () use ($request, $kak) {
            $oldStatus = $kak->status_id;

            $kak->status_id = 4; // Ditolak
            $kak->save();

            $this->logStatus($kak, $oldStatus, 4);

            KAKApproval::create([
                'kak_id' => $kak->kak_id,
                'approver_user_id' => Auth::id(),
                'status' => 'Ditolak',
                'tanggal_telaah' => now(),
                'catatan' => $request->catatan,
            ]);

            // Send Email to Pengusul
            $this->sendMailToPengusul($kak, 'rejected', $request->catatan);
        });

        return back()->with('success', 'KAK telah ditolak.');
    }

    /**
     * Request Revision (Review -> Revisi)
     */
    public function revise(Request $request, KAK $kak)
    {
        $this->authorizeVerifikator($kak);

        if ($kak->status_id !== 2) {
            abort(403, 'Hanya KAK dalam status Review yang dapat direvisi.');
        }

        // Validate that broad notes or specific field notes exist
        $request->validate([
            'catatan' => 'nullable|string',
            'catatan_kak' => 'array', // Map of field => note
        ]);

        DB::transaction(function () use ($request, $kak) {
            $oldStatus = $kak->status_id;

            $kak->status_id = 5; // Revisi

            // Clear all previous review notes first before setting the new ones
            $this->clearCatatan($kak);

            // Save specific field notes
            $catatanKak = $request->input('catatan_kak', []);
            $kakFieldsMap = [
                'nama_kegiatan' => 'catatan_nama_kegiatan',
                'deskripsi_kegiatan' => 'catatan_deskripsi_kegiatan',
                'tipe_kegiatan_id' => 'catatan_tipe_kegiatan',
                'sasaran_utama' => 'catatan_sasaran_utama',
                'metode_pelaksanaan' => 'catatan_metode_pelaksanaan',
                'lokasi' => 'catatan_lokasi',
                'tanggal' => 'catatan_tanggal',
            ];

            foreach ($kakFieldsMap as $frontendKey => $dbCol) {
                if (isset($catatanKak[$frontendKey])) {
                    $kak->$dbCol = $catatanKak[$frontendKey];
                }
            }

            $kak->save();

            $this->logStatus($kak, $oldStatus, 5);

            KAKApproval::create([
                'kak_id' => $kak->kak_id,
                'approver_user_id' => Auth::id(),
                'status' => 'Revisi',
                'tanggal_telaah' => now(),
                'catatan' => $request->catatan, // General note
            ]);

            // Save child items' notes
            $anak = $request->input('anak', []);

            // Map table names from request to Eloquent relationships and primary keys
            $childMaps = [
                't_kak_manfaat' => ['relation' => 'manfaat', 'pk' => 'manfaat_id', 'note_col' => 'catatan_manfaat'],
                't_kak_tahapan' => ['relation' => 'tahapan', 'pk' => 'tahapan_id', 'note_col' => 'catatan_verifikator'],
                't_kak_target' => ['relation' => 'targets', 'pk' => 'target_id', 'note_col' => 'catatan_verifikator'], // Indikator
                't_kak_iku' => ['relation' => 'ikus', 'pk' => 'iku_id', 'note_col' => 'catatan_verifikator'],
                't_kak_anggaran' => ['relation' => 'anggaran', 'pk' => 'anggaran_id', 'note_col' => 'catatan_verifikator'], // RAB
            ];

            foreach ($childMaps as $table => $map) {
                if (isset($anak[$table]) && is_array($anak[$table])) {
                    $relation = $map['relation'];
                    $pk = $map['pk'];
                    $noteCol = $map['note_col'];

                    foreach ($anak[$table] as $itemNote) {
                        if (isset($itemNote['id']) && array_key_exists($noteCol, $itemNote)) {
                            $kak->$relation()->where($pk, $itemNote['id'])->update([
                                $noteCol => $itemNote[$noteCol],
                            ]);
                        }
                    }
                }
            }

            // Send Email to Pengusul
            $this->sendMailToPengusul($kak, 'revised', $request->catatan);
        });

        return back()->with('success', 'Permintaan revisi dikirim.');
    }

    /**
     * Resubmit Revised KAK (Revisi -> Review)
     */
    public function resubmit(KAK $kak)
    {
        $this->authorizeOwner($kak);

        if ($kak->status_id !== 5) {
            abort(403, 'Hanya KAK dalam status Revisi yang dapat diajukan kembali.');
        }

        DB::transaction(function () use ($kak) {
            $oldStatus = $kak->status_id;

            $kak->status_id = 2; // Review

            // NOTE: Do NOT clear catatan fields. Preserve them.

            $kak->save();

            $this->logStatus($kak, $oldStatus, 2);

            // Send Email to Verifikator
            $this->sendMailToVerifikator($kak, 'resubmitted');
        });

        return back()->with('success', 'KAK berhasil diajukan kembali.');
    }

    /* Helpers */

    private function logStatus(KAK $kak, $oldStatusId, $newStatusId)
    {
        KAKLogStatus::create([
            'kak_id' => $kak->kak_id,
            'status_id_lama' => $oldStatusId,
            'status_id_baru' => $newStatusId,
            'actor_user_id' => Auth::id(),
            'created_at' => now(),
        ]);
    }

    private function authorizeOwner(KAK $kak)
    {
        if (Auth::user()->role_id === 3 && $kak->pengusul_user_id !== Auth::id()) {
            abort(403, 'Unauthorized');
        }
    }

    private function authorizeVerifikator(KAK $kak)
    {
        $user = Auth::user();
        if ($user->role_id !== 2) { // Verifikator only
            abort(403, 'Unauthorized');
        }

        // Strict Check: Tipe Kegiatan must match username suffix
        if (preg_match('/verifikator(\d+)/', $user->username, $matches)) {
            $allowedTipeId = (int) $matches[1];
            if ($kak->tipe_kegiatan_id !== $allowedTipeId) {
                abort(403, 'Anda hanya dapat memverifikasi KAK dengan Tipe Kegiatan '.$allowedTipeId);
            }
        } else {
            abort(403, 'Username verifikator tidak valid untuk pemetaan tipe kegiatan.');
        }

        if ($kak->pengusul_user_id === $user->user_id) {
            abort(403, 'Verifikator tidak dapat memverifikasi KAK sendiri.');
        }
    }

    private function clearCatatan(KAK $kak)
    {
        $kak->catatan_nama_kegiatan = null;
        $kak->catatan_tipe_kegiatan = null;
        $kak->catatan_deskripsi_kegiatan = null;
        $kak->catatan_sasaran_utama = null;
        $kak->catatan_metode_pelaksanaan = null;
        $kak->catatan_lokasi = null;
        $kak->catatan_tanggal = null;

        // Clear child notes
        $kak->manfaat()->update(['catatan_manfaat' => null]);
        $kak->tahapan()->update(['catatan_verifikator' => null]);
        $kak->targets()->update(['catatan_verifikator' => null]);
        $kak->ikus()->update(['catatan_verifikator' => null]);
        $kak->anggaran()->update(['catatan_verifikator' => null]);
    }

    private function sendMailToVerifikator(KAK $kak, string $type)
    {
        $kak->load('pengusul');

        // Find the specific Verifikator based on tipe_kegiatan_id
        $verifikatorUsername = 'verifikator'.$kak->tipe_kegiatan_id;
        $verifikator = User::where('username', $verifikatorUsername)->first();

        if ($verifikator && $verifikator->email) {
            $isResubmit = ($type === 'resubmitted');
            $data = [
                'subject' => $isResubmit ? '🔄 KAK Sudah Direvisi - Perlu Review Ulang' : '🔔 KAK Baru Membutuhkan Verifikasi',
                'title' => $isResubmit ? 'KAK Telah Direvisi' : 'KAK Baru Disubmit',
                'recipient_name' => $verifikator->nama_lengkap,
                'body' => $isResubmit
                    ? 'Halo <strong>Verifikator</strong>,<br><br>KAK yang sebelumnya diminta revisi telah diajukan kembali.'
                    : 'Halo <strong>Verifikator</strong>,<br><br>Ada KAK baru yang telah disubmit dan membutuhkan verifikasi.',
                'details' => [
                    'Nama Kegiatan' => $kak->nama_kegiatan,
                    'Diajukan oleh' => $kak->pengusul->nama_lengkap,
                ],
                'action_link' => config('app.url')."/kak/{$kak->kak_id}",
                'action_text' => 'Review KAK Sekarang',
                'status_color' => '#1ABDD4',
            ];

            Mail::to($verifikator->email)->send(new KAKWorkflowMail($data));
        }
    }

    private function sendMailToPengusul(KAK $kak, string $type, ?string $catatan = null)
    {
        $kak->load('pengusul');
        $pengusul = $kak->pengusul;

        if ($pengusul && $pengusul->email) {
            $config = [
                'approved' => [
                    'subject' => '✅ KAK Disetujui - SIGAP PNJ',
                    'title' => 'KAK Disetujui',
                    'body' => 'Selamat! KAK Anda telah disetujui oleh Verifikator. Silakan melanjutkan ke tahap pengajuan kegiatan.',
                    'color' => '#28a745',
                ],
                'rejected' => [
                    'subject' => '❌ KAK Ditolak - SIGAP PNJ',
                    'title' => 'KAK Ditolak',
                    'body' => 'Mohon maaf, KAK Anda telah ditolak oleh Verifikator.<br><br><strong>Catatan:</strong> '.($catatan ?? '-'),
                    'color' => '#dc3545',
                ],
                'revised' => [
                    'subject' => '⚠️ KAK Perlu Revisi - SIGAP PNJ',
                    'title' => 'Permintaan Revisi KAK',
                    'body' => 'Verifikator telah mereview KAK Anda dan meminta beberapa perbaikan.<br><br><strong>Catatan:</strong> '.($catatan ?? '-'),
                    'color' => '#ffc107',
                ],
            ];

            if (isset($config[$type])) {
                $c = $config[$type];
                $data = [
                    'subject' => $c['subject'],
                    'title' => $c['title'],
                    'recipient_name' => $pengusul->nama_lengkap,
                    'body' => $c['body'],
                    'details' => [
                        'Nama Kegiatan' => $kak->nama_kegiatan,
                    ],
                    'action_link' => config('app.url')."/kak/{$kak->kak_id}",
                    'action_text' => 'Lihat KAK',
                    'status_color' => $c['color'],
                ];

                Mail::to($pengusul->email)->send(new KAKWorkflowMail($data));
            }
        }
    }
}

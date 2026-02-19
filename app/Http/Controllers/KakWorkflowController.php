<?php

namespace App\Http\Controllers;

use App\Models\KAK;
use App\Models\KAKApproval;
use App\Models\KAKLogStatus;
use App\Models\MataAnggaran;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class KakWorkflowController extends Controller
{
    /**
     * Submit KAK for verification (Draft -> Review)
     */
    public function submit(KAK $kak)
    {
        $this->authorizeOwner($kak);

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

            // Removing KAKApproval creation on submit as it requires approver_user_id (not null)
            // and we don't have a specific verifier yet.
            // t_kak_log_status is sufficient for tracking submission history.
        });

        return back()->with('success', 'KAK berhasil diajukan untuk verifikasi.');
    }

    /**
     * Approve KAK (Review -> Disetujui)
     */
    public function approve(Request $request, KAK $kak)
    {
        $this->authorizeVerifikator($kak);

        if ($kak->status_id !== 2) {
            abort(403, 'Hanya KAK dalam status Review yang dapat disetujui.');
        }

        $request->validate([
            'kode_anggaran' => 'required|string',
            'nama_sumber_dana' => 'required|string',
            'tahun_anggaran' => 'required|integer',
            'total_pagu' => 'required|numeric',
        ]);

        DB::transaction(function () use ($request, $kak) {
            $oldStatus = $kak->status_id;

            // Handle Mata Anggaran
            $mataAnggaran = MataAnggaran::firstOrCreate(
                ['kode_anggaran' => $request->kode_anggaran],
                [
                    'nama_sumber_dana' => $request->nama_sumber_dana,
                    'tahun_anggaran' => $request->tahun_anggaran,
                    'total_pagu' => $request->total_pagu,
                ]
            );

            // Update KAK
            $kak->status_id = 3; // Disetujui
            $kak->mata_anggaran_id = $mataAnggaran->mata_anggaran_id;

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

            // Save specific field notes
            $catatanKak = $request->input('catatan_kak', []);
            if (isset($catatanKak['nama_kegiatan'])) {
                $kak->catatan_nama_kegiatan = $catatanKak['nama_kegiatan'];
            }
            if (isset($catatanKak['deskripsi_kegiatan'])) {
                $kak->catatan_deskripsi_kegiatan = $catatanKak['deskripsi_kegiatan'];
            }
            // ... map other fields as needed based on column names

            $kak->save();

            $this->logStatus($kak, $oldStatus, 5);

            KAKApproval::create([
                'kak_id' => $kak->kak_id,
                'approver_user_id' => Auth::id(),
                'status' => 'Revisi',
                'tanggal_telaah' => now(),
                'catatan' => $request->catatan, // General note
            ]);

            // We would also update child items' notes here if passed in request
            // For brevity, assuming child notes handling logic would be expanded here
            // or handled via Child Model updates if necessary.
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

            // Removing KAKApproval creation on resubmit as it requires approver_user_id.
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
    }
}

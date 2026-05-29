<?php

namespace App\Http\Controllers;

use App\Exceptions\KakWorkflowException;
use App\Http\Requests\KakWorkflow\ApproveKakRequest;
use App\Http\Requests\KakWorkflow\RejectKakRequest;
use App\Http\Requests\KakWorkflow\ReviseKakRequest;
use App\Models\KAK;
use App\Models\KAKApproval;
use App\Models\KAKLogStatus;
use App\Traits\AuthorizesKakAccess;
use App\Services\KakWorkflowService;
use App\Models\MataAnggaran;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class KakWorkflowController extends Controller
{
    use AuthorizesKakAccess;
    
    protected KakWorkflowService $kakWorkflowService;

    public function __construct(KakWorkflowService $kakWorkflowService)
    {
        $this->kakWorkflowService = $kakWorkflowService;
    }


    /**
     * Submit KAK for verification (Draft -> Review)
     */
    public function submit(KAK $kak)
    {
        $this->authorizeAccess($kak, false, true); // workflow action

        if (! in_array($kak->status_id, [1, 5])) {
            abort(403, 'Anda hanya dapat mengajukan KAK dengan status Draft atau Revisi.');
        }

        try {
            $this->kakWorkflowService->submit($kak, Auth::user());
            return back()->with('success', 'KAK berhasil diajukan untuk verifikasi.');
        } catch (KakWorkflowException $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Approve KAK (Review -> Disetujui)
     */
    public function approve(ApproveKakRequest $request, KAK $kak)
    {
        $this->authorizeAccess($kak, false, true);

        if ($kak->status_id !== 2) {
            abort(403, 'Hanya KAK dalam status Review yang dapat disetujui.');
        }

        try {
            $this->kakWorkflowService->approve($kak, $request->validated(), Auth::user());
            return back()->with('success', 'KAK berhasil disetujui.');
        } catch (KakWorkflowException $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Reject KAK (Review -> Ditolak)
     */
    public function reject(RejectKakRequest $request, KAK $kak)
    {
        $this->authorizeVerifikator($kak);

        if ($kak->status_id !== 2) {
            abort(403, 'Hanya KAK dalam status Review yang dapat ditolak.');
        }

        try {
            $this->kakWorkflowService->reject($kak, $request->validated('catatan'), Auth::user());
            return back()->with('success', 'KAK telah ditolak.');
        } catch (KakWorkflowException $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Request Revision (Review -> Revisi)
     */
    public function revise(ReviseKakRequest $request, KAK $kak)
    {
        $this->authorizeVerifikator($kak);

        if ($kak->status_id !== 2) {
            abort(403, 'Hanya KAK dalam status Review yang dapat diminta revisi.');
        }

        try {
            $this->kakWorkflowService->revise($kak, $request->validated(), Auth::user());
            return back()->with('success', 'Permintaan revisi dikirim.');
        } catch (KakWorkflowException $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
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

        try {
            $this->kakWorkflowService->submit($kak, Auth::user());
            return back()->with('success', 'KAK berhasil diajukan kembali.');
        } catch (KakWorkflowException $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /* Helpers */

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
}

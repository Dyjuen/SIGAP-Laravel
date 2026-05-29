<?php

namespace App\Traits;

use App\Models\KAK;
use Illuminate\Support\Facades\Auth;

trait AuthorizesKakAccess
{
    /**
     * Authorize access to a KAK resource.
     *
     * @param  KAK|null  $kak  The KAK instance (null for global/create checks)
     * @param  bool  $requireEdit  Whether the action requires edit/write permissions (Pengusul only)
     * @param  bool  $isWorkflowAction  Whether the action is a workflow step (additional checks)
     */
    protected function authorizeAccess(?KAK $kak = null, bool $requireEdit = false, bool $isWorkflowAction = false)
    {
        $user = Auth::user();

        // 1. Admin (Role 1) - Bypass
        if ($user->role_id === 1) {
            return;
        }

        // 2. Pengusul (Role 3)
        if ($user->role_id === 3) {
            // Check ownership first
            if ($kak && $kak->pengusul_user_id !== $user->user_id) {
                abort(403, 'Anda tidak memiliki akses ke KAK ini.');
            }

            // If it's a workflow action, Pengusul can ONLY submit or resubmit
            // (Status check is handled in controller, but here we check if they are even allowed to touch workflow)
            if ($isWorkflowAction && $kak) {
                // Determine if this is a "submit-like" action or "review-like" action
                // In our current routes: submit and resubmit are for Pengusul.
                // approve, reject, revise are for Verifikator.
                // We can't easily know which one it is just from $isWorkflowAction.

                // Let's use request name or a new parameter?
                // Better: If they are Role 3, they are only allowed if the KAK is in Draft (1) or Revisi (5) status.
                // But Verifikator actions happen in Review (2) status.
                if ($kak->status_id === 2) {
                    abort(403, 'Pengusul tidak dapat menyetujui, menolak, atau meminta revisi KAK.');
                }
            }

            return;
        }

        // 3. Verifikator (Role 2)
        if ($user->role_id === 2) {
            if ($kak) {
                // Check Tipe Kegiatan matching
                if (preg_match('/verifikator(\d+)/', $user->username, $matches)) {
                    $allowedTipeId = (int) $matches[1];
                    if ($kak->tipe_kegiatan_id !== $allowedTipeId) {
                        abort(403, 'Anda hanya dapat mengakses KAK dengan Tipe Kegiatan '.$allowedTipeId);
                    }
                } else {
                    abort(403, 'Username verifikator tidak valid untuk pemetaan tipe kegiatan.');
                }

                // Workflow specific: Verifikator cannot verify own KAK
                if ($isWorkflowAction && $kak->pengusul_user_id === $user->user_id) {
                    abort(403, 'Verifikator tidak dapat memverifikasi KAK sendiri.');
                }
            }

            // Verifikator cannot edit KAK (only add notes/metadata during approval)
            if ($requireEdit) {
                abort(403, 'Hanya Pengusul yang dapat mengubah data KAK.');
            }

            return;
        }

        // If requiring edit permission or creating (kak=null), only Pengusul/Admin can pass
        if ($requireEdit || $kak === null) {
            $message = ($kak === null)
                ? 'Hanya Pengusul yang dapat membuat KAK.'
                : 'Hanya Pengusul yang dapat mengubah data KAK.';
            abort(403, $message);
        }

        // Others (PPK, Bendahara, etc) - Read only access allowed by default unless workflow/edit
        if ($isWorkflowAction) {
            abort(403, 'Anda tidak memiliki wewenang untuk melakukan aksi workflow ini.');
        }
    }

    /**
     * Apply role-based filters to a KAK query.
     */
    protected function applyAccessFilter($query)
    {
        $user = Auth::user();

        // Admin (Role 1): See all
        if ($user->role_id === 1) {
            return $query;
        }

        // Pengusul (Role 3): Only own KAKs
        if ($user->role_id === 3) {
            return $query->where('pengusul_user_id', $user->user_id);
        }

        // Verifikator (Role 2): Filter by status and tipe_kegiatan
        if ($user->role_id === 2) {
            $query->where('status_id', 2); // Review status

            if (preg_match('/verifikator(\d+)/', $user->username, $matches)) {
                $allowedTipeId = (int) $matches[1];

                return $query->where('tipe_kegiatan_id', $allowedTipeId);
            }

            return $query->whereRaw('1 = 0'); // Block if username invalid
        }

        // Others (Bendahara, PPK, Rektorat): See all? (adjust if needed)
        return $query;
    }
}

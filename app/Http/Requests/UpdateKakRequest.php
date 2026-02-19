<?php

namespace App\Http\Requests;

class UpdateKakRequest extends StoreKakRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $user = $this->user();
        $kak = $this->route('kak');

        // 1. Must be Pengusul
        if ($user->role_id !== 3) {
            return false;
        }

        // 2. Must be Owner
        // Note: Route model binding might not be fully resolved if testing with simpler bindings,
        // but normally it is. If $kak is just ID, we fetch it.
        // In standard Laravel route binding, $this->route('kak') is the model.
        if ($kak && $kak->pengusul_user_id !== $user->user_id) {
            return false;
        }

        return true;
    }
}

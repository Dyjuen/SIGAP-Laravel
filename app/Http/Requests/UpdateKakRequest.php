<?php

namespace App\Http\Requests;

use App\Models\KAK;

class UpdateKakRequest extends StoreKakRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $user = $this->user();
        $kak = $this->route('kak') ?? $this->route('id');

        if (is_scalar($kak)) {
            $kak = KAK::find($kak);
        }

        // 1. Must be Pengusul
        if ($user->role_id !== 3) {
            return false;
        }

        // 2. Must be Owner
        if ($kak && $kak->pengusul_user_id !== $user->user_id) {
            return false;
        }

        return true;
    }
}

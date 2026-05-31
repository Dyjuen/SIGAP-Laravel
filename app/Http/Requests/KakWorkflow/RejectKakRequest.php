<?php

namespace App\Http\Requests\KakWorkflow;

use App\Models\KAK;
use Illuminate\Foundation\Http\FormRequest;

class RejectKakRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();
        if ($user->role_id !== 2) {
            return false;
        }

        $kak = $this->route('kak');
        if (is_scalar($kak)) {
            $kak = KAK::find($kak);
        }

        if ($kak) {
            if (preg_match('/verifikator(\d+)/', $user->username, $matches)) {
                $allowedTipeId = (int) $matches[1];
                if ($kak->tipe_kegiatan_id !== $allowedTipeId) {
                    return false;
                }
            } else {
                return false;
            }

            if ($kak->pengusul_user_id === $user->user_id) {
                return false;
            }
        }

        return true;
    }

    public function rules(): array
    {
        return [
            'catatan' => 'required|string|min:5',
        ];
    }

    public function messages(): array
    {
        return [
            'required' => ':attribute wajib diisi.',
            'string' => ':attribute harus berupa teks.',
            'min' => ':attribute minimal :min karakter.',
        ];
    }

    public function attributes(): array
    {
        return [
            'catatan' => 'Catatan penolakan',
        ];
    }
}

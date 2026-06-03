<?php

namespace App\Http\Requests\KakWorkflow;

use App\Models\KAK;
use Illuminate\Foundation\Http\FormRequest;

class ReviseKakRequest extends FormRequest
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
            'catatan' => 'required_without_all:catatan_kak,anak|nullable|string',
            'catatan_kak' => 'required_without_all:catatan,anak|nullable|array',
            'anak' => 'required_without_all:catatan,catatan_kak|nullable|array',
        ];
    }

    public function messages(): array
    {
        return [
            'string' => ':attribute harus berupa teks.',
            'array' => ':attribute harus berupa array.',
            'required_without_all' => 'Anda harus memberikan minimal satu catatan revisi.',
        ];
    }

    public function attributes(): array
    {
        return [
            'catatan' => 'Catatan revisi',
            'catatan_kak' => 'Catatan KAK',
            'anak' => 'Catatan item anak',
        ];
    }
}

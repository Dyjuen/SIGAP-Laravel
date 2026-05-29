<?php

namespace App\Http\Requests\KakWorkflow;

use Illuminate\Foundation\Http\FormRequest;

class ApproveKakRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();
        if ($user->role_id !== 2) {
            return false;
        }

        $kak = $this->route('kak');
        if (is_scalar($kak)) {
            $kak = \App\Models\KAK::find($kak);
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
            'mata_anggaran_id' => 'nullable|exists:m_mata_anggaran,mata_anggaran_id',
            'kode_anggaran' => 'required_without:mata_anggaran_id|string|nullable|max:50',
            'nama_sumber_dana' => 'required_without:mata_anggaran_id|string|nullable|max:255',
            'tahun_anggaran' => 'required_without:mata_anggaran_id|integer|nullable|digits:4',
            'total_pagu' => 'required_without:mata_anggaran_id|numeric|nullable|min:0',
        ];
    }

    public function messages(): array
    {
        return [
            'required_without' => ':attribute wajib diisi jika mata anggaran tidak dipilih.',
            'exists' => 'Mata anggaran yang dipilih tidak valid.',
            'string' => ':attribute harus berupa teks.',
            'integer' => ':attribute harus berupa angka bulat.',
            'digits' => ':attribute harus berupa :digits digit.',
            'numeric' => ':attribute harus berupa angka.',
            'min' => ':attribute minimal :min.',
        ];
    }

    public function attributes(): array
    {
        return [
            'mata_anggaran_id' => 'Mata Anggaran',
            'kode_anggaran' => 'Kode Anggaran',
            'nama_sumber_dana' => 'Nama Sumber Dana',
            'tahun_anggaran' => 'Tahun Anggaran',
            'total_pagu' => 'Total Pagu',
        ];
    }
}

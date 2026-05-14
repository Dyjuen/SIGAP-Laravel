<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreLampiranRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $user = $this->user();

        // Handle both /lampiran/anggaran/{anggaran} and /lampiran/{lampiran}/resubmit
        $anggaran = $this->route('anggaran');
        if (! $anggaran && $lampiran = $this->route('lampiran')) {
            $anggaran = $lampiran->anggaran;
        }

        if (! $anggaran) {
            return false;
        }

        // Admin and Bendahara can do anything
        if (in_array($user->getRoleName(), ['Admin', 'Bendahara'])) {
            return true;
        }

        // Only Pengusul role can upload their own lampiran
        if ($user->getRoleName() !== 'Pengusul') {
            return false;
        }

        // Check ownership via KAK
        return $anggaran->kak->pengusul_user_id === $user->user_id;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'file' => [
                'required',
                'file',
                'max:10240', // 10MB
                'mimes:jpg,jpeg,png,pdf',
            ],
            'catatan' => ['nullable', 'string', 'max:500'],
        ];
    }

    /**
     * Custom messages in Bahasa Indonesia.
     */
    public function messages(): array
    {
        return [
            'required' => ':attribute wajib diisi.',
            'file' => ':attribute harus berupa file.',
            'max' => 'Ukuran :attribute maksimal adalah :max KB.',
            'mimes' => 'Format :attribute tidak didukung. Gunakan file :values.',
            'string' => ':attribute harus berupa teks.',
        ];
    }

    /**
     * Custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'file' => 'File lampiran',
            'catatan' => 'Catatan',
        ];
    }
}

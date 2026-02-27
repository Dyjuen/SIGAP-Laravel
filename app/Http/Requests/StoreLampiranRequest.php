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
                'mimes:pdf,jpg,jpeg,png,doc,docx,xls,xlsx,zip',
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
            'file.required' => 'File lampiran wajib diunggah.',
            'file.file' => 'Input harus berupa file.',
            'file.max' => 'Ukuran file maksimal adalah 10 MB.',
            'file.mimes' => 'Format file tidak didukung. Gunakan PDF, Gambar, Document, atau ZIP.',
            'catatan.max' => 'Catatan maksimal 500 karakter.',
        ];
    }
}

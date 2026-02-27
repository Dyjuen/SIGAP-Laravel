<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ResubmitLpjRequest extends FormRequest
{
    /**
     * Only the KAK's pengusul can resubmit an LPJ.
     */
    public function authorize(): bool
    {
        $kegiatan = $this->route('kegiatan');
        $kak = $kegiatan->kak;

        return $kak && $kak->pengusul_user_id === $this->user()->user_id;
    }

    public function rules(): array
    {
        return [
            'realisasi' => ['nullable', 'array'],
            'realisasi.*' => ['array'],
            'files_to_delete' => ['nullable', 'array'],
            'files_to_delete.*' => ['integer'],
            'bukti' => ['nullable', 'array'],
            'bukti.*.*' => ['file', 'max:10240', 'mimes:pdf,doc,docx,jpg,jpeg,png,xls,xlsx'],
        ];
    }

    public function messages(): array
    {
        return [
            'bukti.*.*.max' => 'Ukuran file maksimal 10 MB.',
            'bukti.*.*.mimes' => 'Format file harus: pdf, doc, docx, jpg, jpeg, png, xls, xlsx.',
        ];
    }
}

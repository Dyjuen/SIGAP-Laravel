<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SubmitLpjRequest extends FormRequest
{
    /**
     * Only the KAK's pengusul can submit an LPJ.
     */
    public function authorize(): bool
    {
        $kegiatan = $this->route('kegiatan');
        $kak = $kegiatan->kak;

        return $kak && $kak->pengusul_user_id === $this->user()->user_id;
    }

    /**
     * Realisasi data keyed by anggaran_id.
     */
    public function rules(): array
    {
        return [
            'realisasi' => ['required', 'array', 'min:1'],
            'realisasi.*.volume1' => ['nullable', 'numeric'],
            'realisasi.*.satuan1_id' => ['nullable', 'integer'],
            'realisasi.*.volume2' => ['nullable', 'numeric'],
            'realisasi.*.satuan2_id' => ['nullable', 'integer'],
            'realisasi.*.volume3' => ['nullable', 'numeric'],
            'realisasi.*.satuan3_id' => ['nullable', 'integer'],
            'realisasi.*.harga_satuan' => ['nullable', 'numeric'],
            'bukti' => ['nullable', 'array'],
            'bukti.*.*' => ['file', 'max:10240', 'mimes:pdf,doc,docx,jpg,jpeg,png,xls,xlsx'],
        ];
    }

    public function messages(): array
    {
        return [
            'realisasi.required' => 'Data realisasi tidak boleh kosong.',
            'realisasi.min' => 'Data realisasi tidak boleh kosong.',
            'bukti.*.*.max' => 'Ukuran file maksimal 10 MB.',
            'bukti.*.*.mimes' => 'Format file harus: pdf, doc, docx, jpg, jpeg, png, xls, xlsx.',
        ];
    }
}

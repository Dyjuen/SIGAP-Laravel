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
            'realisasi.*.volume1' => ['required', 'numeric', 'min:0'],
            'realisasi.*.satuan1_id' => ['required', 'integer', 'exists:m_satuan,satuan_id'],
            'realisasi.*.volume2' => ['nullable', 'numeric', 'min:0'],
            'realisasi.*.satuan2_id' => ['nullable', 'integer', 'exists:m_satuan,satuan_id'],
            'realisasi.*.volume3' => ['nullable', 'numeric', 'min:0'],
            'realisasi.*.satuan3_id' => ['nullable', 'integer', 'exists:m_satuan,satuan_id'],
            'realisasi.*.harga_satuan' => ['required', 'numeric', 'min:0'],
            'files_to_delete' => ['nullable', 'array'],
            'files_to_delete.*' => ['integer', 'exists:t_kegiatan_lampiran,lampiran_id'],
            'bukti' => ['nullable', 'array'],
            'bukti.*' => ['nullable', 'array'],
            'bukti.*.*' => ['file', 'max:10240', 'mimes:jpg,jpeg,png,pdf'],
            'spk_kesesuaian_waktu' => ['required', 'integer', 'between:50,100'],
            'spk_kesesuaian_output' => ['required', 'integer', 'in:0,100'],
        ];
    }

    public function messages(): array
    {
        return [
            'required' => ':attribute wajib diisi.',
            'numeric' => ':attribute harus berupa angka.',
            'min' => ':attribute minimal :min.',
            'exists' => ':attribute tidak valid.',
            'file' => ':attribute harus berupa file.',
            'mimes' => ':attribute harus berupa file dengan format: :values.',
            'max' => ':attribute maksimal :max KB.',
            'between' => ':attribute harus bernilai antara :min dan :max.',
            'in' => ':attribute harus bernilai :values.',
        ];
    }

    public function attributes(): array
    {
        return [
            'realisasi.*.volume1' => 'Volume 1',
            'realisasi.*.satuan1_id' => 'Satuan 1',
            'realisasi.*.harga_satuan' => 'Harga Satuan',
            'bukti.*.*' => 'Bukti Dokumen',
            'spk_kesesuaian_waktu' => 'Kesesuaian Waktu',
            'spk_kesesuaian_output' => 'Kesesuaian Output (IKU)',
        ];
    }
}

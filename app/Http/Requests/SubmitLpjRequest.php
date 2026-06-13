<?php

namespace App\Http\Requests;

use App\Models\SpkConfig;
use App\Traits\NormalizesLpjPayload;
use Illuminate\Foundation\Http\FormRequest;

class SubmitLpjRequest extends FormRequest
{
    use NormalizesLpjPayload;

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
     * Prepare the data for validation.
     * Converts sequential array of budget items (mobile payload) into associative
     * array format keyed by anggaran_id (web/backend format), and links flat
     * upload files to the first budget item's index.
     */
    protected function prepareForValidation(): void
    {
        $this->normalizeLpjPayload();
    }

    /**
     * Realisasi data keyed by anggaran_id.
     */
    public function rules(): array
    {
        $config = SpkConfig::getActive();

        return [
            'realisasi' => ['required', 'array', 'min:1'],
            'realisasi.*.volume1' => ['required', 'numeric', 'min:0'],
            'realisasi.*.satuan1_id' => ['required', 'integer', 'exists:m_satuan,satuan_id'],
            'realisasi.*.volume2' => ['nullable', 'numeric', 'min:0'],
            'realisasi.*.satuan2_id' => ['nullable', 'integer', 'exists:m_satuan,satuan_id'],
            'realisasi.*.volume3' => ['nullable', 'numeric', 'min:0'],
            'realisasi.*.satuan3_id' => ['nullable', 'integer', 'exists:m_satuan,satuan_id'],
            'realisasi.*.harga_satuan' => ['required', 'numeric', 'min:0'],
            'bukti' => ['nullable', 'array'],
            'bukti.*' => ['nullable', 'array'],
            'bukti.*.*' => ['file', 'max:10240', 'mimes:jpg,jpeg,png,pdf'],
            'realisasi_tgl_mulai' => ['required', 'date'],
            'realisasi_tgl_selesai' => ['required', 'date', 'after_or_equal:realisasi_tgl_mulai'],
            'ikuScores' => ['required', 'array', 'min:1'],
            'ikuScores.*.kak_id' => ['required', 'integer', 'exists:t_kak_iku,kak_id'],
            'ikuScores.*.iku_id' => ['required', 'integer', 'exists:t_kak_iku,iku_id'],
            'ikuScores.*.score' => ['required', 'integer', 'in:0,100'],
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
            'realisasi.required' => 'Data realisasi tidak boleh kosong.',
            'realisasi.min' => 'Data realisasi tidak boleh kosong.',
            'between' => ':attribute harus bernilai antara :min dan :max.',
            'in' => ':attribute harus bernilai :values.',
            'after_or_equal' => ':attribute harus sama dengan atau setelah :date.',
            'ikuScores.required' => 'Penilaian kesesuaian IKU wajib diisi.',
            'ikuScores.min' => 'Penilaian kesesuaian IKU tidak boleh kosong.',
            'ikuScores.*.kak_id.required' => 'ID KAK wajib diisi.',
            'ikuScores.*.kak_id.integer' => 'ID KAK harus berupa angka.',
            'ikuScores.*.kak_id.exists' => 'ID KAK tidak valid.',
            'ikuScores.*.iku_id.required' => 'ID IKU wajib diisi.',
            'ikuScores.*.iku_id.integer' => 'ID IKU harus berupa angka.',
            'ikuScores.*.iku_id.exists' => 'ID IKU tidak valid.',
            'ikuScores.*.score.required' => 'Skor kesesuaian IKU wajib diisi.',
            'ikuScores.*.score.integer' => 'Skor kesesuaian IKU harus berupa angka.',
            'ikuScores.*.score.in' => 'Skor kesesuaian IKU harus 0 atau 100.',
        ];
    }

    public function attributes(): array
    {
        return [
            'realisasi.*.volume1' => 'Volume 1',
            'realisasi.*.satuan1_id' => 'Satuan 1',
            'realisasi.*.volume2' => 'Volume 2',
            'realisasi.*.satuan2_id' => 'Satuan 2',
            'realisasi.*.volume3' => 'Volume 3',
            'realisasi.*.satuan3_id' => 'Satuan 3',
            'realisasi.*.harga_satuan' => 'Harga Satuan',
            'bukti.*.*' => 'Bukti Dokumen',
            'realisasi_tgl_mulai' => 'Tanggal Mulai Realisasi',
            'realisasi_tgl_selesai' => 'Tanggal Selesai Realisasi',
            'ikuScores' => 'Penilaian Kesesuaian IKU',
            'ikuScores.*.kak_id' => 'ID KAK',
            'ikuScores.*.iku_id' => 'ID IKU',
            'ikuScores.*.score' => 'Skor Kesesuaian IKU',
        ];
    }
}

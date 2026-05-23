<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreKakRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Only Pengusul (Role 3) can create KAK
        return $this->user()->role_id === 3;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            // Main KAK Data
            'kak.nama_kegiatan' => 'required|string|min:5|max:255',
            'kak.deskripsi_kegiatan' => 'required|string|min:5',
            'kak.metode_pelaksanaan' => 'required|string|min:5',
            'kak.kurun_waktu_pelaksanaan' => 'required|string',
            'kak.tanggal_mulai' => 'required|date',
            'kak.tanggal_selesai' => 'required|date|after_or_equal:kak.tanggal_mulai',
            'kak.lokasi' => 'required|string|max:255',
            'kak.tipe_kegiatan_id' => 'required|exists:m_tipe_kegiatan,tipe_kegiatan_id',
            'kak.sasaran_utama' => 'required|string|max:255',

            // Child: Manfaat
            'kak.manfaat' => 'required|array|min:1',
            'kak.manfaat.*.manfaat_id' => 'nullable|integer',
            'kak.manfaat.*.value' => 'required|string|max:255',

            // Child: Tahapan Pelaksanaan
            'kak.tahapan_pelaksanaan' => 'required|array|min:1',
            'kak.tahapan_pelaksanaan.*.tahapan_id' => 'nullable|integer',
            'kak.tahapan_pelaksanaan.*.nama_tahapan' => 'required|string|max:255',
            'kak.tahapan_pelaksanaan.*.urutan' => 'required|integer',

            // Child: Indikator Kinerja
            'kak.indikator_kinerja' => 'present|array',
            'kak.indikator_kinerja.*.target_id' => 'nullable|integer',
            'kak.indikator_kinerja.*.bulan_indikator' => 'required|string',
            'kak.indikator_kinerja.*.deskripsi_target' => 'required|string|max:255',
            'kak.indikator_kinerja.*.persentase_target' => 'required|numeric|min:0|max:100',

            // Child: Target IKU
            'target_iku' => 'present|array',
            'target_iku.*.iku_id' => 'required|exists:m_iku,iku_id',
            'target_iku.*.target' => 'required|max:255',
            'target_iku.*.satuan_id' => 'required|exists:m_satuan,satuan_id',

            // Child: RAB
            'rab' => 'present|array',
            'rab.*.anggaran_id' => 'nullable|integer',
            'rab.*.uraian' => 'required|string|max:255',
            'rab.*.volume1' => 'required|numeric|min:0',
            'rab.*.satuan1_id' => 'required|exists:m_satuan,satuan_id',
            'rab.*.harga_satuan' => 'required|numeric|min:0',
            'rab.*.kategori_belanja_id' => 'required|exists:m_kategori_belanja,kategori_belanja_id',
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'required' => ':attribute wajib diisi.',
            'string' => ':attribute harus berupa teks.',
            'array' => ':attribute harus berupa array.',
            'numeric' => ':attribute harus berupa angka.',
            'integer' => ':attribute harus berupa angka bulat.',
            'min' => ':attribute minimal :min.',
            'max' => ':attribute maksimal :max.',
            'after_or_equal' => ':attribute harus setelah atau sama dengan :date.',
            'exists' => ':attribute yang dipilih tidak valid.',
            'date' => ':attribute harus berupa format tanggal yang valid.',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     *
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'kak.nama_kegiatan' => 'Nama kegiatan',
            'kak.deskripsi_kegiatan' => 'Deskripsi kegiatan',
            'kak.metode_pelaksanaan' => 'Metode pelaksanaan',
            'kak.kurun_waktu_pelaksanaan' => 'Kurun waktu pelaksanaan',
            'kak.tanggal_mulai' => 'Tanggal mulai',
            'kak.tanggal_selesai' => 'Tanggal selesai',
            'kak.lokasi' => 'Lokasi',
            'kak.tipe_kegiatan_id' => 'Tipe kegiatan',
            'kak.manfaat' => 'Manfaat',
            'kak.tahapan_pelaksanaan' => 'Tahapan pelaksanaan',
            'kak.indikator_kinerja' => 'Indikator kinerja',
            'target_iku' => 'Target IKU',
            'rab' => 'RAB',
            'rab.*.uraian' => 'Uraian RAB pada baris ke-:position',
            'rab.*.volume1' => 'Volume 1 pada baris ke-:position',
            'rab.*.satuan1_id' => 'Satuan 1 pada baris ke-:position',
            'rab.*.harga_satuan' => 'Harga Satuan pada baris ke-:position',
            'rab.*.kategori_belanja_id' => 'Kategori Belanja pada baris ke-:position',
        ];
    }
}

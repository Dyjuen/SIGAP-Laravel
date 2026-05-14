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
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            // Main KAK Data
            'kak.nama_kegiatan' => 'required',
            'kak.deskripsi_kegiatan' => 'required',
            'kak.metode_pelaksanaan' => 'required',
            'kak.kurun_waktu_pelaksanaan' => 'required',
            'kak.tanggal_mulai' => 'required',
            'kak.tanggal_selesai' => 'required|after_or_equal:kak.tanggal_mulai',
            'kak.lokasi' => 'required',
            'kak.tipe_kegiatan_id' => 'required',

            // Child: Penerima Manfaat
            'kak.penerima_manfaat' => 'required|array',
            'kak.penerima_manfaat.*.sasaran_utama' => 'required',
            'kak.penerima_manfaat.*.manfaat' => 'required',

            // Child: Tahapan Pelaksanaan
            'kak.tahapan_pelaksanaan' => 'required|array',
            'kak.tahapan_pelaksanaan.*.nama_tahapan' => 'required',
            'kak.tahapan_pelaksanaan.*.urutan' => 'required',

            // Child: Indikator Kinerja
            'kak.indikator_kinerja' => 'required|array',
            'kak.indikator_kinerja.*.bulan_indikator' => 'required',
            'kak.indikator_kinerja.*.deskripsi_target' => 'required',
            'kak.indikator_kinerja.*.persentase_target' => 'required',

            // Child: Target IKU
            'target_iku' => 'required|array',
            'target_iku.*.iku_id' => 'required',
            'target_iku.*.target' => 'required',
            'target_iku.*.satuan_id' => 'required',

            // Child: RAB
            'rab' => 'required|array',
            'rab.*.uraian' => 'required',
            'rab.*.volume1' => 'required|numeric|min:0',
            'rab.*.satuan1_id' => 'required',
            'rab.*.harga_satuan' => 'required|numeric|min:0',
            'rab.*.kategori_belanja_id' => 'required',
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
            'array' => ':attribute harus berupa array.',
            'numeric' => ':attribute harus berupa angka.',
            'min' => ':attribute minimal :min.',
            'after_or_equal' => ':attribute harus setelah atau sama dengan :date.',
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
            'kak.penerima_manfaat' => 'Penerima manfaat',
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

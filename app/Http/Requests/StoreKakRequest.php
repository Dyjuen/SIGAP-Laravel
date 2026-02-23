<?php

namespace App\Http\Requests;

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
            'kak.nama_kegiatan' => 'required|string|max:200',
            'kak.deskripsi_kegiatan' => 'required|string',
            'kak.metode_pelaksanaan' => 'required|string',
            'kak.tanggal_mulai' => 'required|date',
            'kak.tanggal_selesai' => 'required|date|after_or_equal:kak.tanggal_mulai',
            'kak.lokasi' => 'required|string|max:200',
            'kak.tipe_kegiatan_id' => 'required|exists:m_tipe_kegiatan,tipe_kegiatan_id',
            'kak.sasaran_utama' => 'nullable|string',

            // Child: Manfaat (Array of objects)
            'kak.manfaat' => 'present|array',
            'kak.manfaat.*.manfaat' => 'required|string',
            'kak.manfaat.*.manfaat_id' => 'nullable|integer',

            // Child: Tahapan Pelaksanaan
            'kak.tahapan_pelaksanaan' => 'present|array',
            'kak.tahapan_pelaksanaan.*.nama_tahapan' => 'required|string',
            'kak.tahapan_pelaksanaan.*.tahapan_id' => 'nullable|integer',

            // Child: Indikator Kinerja (Mapped to t_kak_target)
            // Legacy mapping: bulan_indikator (select), deskripsi_target (text), persentase_target (number)
            'kak.indikator_kinerja' => 'present|array',
            'kak.indikator_kinerja.*.target_id' => 'nullable|integer',
            'kak.indikator_kinerja.*.bulan_indikator' => 'nullable|string|max:20',
            'kak.indikator_kinerja.*.deskripsi_target' => 'required|string',
            'kak.indikator_kinerja.*.persentase_target' => 'nullable|numeric|min:0|max:100',

            // Child: Target IKU (Mapped to t_kak_iku)
            'target_iku' => 'present|array',
            'target_iku.*.kak_iku_id' => 'nullable|integer',
            'target_iku.*.iku_id' => 'required|exists:m_iku,iku_id',
            'target_iku.*.target' => 'required|numeric|min:0',
            'target_iku.*.satuan_id' => 'required|exists:m_satuan,satuan_id',

            // Child: RAB (Mapped to t_kak_anggaran)
            'rab' => 'present|array',
            'rab.*.anggaran_id' => 'nullable|integer',
            'rab.*.kategori_belanja_id' => 'required|exists:m_kategori_belanja,kategori_belanja_id',
            'rab.*.uraian' => 'required|string|max:255',
            'rab.*.volume1' => 'required|numeric|min:0',
            'rab.*.satuan1_id' => 'required|exists:m_satuan,satuan_id',
            'rab.*.volume2' => 'nullable|numeric|min:0',
            'rab.*.satuan2_id' => 'nullable|exists:m_satuan,satuan_id',
            'rab.*.volume3' => 'nullable|numeric|min:0',
            'rab.*.satuan3_id' => 'nullable|exists:m_satuan,satuan_id',
            'rab.*.harga_satuan' => 'required|numeric|min:0',
        ];
    }
}

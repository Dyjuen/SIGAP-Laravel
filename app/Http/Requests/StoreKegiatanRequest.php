<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreKegiatanRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Must be pengusul
        return $this->user() && $this->user()->getRoleName() === 'Pengusul';
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        if ($this->isMethod('post')) {
            return [
                'kak_id' => 'required|exists:t_kak,kak_id',
                'penanggung_jawab_manual' => 'required|string|max:255',
                'pelaksana_manual' => 'required|string|max:255',
                'surat_pengantar' => 'required|file|mimes:pdf,doc,docx|max:5120',
            ];
        }

        // Update (PUT/PATCH) rules based on legacy KegiatanValidator
        return [
            'nama_kegiatan' => 'required|string|min:10|max:200',
            'deskripsi_kegiatan' => 'required|string|min:50',
            'tanggal_mulai' => 'required|date|after_or_equal:today',
            'tanggal_selesai' => [
                'required',
                'date',
                'after:tanggal_mulai',
                function ($attribute, $value, $fail) {
                    $start = \Illuminate\Support\Carbon::parse($this->tanggal_mulai);
                    $end = \Illuminate\Support\Carbon::parse($value);
                    if ($start->diffInDays($end) > 365) {
                        $fail('Durasi kegiatan maksimal 365 hari (1 tahun).');
                    }
                },
            ],
            'lokasi' => 'required|string|min:5|max:200',
            'mata_anggaran_id' => 'required|integer|exists:m_mata_anggaran,mata_anggaran_id',
        ];
    }

    /**
     * Get the error messages for the defined validation rules.
     *
     * @return array
     */
    public function messages(): array
    {
        return [
            'tanggal_mulai.after_or_equal' => 'Tanggal mulai tidak boleh kurang dari hari ini.',
            'tanggal_selesai.after' => 'Tanggal selesai harus setelah tanggal mulai.',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     *
     * @return array
     */
    public function attributes(): array
    {
        return [
            'kak_id' => 'KAK',
            'penanggung_jawab_manual' => 'Penanggung Jawab',
            'pelaksana_manual' => 'Pelaksana',
            'surat_pengantar' => 'Surat Pengantar',
            'nama_kegiatan' => 'Nama Kegiatan',
            'deskripsi_kegiatan' => 'Deskripsi Kegiatan',
            'tanggal_mulai' => 'Tanggal Mulai',
            'tanggal_selesai' => 'Tanggal Selesai',
            'lokasi' => 'Lokasi',
            'mata_anggaran_id' => 'Mata Anggaran',
        ];
    }
}

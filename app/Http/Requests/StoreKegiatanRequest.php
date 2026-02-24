<?php

namespace App\Http\Requests;

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
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'kak_id' => 'required|exists:t_kak,kak_id',
            'penanggung_jawab_manual' => 'required|string|max:255',
            'pelaksana_manual' => 'required|string|max:255',
            'surat_pengantar' => 'required|file|mimes:pdf,doc,docx|max:5120',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     *
     * @return array
     */
    public function attributes()
    {
        return [
            'kak_id' => 'KAK',
            'penanggung_jawab_manual' => 'Penanggung Jawab',
            'pelaksana_manual' => 'Pelaksana',
            'surat_pengantar' => 'Surat Pengantar',
        ];
    }
}

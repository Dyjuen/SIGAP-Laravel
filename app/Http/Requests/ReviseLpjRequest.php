<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ReviseLpjRequest extends FormRequest
{
    /**
     * Only Bendahara and Admin can revise LPJ.
     */
    public function authorize(): bool
    {
        return in_array($this->user()->getRoleName(), ['Bendahara', 'Admin']);
    }

    /**
     * General comment is required, lampiran comments are optional.
     */
    public function rules(): array
    {
        return [
            'lampiran_comments' => ['nullable', 'array'],
            'lampiran_comments.*.id' => ['required', 'integer', 'exists:t_kegiatan_lampiran,lampiran_id'],
            'lampiran_comments.*.catatan_reviewer' => ['required', 'string', 'max:1000'],
            'anggaran_comments' => ['nullable', 'array'],
            'anggaran_comments.*.id' => ['required', 'integer', 'exists:t_kak_anggaran,anggaran_id'],
            'anggaran_comments.*.catatan_reviewer' => ['required', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [];
    }
}

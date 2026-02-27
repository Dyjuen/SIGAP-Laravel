<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SaveCatatanRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     * Only Bendahara or Admin can save reviewer notes.
     */
    public function authorize(): bool
    {
        return in_array($this->user()->getRoleName(), ['Bendahara', 'Admin']);
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'catatan_reviewer' => ['required', 'string', 'min:5', 'max:1000'],
        ];
    }

    /**
     * Custom messages in Bahasa Indonesia.
     */
    public function messages(): array
    {
        return [
            'catatan_reviewer.required' => 'Catatan reviewer wajib diisi.',
            'catatan_reviewer.min' => 'Catatan reviewer minimal 5 karakter.',
            'catatan_reviewer.max' => 'Catatan reviewer maksimal 1000 karakter.',
        ];
    }
}

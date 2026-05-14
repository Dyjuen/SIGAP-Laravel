<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePencairanRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     * Only Bendahara role can record pencairan.
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
            'nominal_pencairan' => ['required', 'numeric', 'min:1'],
            'keterangan' => ['nullable', 'string', 'max:1000'],
        ];
    }

    /**
     * Custom messages in Bahasa Indonesia.
     */
    public function messages(): array
    {
        return [
            'required' => ':attribute harus diisi.',
            'numeric' => ':attribute harus berupa angka.',
            'min' => ':attribute minimal :min.',
            'max' => ':attribute maksimal :max karakter.',
        ];
    }

    public function attributes(): array
    {
        return [
            'nominal_pencairan' => 'Nominal Pencairan',
            'keterangan' => 'Keterangan',
        ];
    }
}

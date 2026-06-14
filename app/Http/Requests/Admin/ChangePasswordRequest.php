<?php

namespace App\Http\Requests\Admin;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Validation\Rules\Password;
use Illuminate\Foundation\Http\FormRequest;

class ChangePasswordRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->getRoleName() === 'Admin';
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'new_password' => ['required', 'confirmed', Password::min(8)->mixedCase()->numbers()->symbols()->max(100)],
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
            'new_password.required' => 'Password baru harus diisi.',
            'new_password.confirmed' => 'Konfirmasi password tidak sesuai.',
            'new_password.min' => 'Password baru minimal :min karakter.',
            'new_password.max' => 'Password baru maksimal :max karakter.',
        ];
    }
}

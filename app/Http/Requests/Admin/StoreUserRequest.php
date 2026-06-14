<?php

namespace App\Http\Requests\Admin;

use App\Models\User;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class StoreUserRequest extends FormRequest
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
        \Log::info('StoreUserRequest payload: '.json_encode($this->all()));

        return [
            'username' => ['required', 'string', 'alpha_num', 'min:3', 'max:50', 'unique:'.User::class.',username'],
            'password' => ['required', 'confirmed', Password::min(8)->mixedCase()->numbers()->symbols()->max(100)],
            'nama_lengkap' => ['required', 'string', 'min:3', 'max:100'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:100', 'unique:'.User::class.',email'],
            'role_ids' => ['required', 'array', 'min:1'],
            'role_ids.*' => ['integer', 'exists:m_roles,role_id'],
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
            'username.required' => 'Username harus diisi.',
            'username.unique' => 'Username sudah digunakan.',
            'email.required' => 'Email harus diisi.',
            'email.unique' => 'Email sudah digunakan.',
            'password.required' => 'Password harus diisi.',
            'password.confirmed' => 'Konfirmasi password tidak sama.',
            'nama_lengkap.required' => 'Nama lengkap harus diisi.',
            'role_ids.required' => 'Role harus dipilih minimal 1.',
            'role_ids.min' => 'Role harus dipilih minimal 1.',
        ];
    }
}

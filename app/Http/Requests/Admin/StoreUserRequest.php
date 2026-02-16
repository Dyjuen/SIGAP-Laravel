<?php

namespace App\Http\Requests\Admin;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules;

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
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'username' => ['required', 'string', 'min:3', 'max:50', 'unique:'.User::class],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'nama_lengkap' => ['required', 'string', 'min:3', 'max:100'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:100', 'unique:'.User::class],
            'role_id' => ['required', 'integer', 'exists:m_roles,role_id'],
        ];
    }
}

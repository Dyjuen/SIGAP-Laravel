<?php

namespace App\Validators;

use App\Core\Validator;
use App\Models\User;

class RegisterValidator extends Validator
{
    private $userModel;

    public function __construct()
    {
        $this->userModel = new User;
    }

    /**
     * Validate register data
     *
     * @param  array  $data  Data registrasi user baru
     */
    public function validateRegister(array $data): bool
    {
        // Basic validation rules
        $rules = [
            'username' => 'required|alphanumeric|min:3|max:50',
            'password' => 'required|min:8|max:100',
            'password_confirmation' => 'required',
            'nama_lengkap' => 'required|min:3|max:100',
            'email' => 'required|email|max:100',
            'role_ids' => 'required|array',
        ];

        // Apply basic validation
        if (! $this->validate($data, $rules)) {
            return false;
        }

        // Custom validations
        $this->validateUsername($data['username'] ?? '');
        $this->validateEmail($data['email'] ?? '');
        $this->validatePasswordConfirmation($data['password'] ?? '', $data['password_confirmation'] ?? '');
        $this->validateRoleIds($data['role_ids'] ?? []);

        return ! $this->hasErrors();
    }

    /**
     * Validate username uniqueness
     */
    private function validateUsername($username)
    {
        if (empty($username)) {
            return;
        }

        if ($this->userModel->usernameExists($username)) {
            $this->addError('username', 'Username sudah digunakan.');
        }
    }

    /**
     * Validate email uniqueness
     */
    private function validateEmail($email)
    {
        if (empty($email)) {
            return;
        }

        if ($this->userModel->emailExists($email)) {
            $this->addError('email', 'Email sudah digunakan.');
        }
    }

    /**
     * Validate password confirmation
     */
    private function validatePasswordConfirmation($password, $passwordConfirmation)
    {
        if ($password !== $passwordConfirmation) {
            $this->addError('password_confirmation', 'Konfirmasi password tidak sama.');
        }
    }

    /**
     * Validate role IDs exist
     */
    private function validateRoleIds($roleIds)
    {
        if (! is_array($roleIds) || empty($roleIds)) {
            $this->addError('role_ids', 'Role harus dipilih minimal 1.');

            return;
        }

        // Check if all role IDs are valid integers
        foreach ($roleIds as $roleId) {
            if (! is_numeric($roleId) || $roleId <= 0) {
                $this->addError('role_ids', 'Role ID tidak valid.');

                return;
            }
        }
    }
}

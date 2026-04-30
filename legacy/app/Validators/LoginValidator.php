<?php

namespace App\Validators;

use App\Core\Validator;

class LoginValidator extends Validator
{
    /**
     * Validate login data
     *
     * @param  array  $data  Data login (username, password)
     */
    public function validateLogin(array $data): bool
    {
        $rules = [
            'username' => 'required|alphanumeric|min:3|max:50',
            'password' => 'required|min:6',
        ];

        return $this->validate($data, $rules);
    }

    /**
     * Get custom error messages
     */
    protected function applyRule($field, $rule)
    {
        // Custom messages untuk field login
        $customMessages = [
            'username' => [
                'required' => 'Username harus diisi.',
                'alphanumeric' => 'Username hanya boleh berisi huruf dan angka.',
                'min' => 'Username minimal 3 karakter.',
                'max' => 'Username maksimal 50 karakter.',
            ],
            'password' => [
                'required' => 'Password harus diisi.',
                'min' => 'Password minimal 6 karakter.',
            ],
        ];

        // Get current rule without parameters
        $ruleName = explode(':', $rule)[0];

        // Apply parent validation
        parent::applyRule($field, $rule);

        // Replace with custom message if exists
        if (isset($customMessages[$field][$ruleName]) && $this->hasErrors()) {
            $errors = $this->getFieldErrors($field);
            if (! empty($errors)) {
                // Replace last error with custom message
                $this->errors[$field][count($errors) - 1] = $customMessages[$field][$ruleName];
            }
        }
    }
}

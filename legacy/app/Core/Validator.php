<?php

namespace App\Core;

class Validator
{
    protected $errors = [];

    protected $data = [];

    /**
     * Validate data with rules
     *
     * @param  array  $data  Data yang akan divalidasi
     * @param  array  $rules  Rules validasi
     */
    public function validate(array $data, array $rules): bool
    {
        $this->data = $data;
        $this->errors = [];

        foreach ($rules as $field => $ruleSet) {
            $rulesArray = explode('|', $ruleSet);

            foreach ($rulesArray as $rule) {
                $this->applyRule($field, $rule);
            }
        }

        return empty($this->errors);
    }

    /**
     * Apply validation rule
     */
    protected function applyRule($field, $rule)
    {
        $params = [];
        $ruleName = $rule; // Default to full rule string as name

        if (strpos($rule, ':') !== false) {
            [$ruleName, $paramString] = explode(':', $rule, 2);

            // Special handling for regex rule: the entire paramString is the pattern
            if ($ruleName === 'regex') {
                $params = [$paramString];
            } else {
                $params = explode(',', $paramString);
            }
        }

        $value = $this->data[$field] ?? null;

        switch ($ruleName) {
            case 'required':
                if (empty($value) && $value !== '0') {
                    $this->addError($field, ucfirst($field).' harus diisi.');
                }
                break;

            case 'email':
                if (! empty($value) && ! filter_var($value, FILTER_VALIDATE_EMAIL)) {
                    $this->addError($field, ucfirst($field).' harus berupa email yang valid.');
                }
                break;

            case 'min':
                $min = $params[0] ?? 0;
                if (! empty($value) && strlen($value) < $min) {
                    $this->addError($field, ucfirst($field)." minimal {$min} karakter.");
                }
                break;

            case 'max':
                $max = $params[0] ?? 0;
                if (! empty($value) && strlen($value) > $max) {
                    $this->addError($field, ucfirst($field)." maksimal {$max} karakter.");
                }
                break;

            case 'numeric':
                if (! empty($value) && ! is_numeric($value)) {
                    $this->addError($field, ucfirst($field).' harus berupa angka.');
                }
                break;

            case 'integer':
                if (! empty($value) && ! filter_var($value, FILTER_VALIDATE_INT)) {
                    $this->addError($field, ucfirst($field).' harus berupa bilangan bulat.');
                }
                break;

            case 'alpha':
                if (! empty($value) && ! ctype_alpha($value)) {
                    $this->addError($field, ucfirst($field).' hanya boleh berisi huruf.');
                }
                break;

            case 'alphanumeric':
                if (! empty($value) && ! ctype_alnum($value)) {
                    $this->addError($field, ucfirst($field).' hanya boleh berisi huruf dan angka.');
                }
                break;

            case 'array':
                if (! empty($value) && ! is_array($value)) {
                    $this->addError($field, ucfirst($field).' harus berupa array.');
                }
                break;

            case 'confirmed':
                $confirmField = $field.'_confirmation';
                if (isset($this->data[$confirmField]) && $value !== $this->data[$confirmField]) {
                    $this->addError($field, ucfirst($field).' tidak sama dengan konfirmasi.');
                }
                break;

            case 'same':
                $otherField = $params[0] ?? '';
                if (isset($this->data[$otherField]) && $value !== $this->data[$otherField]) {
                    $this->addError($field, ucfirst($field)." harus sama dengan {$otherField}.");
                }
                break;

            case 'different':
                $otherField = $params[0] ?? '';
                if (isset($this->data[$otherField]) && $value === $this->data[$otherField]) {
                    $this->addError($field, ucfirst($field)." harus berbeda dengan {$otherField}.");
                }
                break;

            case 'in':
                if (! empty($value) && ! in_array($value, $params)) {
                    $this->addError($field, ucfirst($field).' harus salah satu dari: '.implode(', ', $params).'.');
                }
                break;

            case 'not_in':
                if (! empty($value) && in_array($value, $params)) {
                    $this->addError($field, ucfirst($field).' tidak boleh berisi: '.implode(', ', $params).'.');
                }
                break;

            case 'url':
                if (! empty($value) && ! filter_var($value, FILTER_VALIDATE_URL)) {
                    $this->addError($field, ucfirst($field).' harus berupa URL yang valid.');
                }
                break;

            case 'date':
                if (! empty($value) && ! strtotime($value)) {
                    $this->addError($field, ucfirst($field).' harus berupa tanggal yang valid.');
                }
                break;

            case 'regex':
                $pattern = $params[0] ?? '';
                if (! empty($value) && ! preg_match($pattern, $value)) {
                    $this->addError($field, ucfirst($field).' format tidak valid.');
                }
                break;
        }
    }

    /**
     * Add error message
     */
    protected function addError($field, $message)
    {
        if (! isset($this->errors[$field])) {
            $this->errors[$field] = [];
        }
        $this->errors[$field][] = $message;
    }

    /**
     * Get all errors
     */
    public function getErrors(): array
    {
        return $this->errors;
    }

    /**
     * Check if validation has errors
     */
    public function hasErrors(): bool
    {
        return ! empty($this->errors);
    }

    /**
     * Get first error message
     */
    public function getFirstError(): ?string
    {
        if (empty($this->errors)) {
            return null;
        }

        $firstField = array_key_first($this->errors);

        return $this->errors[$firstField][0] ?? null;
    }

    /**
     * Get errors for specific field
     */
    public function getFieldErrors($field): array
    {
        return $this->errors[$field] ?? [];
    }
}

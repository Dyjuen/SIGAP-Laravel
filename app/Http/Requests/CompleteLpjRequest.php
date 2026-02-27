<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CompleteLpjRequest extends FormRequest
{
    /**
     * Only Bendahara and Admin can mark LPJ as complete.
     */
    public function authorize(): bool
    {
        return in_array($this->user()->getRoleName(), ['Bendahara', 'Admin']);
    }

    /**
     * No validation rules required for simple completion action.
     */
    public function rules(): array
    {
        return [];
    }
}

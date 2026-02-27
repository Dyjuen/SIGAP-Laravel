<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ApproveLpjRequest extends FormRequest
{
    /**
     * Only Bendahara and Admin can approve LPJ.
     */
    public function authorize(): bool
    {
        return in_array($this->user()->getRoleName(), ['Bendahara', 'Admin']);
    }

    /**
     * No validation rules required for simple approval action.
     */
    public function rules(): array
    {
        return [];
    }
}

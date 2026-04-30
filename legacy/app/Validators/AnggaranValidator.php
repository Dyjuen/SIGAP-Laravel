<?php

namespace App\Validators;

use App\Core\Validator;

class AnggaranValidator extends Validator
{
    /**
     * Validate anggaran item
     */
    public function validateAnggaran(array $data): bool
    {
        // Basic validation rules based on DB schema
        $rules = [
            'uraian' => 'required',
            'volume1' => 'required',
            'satuan1_id' => 'required',
            'harga_satuan' => 'required',
            'volume2' => 'nullable',
            'satuan2_id' => 'nullable',
            'volume3' => 'nullable',
            'satuan3_id' => 'nullable',
        ];

        // Apply validation
        if (! $this->validate($data, $rules)) {
            return false;
        }

        return ! $this->hasErrors();
    }
}

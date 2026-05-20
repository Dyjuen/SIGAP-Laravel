<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Support\Facades\Validator;
use Illuminate\Translation\PotentiallyTranslatedString;

class AnggaranRule implements ValidationRule
{
    /**
     * Run the validation rule.
     *
     * @param  Closure(string, ?string=): PotentiallyTranslatedString  $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! is_array($value)) {
            $fail(':attribute harus berupa array.');

            return;
        }

        $validator = Validator::make($value, [
            'uraian' => 'required',
            'volume1' => 'required',
            'satuan1_id' => 'required',
            'harga_satuan' => 'required',
            'volume2' => 'nullable',
            'satuan2_id' => 'nullable',
            'volume3' => 'nullable',
            'satuan3_id' => 'nullable',
        ], [
            'required' => ':attribute harus diisi.',
        ], [
            'uraian' => 'Uraian',
            'volume1' => 'Volume 1',
            'satuan1_id' => 'Satuan 1',
            'harga_satuan' => 'Harga Satuan',
        ]);

        if ($validator->fails()) {
            foreach ($validator->errors()->all() as $error) {
                $fail($error);
            }
        }
    }
}

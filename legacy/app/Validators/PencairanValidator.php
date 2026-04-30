<?php

namespace App\Validators;

use App\Core\Validator;

class PencairanValidator extends Validator
{
    /**
     * Validasi untuk pengajuan pencairan
     */
    public function validateCreate(array $data): array
    {
        $rules = [
            'kegiatan_id' => 'required|integer',
            'nominal_pencairan' => 'required|numeric|min:1',
            'keterangan' => 'nullable|string|max:1000',
        ];

        // The parent validator does not use custom messages, so they are omitted here.
        $isValid = $this->validate($data, $rules);

        return [
            'valid' => $isValid,
            'errors' => $this->getErrors(),
        ];
    }

    /**
     * Validasi untuk approval/reject pencairan
     */
    public function validateApproval(array $data): array
    {
        $rules = [
            'catatan_bendahara' => 'nullable|string|max:1000',
        ];

        $isValid = $this->validate($data, $rules);

        return [
            'valid' => $isValid,
            'errors' => $this->getErrors(),
        ];
    }

    /**
     * Validasi untuk rejection (catatan wajib)
     */
    public function validateReject(array $data): array
    {
        $rules = [
            'catatan_bendahara' => 'required|string|min:10|max:1000',
        ];

        $isValid = $this->validate($data, $rules);

        return [
            'valid' => $isValid,
            'errors' => $this->getErrors(),
        ];
    }
}

<?php

namespace App\Validators;

use App\Core\Validator;

class PanduanValidator extends Validator
{
    public function validatePanduan(array $data, bool $isUpdate = false): bool
    {
        // Use parent validator for basic rules
        parent::validate($data, [
            'judul_panduan' => 'required',
        ]);

        // For updates, skip file/media validation entirely - backend will handle keeping old files
        if ($isUpdate) {
            return ! $this->hasErrors();
        }

        // For CREATE only: check if file or URL is provided
        $file_upload_present = false;
        $file_with_error = false;
        $error_code = UPLOAD_ERR_OK;

        if (! empty($_FILES)) {
            $first_file = reset($_FILES);
            if (isset($first_file['error'])) {
                if ($first_file['error'] !== UPLOAD_ERR_NO_FILE) {
                    $file_upload_present = true;
                }
                if ($first_file['error'] !== UPLOAD_ERR_OK && $first_file['error'] !== UPLOAD_ERR_NO_FILE) {
                    $file_with_error = true;
                    $error_code = $first_file['error'];
                }
            }
        }

        $path_media_present = ! empty($data['path_media']);

        // Require file/URL only for new records
        if (! $path_media_present && ! $file_upload_present) {
            $this->addError('file', 'File atau URL tidak boleh kosong');
        }

        if ($file_with_error) {
            $msg = 'File gagal diupload.';
            if ($error_code === UPLOAD_ERR_INI_SIZE || $error_code === UPLOAD_ERR_FORM_SIZE) {
                $msg = 'Ukuran file terlalu besar (melebihi batas server).';
            }
            $this->addError('file', $msg.' Error code: '.$error_code);
        }

        // Return true if no errors, false otherwise
        return ! $this->hasErrors();
    }
}

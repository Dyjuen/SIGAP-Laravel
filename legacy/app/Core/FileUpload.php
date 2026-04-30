<?php

namespace App\Core;

class FileUpload
{
    private $uploadPath;

    private $maxSize;

    private $allowedMimeTypes;

    private $allowedTypes;

    /**
     * Constructor
     *
     * @param  string  $uploadPath  Relative path from document root
     * @param  array  $allowedTypes  Allowed file extensions
     * @param  int  $maxSize  Max file size in bytes (default 20MB)
     * @param  array  $allowedMimeTypes  Allowed MIME types. If null, will be generated from $allowedTypes.
     */
    public function __construct(
        $uploadPath = '/uploads/documents/',
        $allowedTypes = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'jpg', 'jpeg', 'png', 'zip', 'rar'],
        $maxSize = 20971520,  // 20MB
        $allowedMimeTypes = null
    ) {
        $this->uploadPath = rtrim($uploadPath, '/').'/';
        $this->allowedTypes = $allowedTypes;
        $this->maxSize = $maxSize;

        if ($allowedMimeTypes === null) {
            $this->allowedMimeTypes = $this->generateMimeTypesFromExtensions($allowedTypes);
        } else {
            $this->allowedMimeTypes = $allowedMimeTypes;
        }

        // Create upload directory if not exists
        $this->createUploadDirectory();
    }

    /**
     * Generate allowed MIME types from extensions
     */
    private function generateMimeTypesFromExtensions($extensions)
    {
        $mimeMap = $this->getMimeTypeMap();
        $mimeTypes = [];
        foreach ($extensions as $ext) {
            if (isset($mimeMap[$ext])) {
                $mimeTypes = array_merge($mimeTypes, (array) $mimeMap[$ext]);
            }
        }

        return array_unique($mimeTypes);
    }

    /**
     * Get a map of common extensions to MIME types
     */
    private function getMimeTypeMap()
    {
        return [
            'pdf' => 'application/pdf',
            'doc' => 'application/msword',
            'docx' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'xls' => 'application/vnd.ms-excel',
            'xlsx' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'ppt' => 'application/vnd.ms-powerpoint',
            'pptx' => 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'jpg' => 'image/jpeg',
            'jpeg' => 'image/jpeg',
            'png' => 'image/png',
            'gif' => 'image/gif',
            'zip' => ['application/zip', 'application/x-zip-compressed'],
            'rar' => ['application/x-rar-compressed', 'application/octet-stream'],
        ];
    }

    /**
     * Upload file
     *
     * @param  array  $file  $_FILES['file']
     * @return array Result with success status and data
     */
    public function upload($file)
    {
        try {
            // Validate file
            $validation = $this->validate($file);
            if (! $validation['success']) {
                return $validation;
            }

            // Generate unique filename
            $extension = $this->getFileExtension($file['name']);
            $filename = $this->generateUniqueFilename($extension);

            // Full path
            $fullPath = $_SERVER['DOCUMENT_ROOT'].$this->uploadPath.$filename;

            // Move uploaded file
            if (! move_uploaded_file($file['tmp_name'], $fullPath)) {
                return [
                    'success' => false,
                    'message' => 'Gagal memindahkan file ke direktori upload.',
                ];
            }

            // Return success with file info
            return [
                'success' => true,
                'message' => 'File berhasil diupload.',
                'original_name' => $file['name'],
                'filename' => $filename,
                'file_path' => $this->uploadPath.$filename,
                'file_size' => $file['size'],
                'mime_type' => $file['type'],
            ];

        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Error: '.$e->getMessage(),
            ];
        }
    }

    /**
     * Validate file
     *
     * @param  array  $file  $_FILES['file']
     * @return array Validation result
     */
    private function validate($file)
    {
        // Check if file exists
        if (! isset($file['tmp_name']) || ! is_uploaded_file($file['tmp_name'])) {
            return [
                'success' => false,
                'message' => 'File tidak ditemukan atau tidak valid.',
            ];
        }

        // Check upload errors
        if ($file['error'] !== UPLOAD_ERR_OK) {
            return [
                'success' => false,
                'message' => $this->getUploadErrorMessage($file['error']),
            ];
        }

        // Check file size
        if ($file['size'] > $this->maxSize) {
            $maxSizeMB = $this->maxSize / 1024 / 1024;

            return [
                'success' => false,
                'message' => "Ukuran file terlalu besar. Maksimal {$maxSizeMB}MB.",
            ];
        }

        if ($file['size'] == 0) {
            return [
                'success' => false,
                'message' => 'File kosong (0 byte).',
            ];
        }

        // Check file extension
        $extension = strtolower($this->getFileExtension($file['name']));
        if (! in_array($extension, $this->allowedTypes)) {
            $allowed = implode(', ', array_map('strtoupper', $this->allowedTypes));

            return [
                'success' => false,
                'message' => "Tipe file tidak diizinkan. Hanya file {$allowed} yang diperbolehkan.",
            ];
        }

        // Validate MIME type (additional security)
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mimeType = finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);

        if (! in_array($mimeType, $this->allowedMimeTypes)) {
            return [
                'success' => false,
                'message' => "Tipe file tidak valid (terdeteksi: {$mimeType}). Pastikan file tidak korup dan sesuai dengan ekstensinya.",
            ];
        }

        return ['success' => true];
    }

    /**
     * Get file extension
     */
    private function getFileExtension($filename)
    {
        return strtolower(pathinfo($filename, PATHINFO_EXTENSION));
    }

    /**
     * Generate unique filename
     */
    private function generateUniqueFilename($extension)
    {
        return uniqid('doc_', true).'_'.time().'.'.$extension;
    }

    /**
     * Create upload directory if not exists
     */
    private function createUploadDirectory()
    {
        $fullPath = $_SERVER['DOCUMENT_ROOT'].$this->uploadPath;

        if (! file_exists($fullPath)) {
            mkdir($fullPath, 0755, true);

            // Create .htaccess to protect directory
            $htaccess = $fullPath.'.htaccess';
            if (! file_exists($htaccess)) {
                file_put_contents($htaccess, "Options -Indexes\n<FilesMatch \"\.(php|php3|php4|php5|phtml)$\">\nOrder Allow,Deny\nDeny from all\n</FilesMatch>");
            }
        }
    }

    /**
     * Get upload error message
     */
    private function getUploadErrorMessage($errorCode)
    {
        $errors = [
            UPLOAD_ERR_INI_SIZE => 'File melebihi upload_max_filesize di php.ini.',
            UPLOAD_ERR_FORM_SIZE => 'File melebihi MAX_FILE_SIZE di form HTML.',
            UPLOAD_ERR_PARTIAL => 'File hanya terupload sebagian.',
            UPLOAD_ERR_NO_FILE => 'Tidak ada file yang diupload.',
            UPLOAD_ERR_NO_TMP_DIR => 'Direktori temporary tidak ditemukan.',
            UPLOAD_ERR_CANT_WRITE => 'Gagal menulis file ke disk.',
            UPLOAD_ERR_EXTENSION => 'Upload dihentikan oleh ekstensi PHP.',
        ];

        return $errors[$errorCode] ?? 'Error upload tidak diketahui.';
    }

    /**
     * Delete file
     *
     * @param  string  $filePath  Relative file path
     * @return bool Success status
     */
    public function delete($filePath)
    {
        $fullPath = $_SERVER['DOCUMENT_ROOT'].$filePath;

        if (file_exists($fullPath)) {
            return unlink($fullPath);
        }

        return false;
    }

    /**
     * Check if file exists
     */
    public function exists($filePath)
    {
        $fullPath = $_SERVER['DOCUMENT_ROOT'].$filePath;

        return file_exists($fullPath);
    }

    /**
     * Get file size
     */
    public function getFileSize($filePath)
    {
        $fullPath = $_SERVER['DOCUMENT_ROOT'].$filePath;

        if (file_exists($fullPath)) {
            return filesize($fullPath);
        }

        return 0;
    }

    /**
     * Format file size to human readable
     */
    public static function formatFileSize($bytes)
    {
        if ($bytes >= 1073741824) {
            return number_format($bytes / 1073741824, 2).' GB';
        } elseif ($bytes >= 1048576) {
            return number_format($bytes / 1048576, 2).' MB';
        } elseif ($bytes >= 1024) {
            return number_format($bytes / 1024, 2).' KB';
        } else {
            return $bytes.' bytes';
        }
    }
}

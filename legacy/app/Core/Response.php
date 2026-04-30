<?php

namespace App\Core;

class Response
{
    /**
     * Send success response
     */
    public static function success($data = null, string $message = 'Success', int $code = 200): void
    {
        // Clean any previous output
        if (ob_get_length()) {
            ob_clean();
        }

        http_response_code($code);
        header('Content-Type: application/json');

        echo json_encode([
            'success' => true,
            'message' => $message,
            'data' => $data,
        ], JSON_PRETTY_PRINT);

        exit;
    }

    /**
     * Send error response
     */
    public static function error(string $message = 'Error', int $code = 400, ?array $errors = null): void
    {
        // Clean any previous output
        if (ob_get_length()) {
            ob_clean();
        }

        http_response_code($code);
        header('Content-Type: application/json');

        $response = [
            'success' => false,
            'message' => $message,
        ];

        if ($errors !== null) {
            $response['errors'] = $errors;
        }

        echo json_encode($response, JSON_PRETTY_PRINT);

        exit;
    }

    /**
     * Send 400 Bad Request response
     */
    public static function badRequest(string $message = 'Bad Request. Data yang dikirim tidak valid.'): void
    {
        self::error($message, 400);
    }

    /**
     * Send 401 Unauthorized response
     */
    public static function unauthorized(string $message = 'Unauthorized. Token tidak valid atau sudah expired.'): void
    {
        self::error($message, 401);
    }

    /**
     * Send 403 Forbidden response
     */
    public static function forbidden(string $message = 'Forbidden. Anda tidak memiliki akses ke resource ini.'): void
    {
        self::error($message, 403);
    }

    /**
     * Send 404 Not Found response
     */
    public static function notFound(string $message = 'Resource tidak ditemukan.'): void
    {
        self::error($message, 404);
    }

    /**
     * Send 409 Conflict response
     */
    public static function conflict(string $message = 'Conflict. Data sudah ada atau bentrok.'): void
    {
        self::error($message, 409);
    }

    /**
     * Send 422 Unprocessable Entity response (Validation Error)
     */
    public static function validationError(array $errors, string $message = 'Validasi gagal.'): void
    {
        // Find the first error message to make the main message more descriptive
        $firstError = 'Periksa kembali data yang Anda masukkan.'; // Default message
        if (! empty($errors)) {
            $firstFieldErrors = reset($errors); // Get the errors for the first field
            if (! empty($firstFieldErrors) && is_array($firstFieldErrors)) {
                $firstError = reset($firstFieldErrors); // Get the first error message
            }
        }

        $fullMessage = rtrim($message, '.').'. '.$firstError;

        self::error($fullMessage, 422, $errors);
    }

    /**
     * Send 500 Internal Server Error response
     */
    public static function serverError(string $message = 'Terjadi kesalahan pada server.'): void
    {
        self::error($message, 500);
    }

    /**
     * Send 201 Created response
     */
    public static function created($data = null, string $message = 'Data berhasil dibuat.'): void
    {
        self::success($data, $message, 201);
    }

    /**
     * Send 204 No Content response
     */
    public static function noContent(): void
    {
        http_response_code(204);
        exit;
    }

    public static function json($data, $code = 200)
    {
        // Setel kode status
        self::statusCode($code);

        // Setel header content type ke JSON
        header('Content-Type: application/json');

        // Tampilkan data sebagai JSON dan hentikan eksekusi
        echo json_encode($data);
        exit;
    }

    public static function statusCode($code)
    {
        http_response_code($code);
    }

    // File Anda mungkin sudah punya ini
    public static function redirect($url)
    {
        header("Location: $url");
    }
}

<?php

namespace App\Middlewares;

use App\Core\Middleware;

class CorsMiddleware implements Middleware
{
    /**
     * Handle CORS headers
     */
    public function handle(): void
    {
        // Get allowed origins from config or environment
        $allowedOrigins = $this->getAllowedOrigins();
        $requestOrigin = $_SERVER['HTTP_ORIGIN'] ?? '';

        // Check if request origin is allowed
        if ($this->isOriginAllowed($requestOrigin, $allowedOrigins)) {
            header("Access-Control-Allow-Origin: {$requestOrigin}");
        } elseif (in_array('*', $allowedOrigins)) {
            header('Access-Control-Allow-Origin: *');
        }

        // Set other CORS headers
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Max-Age: 86400'); // Cache preflight for 24 hours

        // Handle preflight OPTIONS request
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(200);
            exit;
        }
    }

    /**
     * Get allowed origins from environment or config
     */
    private function getAllowedOrigins(): array
    {
        $origins = getenv('CORS_ALLOWED_ORIGINS') ?: '*';

        if ($origins === '*') {
            return ['*'];
        }

        return array_map('trim', explode(',', $origins));
    }

    /**
     * Check if origin is allowed
     *
     * @param  string  $origin  Request origin
     * @param  array  $allowedOrigins  Allowed origins
     */
    private function isOriginAllowed(string $origin, array $allowedOrigins): bool
    {
        if (empty($origin)) {
            return false;
        }

        return in_array($origin, $allowedOrigins);
    }
}

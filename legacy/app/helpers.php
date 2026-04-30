<?php

use Firebase\JWT\Key;

// app/helpers.php
if (! function_exists('baseUrl')) {
    /**
     * Menghasilkan URL absolut ke sebuah aset.
     * Disesuaikan untuk lingkungan XAMPP standar.
     */
    function baseUrl($path = '')
    {
        $protocol = (! empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' || $_SERVER['SERVER_PORT'] == 443) ? 'https://' : 'http://';
        $host = $_SERVER['HTTP_HOST'];

        // Kita hanya mengambil path ke direktori tempat index.php berada (yaitu, folder public)
        $script_path = str_replace(basename($_SERVER['SCRIPT_NAME']), '', $_SERVER['SCRIPT_NAME']);

        $base_url = rtrim($protocol.$host.$script_path, '/');

        return $base_url.'/'.ltrim($path, '/');
    }
}

if (! function_exists('auth_user')) {
    function auth_user(): ?array
    {
        $authHeader = null;

        // Prioritize $_SERVER for Authorization header, as getallheaders() seems to be mangling it.
        if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
            $authHeader = trim($_SERVER['HTTP_AUTHORIZATION']);
        } elseif (isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
            $authHeader = trim($_SERVER['REDIRECT_HTTP_AUTHORIZATION']);
        } elseif (function_exists('getallheaders')) {
            $headers = getallheaders();
            $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? null;
            if ($authHeader) {
                $authHeader = trim($authHeader);
            }
        }

        if (empty($authHeader)) {
            return null;
        }

        $token = null;

        // Case 1: "Bearer <token>" (normal)
        if (preg_match('/^Bearer\s+(.+)$/i', $authHeader, $m)) {
            $token = trim($m[1]);
        } else {
            // Case 2: header mungkin hanya "Bearer" dan token ada di header terakhir (kadang thunderclient aneh)
            if (strtolower($authHeader) === 'bearer') {
                // ambil header terakhir value (fallback)
                $vals = array_values($headers);
                $last = end($vals);
                if ($last && $last !== 'Bearer') {
                    $token = trim($last);
                }
            } else {
                // fallback, mungkin client ngirim token langsung
                $token = trim($authHeader);
            }
        }

        if (empty($token)) {
            return null;
        }

        try {
            $jwt = new App\Core\JWT;
            $decoded = $jwt->decode($token); // kemungkinan stdClass

            // Jika payload bungkus di property 'data', tarik itu
            if (is_object($decoded) && property_exists($decoded, 'data')) {
                $decoded = $decoded->data;
            }

            // Jika masih object, cast ke array (rekursif)
            if (is_object($decoded) || is_array($decoded)) {
                // safe convert to associative array
                $arr = json_decode(json_encode($decoded), true);

                // normalisasi key names: jika ada 'user_id' di dalam data or 'user_id' nested, gunakan as is
                return is_array($arr) ? $arr : null;
            }

            return null;
        } catch (Throwable $e) {
            // decode gagal -> treat as not authenticated
            return null;
        }
    }
}

function json_response($data, int $status = 200): void
{
    if (! headers_sent()) {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
    }
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

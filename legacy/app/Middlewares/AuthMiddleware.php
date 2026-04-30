<?php

namespace App\Middlewares;

use App\Core\Database;
use App\Core\JWT;
use App\Core\Middleware;
use App\Core\Response;

class AuthMiddleware implements Middleware
{
    /**
     * Handle authentication check
     */
    public function handle(): void
    {
        $authHeader = null;

        // --- DEBUGGING START ---
        error_log('=== AUTH MIDDLEWARE DEBUG ===');
        error_log('Checking for Authorization header...');

        $serverAuth = $_SERVER['HTTP_AUTHORIZATION'] ?? 'NULL';
        $redirectAuth = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? 'NULL';
        error_log('HTTP_AUTHORIZATION: '.$serverAuth);
        error_log('REDIRECT_HTTP_AUTHORIZATION: '.$redirectAuth);

        if (function_exists('getallheaders')) {
            $headers = getallheaders();
            error_log('getallheaders(): '.print_r($headers, true));
        } else {
            error_log('getallheaders() function does not exist.');
        }
        // --- DEBUGGING END ---

        // Prioritize $_SERVER for Authorization header, as getallheaders() seems to be mangling it.
        if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
            $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
        } elseif (isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
            $authHeader = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
        } elseif (function_exists('getallheaders')) {
            $headers = getallheaders();
            $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? null;
        }

        if (! $authHeader) {
            Response::unauthorized('Token tidak ditemukan. Silakan login terlebih dahulu.');
        }

        $token = JWT::extractFromHeader($authHeader);
        if (! $token) {
            Response::unauthorized('Format token tidak valid. Gunakan format: Bearer <token>');
        }

        $decoded = JWT::decode($token);
        if (! $decoded) {
            Response::unauthorized('Token tidak valid atau sudah expired. Silakan login ulang.');
        }

        $db = Database::getInstance();
        $db->query('
            SELECT 
                u.user_id, 
                u.username, 
                u.nama_lengkap, 
                u.email,
                u.role_id,
                r.nama_role
            FROM m_users u
            LEFT JOIN m_roles r ON u.role_id = r.role_id
            WHERE u.user_id = :user_id
        ');
        $db->bind(':user_id', $decoded->user_id);
        $user = $db->single();

        if (! $user) {
            Response::unauthorized('User tidak ditemukan. Token tidak valid.');
        }

        // Set authenticated user data in global variable
        // Format 'roles' sebagai array of strings, sesuai harapan RoleMiddleware
        $GLOBALS['auth_user'] = [
            'user_id' => $user['user_id'],
            'username' => $user['username'],
            'nama_lengkap' => $user['nama_lengkap'],
            'role_id' => $user['role_id'],
            'roles' => $user['nama_role'] ? [$user['nama_role']] : [],
        ];

        $timeToExpire = JWT::getTimeToExpire($token);
        if ($timeToExpire !== null && $timeToExpire < 3600) {
            header('X-Token-Expiring: true');
            header('X-Token-Expires-In: '.$timeToExpire);
        }
    }

    public static function getAuthUser(): ?array
    {
        return $GLOBALS['auth_user'] ?? null;
    }

    public static function getAuthUserId(): ?int
    {
        $user = self::getAuthUser();

        return $user['user_id'] ?? null;
    }

    public static function isAuthenticated(): bool
    {
        return isset($GLOBALS['auth_user']);
    }
}

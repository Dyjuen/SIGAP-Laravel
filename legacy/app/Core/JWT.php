<?php

namespace App\Core;

use Exception;
use Firebase\JWT\JWT as FirebaseJWT;
use Firebase\JWT\Key;

class JWT
{
    private static $secret;

    private static $algorithm = 'HS256';

    private static $expiry = 86400; // 24 jam (dalam detik)

    /**
     * Initialize JWT configuration
     */
    private static function init()
    {
        if (self::$secret === null) {
            $config = require __DIR__.'/../../config/jwt.php';
            self::$secret = $config['secret'];
            self::$algorithm = $config['algorithm'];
            self::$expiry = $config['expiry'];
        }
    }

    /**
     * Generate JWT token
     *
     * @param  array  $payload  User data to encode
     * @return string JWT token
     */
    public static function encode(array $payload): string
    {
        self::init();

        $issuedAt = time();
        $expire = $issuedAt + self::$expiry;

        $token = [
            'iat' => $issuedAt,         // Issued at
            'exp' => $expire,            // Expire
            'data' => $payload,           // User data
        ];

        return FirebaseJWT::encode($token, self::$secret, self::$algorithm);
    }

    /**
     * Decode JWT token
     *
     * @param  string  $token  JWT token to decode
     * @return object|null Decoded data or null if invalid
     */
    public static function decode(string $token): ?object
    {
        self::init();

        try {
            $decoded = FirebaseJWT::decode($token, new Key(self::$secret, self::$algorithm));

            return $decoded->data;
        } catch (Exception $e) {
            return null;
        }
    }

    /**
     * Validate JWT token
     *
     * @param  string  $token  JWT token to validate
     * @return bool True if valid, false otherwise
     */
    public static function validate(string $token): bool
    {
        return self::decode($token) !== null;
    }

    /**
     * Extract token from Authorization header
     *
     * @param  string|null  $authHeader  Authorization header value
     * @return string|null Extracted token or null
     */
    public static function extractFromHeader(?string $authHeader): ?string
    {
        if (! $authHeader) {
            return null;
        }

        // Format: "Bearer <token>"
        if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
            return $matches[1];
        }

        // Fallback: Return the header value as-is if "Bearer" is missing
        return trim($authHeader);
    }

    /**
     * Get remaining time before token expires
     *
     * @param  string  $token  JWT token
     * @return int|null Remaining seconds or null if invalid
     */
    public static function getTimeToExpire(string $token): ?int
    {
        self::init();

        try {
            $decoded = FirebaseJWT::decode($token, new Key(self::$secret, self::$algorithm));
            $now = time();
            $exp = $decoded->exp;

            return max(0, $exp - $now);
        } catch (Exception $e) {
            return null;
        }
    }

    /**
     * Get token expiry time in seconds
     *
     * @return int Expiry time in seconds (default 86400 = 24 hours)
     */
    public static function getExpiryTime(): int
    {
        self::init();

        return self::$expiry;
    }

    /**
     * Get token expiry time in human readable format
     *
     * @return string Human readable expiry time
     */
    public static function getExpiryTimeHuman(): string
    {
        self::init();
        $hours = self::$expiry / 3600;

        if ($hours >= 24) {
            $days = $hours / 24;

            return round($days).' hari';
        }

        return round($hours).' jam';
    }

    /**
     * Check if token is about to expire (less than 1 hour remaining)
     *
     * @param  string  $token  JWT token
     * @return bool True if expiring soon
     */
    public static function isExpiringSoon(string $token): bool
    {
        $timeToExpire = self::getTimeToExpire($token);

        return $timeToExpire !== null && $timeToExpire < 3600; // Less than 1 hour
    }
}

<?php

namespace App\Middlewares;

use App\Core\Middleware;
use App\Core\Response;

class RateLimitMiddleware implements Middleware
{
    private $maxAttempts;

    private $decayMinutes;

    private $prefix;

    private $useApcu = false;

    private $enabled = true;

    /**
     * Constructor
     *
     * @param  int  $maxAttempts  Maximum attempts allowed
     * @param  int  $decayMinutes  Time window in minutes
     * @param  string  $prefix  Cache key prefix
     */
    public function __construct(int $maxAttempts = 60, int $decayMinutes = 1, string $prefix = 'global_access')
    {
        $this->maxAttempts = $maxAttempts;
        $this->decayMinutes = $decayMinutes;
        $this->prefix = $prefix;
        $this->useApcu = function_exists('apcu_enabled') && apcu_enabled();

        // Disable rate limiting in development environment
        $appEnv = $_ENV['APP_ENV'] ?? $_SERVER['APP_ENV'] ?? getenv('APP_ENV') ?? 'production';
        if ($appEnv === 'development') {
            $this->enabled = false;
        }
    }

    /**
     * Determine which rate-limiting strategy to use.
     */
    public function handle(): void
    {
        if (! $this->enabled) {
            return;
        }

        if ($this->useApcu) {
            $this->handleApcuBased();
        } else {
            $this->handleFileBased();
        }
    }

    /**
     * Handle rate limiting using APCu for high performance.
     */
    private function handleApcuBased(): void
    {
        $key = $this->getRateLimitKey();
        $maxAttempts = $this->maxAttempts;
        $decaySeconds = $this->decayMinutes * 60;

        // Fetch current attempts. $success is true if key exists.
        $success = false;
        $attempts = (int) apcu_fetch($key, $success);

        // Determine the reset time
        $info = $success ? apcu_key_info($key) : null;
        $resetTime = $info ? ($info['creation_time'] + $info['ttl']) : ($this->now() + $decaySeconds);

        // Check if the limit is already reached
        if ($attempts >= $maxAttempts) {
            $retryAfter = $resetTime - $this->now();

            header('X-RateLimit-Limit: '.$maxAttempts);
            header('X-RateLimit-Remaining: 0');
            header('X-RateLimit-Reset: '.$resetTime);
            header('Retry-After: '.max(0, $retryAfter));

            Response::error(
                'Terlalu banyak request. Silakan coba lagi setelah '.max(0, $retryAfter).' detik.',
                429
            );

            return;
        }

        // Increment the counter for the current request
        if (! $success) {
            // First request in the window, store with value 1
            apcu_store($key, 1, $decaySeconds);
            $currentAttempts = 1;
        } else {
            // Atomically increment the existing counter
            $currentAttempts = apcu_inc($key);
        }

        // Set headers for the current successful request
        $remaining = max(0, $maxAttempts - $currentAttempts);
        header('X-RateLimit-Limit: '.$maxAttempts);
        header('X-RateLimit-Remaining: '.$remaining);
        header('X-RateLimit-Reset: '.$resetTime);
    }

    /**
     * Handle rate limiting with atomic file locking as a fallback.
     */
    private function handleFileBased(): void
    {
        $key = $this->getRateLimitKey();
        $cacheFile = $this->getCacheFilePath($key);
        $maxAttempts = $this->maxAttempts;

        $cacheDir = dirname($cacheFile);
        if (! is_dir($cacheDir)) {
            mkdir($cacheDir, 0777, true);
        }

        $fp = fopen($cacheFile, 'c+');

        if (! $fp) {
            return;
        }

        if (flock($fp, LOCK_EX)) {
            $now = $this->now();
            $content = stream_get_contents($fp);
            $data = $content ? json_decode($content, true) : null;

            $attempts = 0;
            $expiresAt = $now + ($this->decayMinutes * 60);

            if ($data && isset($data['expires_at']) && $data['expires_at'] > $now) {
                $attempts = (int) $data['attempts'];
                $expiresAt = $data['expires_at'];
            }

            if ($attempts >= $maxAttempts) {
                $retryAfter = $expiresAt - $now;

                header('X-RateLimit-Limit: '.$maxAttempts);
                header('X-RateLimit-Remaining: 0');
                header('X-RateLimit-Reset: '.$expiresAt);
                header('Retry-After: '.$retryAfter);

                flock($fp, LOCK_UN);
                fclose($fp);

                Response::error(
                    'Terlalu banyak request. Silakan coba lagi setelah '.$retryAfter.' detik.',
                    429
                );

                return;
            }

            $attempts++;
            $newData = json_encode(['attempts' => $attempts, 'expires_at' => $expiresAt]);

            rewind($fp);
            ftruncate($fp, 0);
            fwrite($fp, $newData);
            fflush($fp);

            flock($fp, LOCK_UN);

            $remaining = max(0, $maxAttempts - $attempts);
            header('X-RateLimit-Limit: '.$maxAttempts);
            header('X-RateLimit-Remaining: '.$remaining);
            header('X-RateLimit-Reset: '.$expiresAt);
        }

        fclose($fp);
    }

    /**
     * Get rate limit key based on IP.
     */
    private function getRateLimitKey(): string
    {
        $ip = $this->getClientIp();
        // For APCu, colon is fine. For files, it's better to avoid it.
        $separator = $this->useApcu ? ':' : '_';

        return $this->prefix.$separator.$ip;
    }

    /**
     * Get client IP address
     */
    private function getClientIp(): string
    {
        $ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';

        if (! empty($_SERVER['HTTP_CLIENT_IP'])) {
            $ip = $_SERVER['HTTP_CLIENT_IP'];
        } elseif (! empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
            $ip = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR'])[0];
        }

        return preg_replace('/[^a-zA-Z0-9\._-]/', '', $ip);
    }

    /**
     * Get cache file path for file-based strategy
     *
     * @param  string  $key  Cache key
     */
    private function getCacheFilePath(string $key): string
    {
        $cacheDir = __DIR__.'/../../cache/rate_limit';

        return $cacheDir.'/'.$key.'.json';
    }

    /**
     * Get current timestamp
     */
    private function now(): int
    {
        return time();
    }
}

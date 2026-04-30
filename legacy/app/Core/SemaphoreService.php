<?php

namespace App\Core;

/**
 * SemaphoreService provides a simple, non-blocking semaphore implementation
 * using APCu for high-performance concurrency limiting.
 *
 * If the APCu extension is not available, the service will be disabled
 * and all acquire calls will return true without providing any locking.
 */
class SemaphoreService
{
    /**
     * @var string A unique prefix for all semaphore keys to avoid collisions.
     */
    private const KEY_PREFIX = 'semaphore_lock_';

    /**
     * @var int Time-to-live for semaphore keys in seconds.
     *          This prevents stale locks from persisting forever if a release fails.
     */
    private const SEMAPHORE_TTL = 60; // 1 minute

    /**
     * @var bool Flag indicating if the APCu extension is loaded and enabled.
     */
    private $apcuEnabled = false;

    public function __construct()
    {
        $this->apcuEnabled = extension_loaded('apcu') && function_exists('apcu_inc');
        if (! $this->apcuEnabled) {
            // Log once during instantiation to avoid flooding logs.
            error_log('Warning: APCu extension is not installed or enabled. SemaphoreService is disabled and will not provide concurrency limiting.');
        }
    }

    /**
     * Attempts to acquire a lock for a given key.
     *
     * @param  string  $key  A unique identifier for the resource to be locked.
     * @param  int  $maxLocks  The maximum number of concurrent locks allowed.
     * @return bool True if the lock was acquired or if APCu is disabled, false otherwise.
     */
    public function acquire(string $key, int $maxLocks): bool
    {
        // If APCu extension is not loaded, bypass semaphore functionality.
        if (! function_exists('apcu_inc')) {
            // Log this event or notify admin in a production environment.
            // For development, we bypass to allow functionality.
            return true;
        }

        if ($maxLocks <= 0) {
            return false;
        }

        $fullKey = self::KEY_PREFIX.$key;
        $success = false;

        // Atomically increment the counter.
        $currentLocks = \apcu_inc($fullKey, 1, $success, self::SEMAPHORE_TTL);

        // If the counter exceeds the maximum, we fail to acquire the lock.
        if ($currentLocks > $maxLocks) {
            // A concurrent process has acquired the lock just after we incremented.
            // We must decrement the counter back to maintain an accurate lock count.
            \apcu_dec($fullKey);

            return false;
        }

        return true;
    }

    /**
     * Releases a lock for a given key.
     *
     * @param  string  $key  The unique identifier for the resource that was locked.
     */
    public function release(string $key): void
    {
        // If APCu extension is not loaded, there's nothing to release.
        if (! function_exists('apcu_dec') || ! function_exists('apcu_store')) {
            return;
        }

        $fullKey = self::KEY_PREFIX.$key;

        // Atomically decrement the counter.
        // To prevent the counter from going below zero on race conditions or multiple releases.
        if (\apcu_fetch($fullKey) !== false) {
            $currentValue = \apcu_dec($fullKey);
            if ($currentValue < 0) {
                \apcu_store($fullKey, 0, self::SEMAPHORE_TTL);
            }
        }
    }
}

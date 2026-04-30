<?php

namespace App\Middlewares;

use App\Core\Middleware;
use App\Core\Response;

class RoleMiddleware implements Middleware
{
    private $allowedRoles;

    /**
     * Constructor
     *
     * @param  array  $allowedRoles  Array of role names that are allowed
     */
    public function __construct(array $allowedRoles = [])
    {
        $this->allowedRoles = $allowedRoles;
    }

    /**
     * Handle role-based access control
     *
     * Checks if authenticated user has one of the allowed roles
     */
    public function handle(): void
    {
        // Get authenticated user from AuthMiddleware
        $authUser = AuthMiddleware::getAuthUser();

        if (! $authUser) {
            Response::unauthorized('User tidak terautentikasi');
        }

        // If no specific roles required, just check if authenticated
        if (empty($this->allowedRoles)) {
            return;
        }

        // Get user roles from JWT token (already set by AuthMiddleware)
        $userRoles = $authUser['roles'] ?? [];

        // Check if user has at least one of the allowed roles
        $hasAccess = false;
        foreach ($this->allowedRoles as $allowedRole) {
            if (in_array($allowedRole, $userRoles)) {
                $hasAccess = true;
                break;
            }
        }

        if (! $hasAccess) {
            $allowedRolesStr = implode(', ', $this->allowedRoles);
            Response::forbidden(
                "Akses ditolak. Endpoint ini hanya dapat diakses oleh: {$allowedRolesStr}"
            );
        }

        // User has access, continue to next middleware/controller
    }

    /**
     * Check if authenticated user has specific role
     *
     * @param  string  $roleName  Role name to check
     */
    public static function hasRole(string $roleName): bool
    {
        $authUser = AuthMiddleware::getAuthUser();

        if (! $authUser) {
            return false;
        }

        $userRoles = $authUser['roles'] ?? [];

        return in_array($roleName, $userRoles);
    }

    /**
     * Check if authenticated user has any of the specified roles
     *
     * @param  array  $roleNames  Array of role names
     */
    public static function hasAnyRole(array $roleNames): bool
    {
        $authUser = AuthMiddleware::getAuthUser();

        if (! $authUser) {
            return false;
        }

        $userRoles = $authUser['roles'] ?? [];

        foreach ($roleNames as $roleName) {
            if (in_array($roleName, $userRoles)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Check if authenticated user has all of the specified roles
     *
     * @param  array  $roleNames  Array of role names
     */
    public static function hasAllRoles(array $roleNames): bool
    {
        $authUser = AuthMiddleware::getAuthUser();

        if (! $authUser) {
            return false;
        }

        $userRoles = $authUser['roles'] ?? [];

        foreach ($roleNames as $roleName) {
            if (! in_array($roleName, $userRoles)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Require specific role (throw exception if not authorized)
     *
     * @param  string  $roleName  Role name required
     */
    public static function requireRole(string $roleName): void
    {
        if (! self::hasRole($roleName)) {
            Response::forbidden("Akses ditolak. Endpoint ini hanya dapat diakses oleh: {$roleName}");
        }
    }

    /**
     * Require any of the specified roles
     *
     * @param  array  $roleNames  Array of role names
     */
    public static function requireAnyRole(array $roleNames): void
    {
        if (! self::hasAnyRole($roleNames)) {
            $rolesStr = implode(', ', $roleNames);
            Response::forbidden("Akses ditolak. Endpoint ini hanya dapat diakses oleh: {$rolesStr}");
        }
    }

    /**
     * Get all roles of authenticated user
     *
     * @return array Array of role names
     */
    public static function getUserRoles(): array
    {
        $authUser = AuthMiddleware::getAuthUser();

        if (! $authUser) {
            return [];
        }

        return $authUser['roles'] ?? [];
    }

    /**
     * Check if user is Admin
     */
    public static function isAdmin(): bool
    {
        return self::hasRole('Admin');
    }

    /**
     * Check if user is Reviewer
     */
    public static function isReviewer(): bool
    {
        return self::hasRole('Reviewer');
    }
}

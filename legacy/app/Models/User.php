<?php

namespace App\Models;

use App\Core\Model;
use PDO;

class User extends Model
{
    protected $table = 'm_users';

    protected $primaryKey = 'user_id';

    /**
     * Find user by ID
     */
    public function findById($userId)
    {
        $stmt = $this->db->prepare('
            SELECT 
                user_id, 
                username, 
                nama_lengkap, 
                email, 
                created_at
            FROM m_users 
            WHERE user_id = ?
        ');
        $stmt->execute([$userId]);

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Find user by username (dengan role)
     */
    public function findByUsername($username)
    {
        $stmt = $this->db->prepare('
            SELECT 
                u.user_id, 
                u.username, 
                u.password_hash, 
                u.nama_lengkap, 
                u.email,
                u.created_at,
                r.nama_role as roles
            FROM 
                m_users u
            LEFT JOIN 
                m_roles r ON u.role_id = r.role_id
            WHERE 
                u.username = ?
        ');
        $stmt->execute([$username]);

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Find user by email
     */
    public function findByEmail($email)
    {
        $stmt = $this->db->prepare('
            SELECT 
                u.user_id, 
                u.username, 
                u.password_hash, 
                u.nama_lengkap, 
                u.email,
                u.created_at,
                r.nama_role as roles
            FROM 
                m_users u
            LEFT JOIN 
                m_roles r ON u.role_id = r.role_id
            WHERE 
                u.email = ?
        ');
        $stmt->execute([$email]);

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Find user by username and email
     */
    public function findByUsernameAndEmail($username, $email)
    {
        $stmt = $this->db->prepare('
            SELECT 
                u.user_id, 
                u.username, 
                u.nama_lengkap, 
                u.email
            FROM 
                m_users u
            WHERE 
                u.username = ? AND u.email = ?
        ');
        $stmt->execute([$username, $email]);

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Get user with roles (untuk response API)
     */
    public function getUserWithRoles($userId)
    {
        $stmt = $this->db->prepare('
            SELECT 
                u.user_id, 
                u.username, 
                u.nama_lengkap, 
                u.email,
                u.created_at,
                r.nama_role as roles
            FROM 
                m_users u
            LEFT JOIN 
                m_roles r ON u.role_id = r.role_id
            WHERE 
                u.user_id = ?
        ');
        $stmt->execute([$userId]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        // Convert roles dari string ke array
        if ($user && $user['roles']) {
            $user['roles'] = [$user['roles']];
        } elseif ($user) {
            $user['roles'] = [];
        }

        return $user;
    }

    /**
     * Verify password
     */
    public function verifyPassword($password, $hash)
    {
        return password_verify($password, $hash);
    }

    /**
     * Create new user dengan hashed password
     */
    public function createUser($data)
    {
        // Hash password
        $hashedPassword = password_hash($data['password'], PASSWORD_BCRYPT);

        $stmt = $this->db->prepare('
            INSERT INTO m_users 
            (username, password_hash, nama_lengkap, email, role_id, created_at) 
            VALUES 
            (?, ?, ?, ?, ?, NOW())
        ');

        $stmt->execute([
            $data['username'],
            $hashedPassword,
            $data['nama_lengkap'],
            $data['email'],
            $data['role_id'],
        ]);

        return $this->db->lastInsertId();
    }

    /**
     * Update user profile (tanpa password)
     */
    public function updateProfile($userId, $data)
    {
        $stmt = $this->db->prepare('
            UPDATE m_users 
            SET 
                nama_lengkap = ?,
                email = ?
            WHERE user_id = ?
        ');

        return $stmt->execute([
            $data['nama_lengkap'],
            $data['email'],
            $userId,
        ]);
    }

    /**
     * Update password user
     */
    public function updatePassword($userId, $newPassword)
    {
        $hashedPassword = password_hash($newPassword, PASSWORD_BCRYPT);

        $stmt = $this->db->prepare('
            UPDATE m_users 
            SET password_hash = ? 
            WHERE user_id = ?
        ');

        return $stmt->execute([
            $hashedPassword,
            $userId,
        ]);
    }

    /**
     * Check if username exists (untuk validasi)
     */
    public function usernameExists($username, $excludeUserId = null)
    {
        if ($excludeUserId) {
            $stmt = $this->db->prepare('
                SELECT COUNT(*) as total 
                FROM m_users 
                WHERE username = ? AND user_id != ?
            ');
            $stmt->execute([$username, $excludeUserId]);
        } else {
            $stmt = $this->db->prepare('
                SELECT COUNT(*) as total 
                FROM m_users 
                WHERE username = ?
            ');
            $stmt->execute([$username]);
        }

        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        return $result['total'] > 0;
    }

    /**
     * Check if email exists (untuk validasi)
     */
    public function emailExists($email, $excludeUserId = null)
    {
        if ($excludeUserId) {
            $stmt = $this->db->prepare('
                SELECT COUNT(*) as total 
                FROM m_users 
                WHERE email = ? AND user_id != ?
            ');
            $stmt->execute([$email, $excludeUserId]);
        } else {
            $stmt = $this->db->prepare('
                SELECT COUNT(*) as total 
                FROM m_users 
                WHERE email = ?
            ');
            $stmt->execute([$email]);
        }

        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        return $result['total'] > 0;
    }

    /**
     * Get all users with their roles
     */
    public function getAllUsersWithRoles($excludeUserId = null)
    {
        $sql = '
            SELECT 
                u.user_id,
                u.username,
                u.nama_lengkap,
                u.email,
                u.created_at,
                r.nama_role as roles
            FROM 
                m_users u
            LEFT JOIN 
                m_roles r ON u.role_id = r.role_id
        ';

        $params = [];
        if ($excludeUserId) {
            $sql .= ' WHERE u.user_id != ?';
            $params[] = $excludeUserId;
        }

        $sql .= '
            ORDER BY
                u.created_at DESC
        ';

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Convert role dari string ke array untuk setiap user
        foreach ($users as &$user) {
            $user['roles'] = $user['roles'] ? [$user['roles']] : [];
        }

        return $users;
    }

    /**
     * Delete user
     */
    public function deleteUser($userId)
    {
        $stmt = $this->db->prepare('DELETE FROM m_users WHERE user_id = ?');

        return $stmt->execute([$userId]);
    }

    /**
     * Update user role
     */
    public function updateUserRole($userId, $roleId)
    {
        $stmt = $this->db->prepare('
            UPDATE m_users 
            SET role_id = ? 
            WHERE user_id = ?
        ');

        return $stmt->execute([
            $roleId,
            $userId,
        ]);
    }

    /**
     * Find users by role id
     */
    public function findByRoleId($roleId)
    {
        $stmt = $this->db->prepare('
            SELECT
                user_id,
                username,
                nama_lengkap,
                email,
                created_at
            FROM
                m_users
            WHERE
                role_id = ?
        ');
        $stmt->execute([$roleId]);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Find a Verifikator user based on tipe_kegiatan_id.
     * Assumes a convention like 'verifikatorX' for username where X is tipe_kegiatan_id.
     */
    public function findVerifikatorByTipeKegiatanId(int $tipeKegiatanId)
    {
        // Role ID for Verifikator is 2
        $verifikatorRoleId = 2;
        $username = 'verifikator'.$tipeKegiatanId;

        $stmt = $this->db->prepare('
            SELECT
                user_id,
                username,
                nama_lengkap,
                email
            FROM
                m_users
            WHERE
                username = ? AND role_id = ?
        ');
        $stmt->execute([$username, $verifikatorRoleId]);

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
}

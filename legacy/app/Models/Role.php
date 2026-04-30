<?php

namespace App\Models;

use App\Core\Database;

class Role
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    /**
     * Find role by ID
     */
    public function findById($roleId)
    {
        $this->db->query('SELECT * FROM m_roles WHERE role_id = :role_id');
        $this->db->bind(':role_id', $roleId);

        return $this->db->single();
    }

    /**
     * Find role by name
     */
    public function findByName($roleName)
    {
        $this->db->query('SELECT * FROM m_roles WHERE nama_role = :nama_role');
        $this->db->bind(':nama_role', $roleName);

        return $this->db->single();
    }

    /**
     * Get all roles
     */
    public function getAll()
    {
        $this->db->query('SELECT * FROM m_roles ORDER BY nama_role');

        return $this->db->resultSet();
    }

    /**
     * Check if role exists by name
     */
    public function roleExists($roleName)
    {
        $this->db->query('SELECT COUNT(*) as total FROM m_roles WHERE nama_role = :nama_role');
        $this->db->bind(':nama_role', $roleName);
        $result = $this->db->single();

        return $result['total'] > 0;
    }

    /**
     * Get roles by IDs
     */
    public function findByIds($roleIds)
    {
        if (empty($roleIds)) {
            return [];
        }

        $placeholders = implode(',', array_fill(0, count($roleIds), '?'));
        $this->db->query("SELECT * FROM m_roles WHERE role_id IN ($placeholders)");

        foreach ($roleIds as $index => $roleId) {
            $this->db->bind($index + 1, $roleId);
        }

        return $this->db->resultSet();
    }

    /**
     * Create new role
     */
    public function createRole($data)
    {
        $this->db->query('
            INSERT INTO m_roles (nama_role, deskripsi) 
            VALUES (:nama_role, :deskripsi)
        ');

        $this->db->bind(':nama_role', $data['nama_role']);
        $this->db->bind(':deskripsi', $data['deskripsi'] ?? null);

        $this->db->execute();

        return $this->db->lastInsertId();
    }
}

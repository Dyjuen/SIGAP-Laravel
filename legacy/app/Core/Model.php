<?php

namespace App\Core;

use PDO;

abstract class Model
{
    protected $db;

    protected $table;

    protected $primaryKey = 'id';

    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
    }

    /**
     * Find record by ID
     */
    public function find($id)
    {
        $stmt = $this->db->prepare("SELECT * FROM {$this->table} WHERE {$this->primaryKey} = ?");
        $stmt->execute([$id]);

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Find all records
     */
    public function findAll()
    {
        $stmt = $this->db->query("SELECT * FROM {$this->table}");

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Find by specific column
     */
    public function findBy($column, $value)
    {
        $stmt = $this->db->prepare("SELECT * FROM {$this->table} WHERE {$column} = ?");
        $stmt->execute([$value]);

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Find all by specific column
     */
    public function findAllBy($column, $value)
    {
        $stmt = $this->db->prepare("SELECT * FROM {$this->table} WHERE {$column} = ?");
        $stmt->execute([$value]);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Create new record
     */
    public function create(array $data)
    {
        $columns = array_keys($data);
        $values = array_values($data);

        $placeholders = str_repeat('?,', count($columns) - 1).'?';
        $columnList = implode(',', $columns);

        $sql = "INSERT INTO {$this->table} ({$columnList}) VALUES ({$placeholders})";
        $stmt = $this->db->prepare($sql);
        $stmt->execute($values);

        return $this->db->lastInsertId();
    }

    /**
     * Update record by ID
     */
    public function update($id, array $data)
    {
        $columns = array_keys($data);
        $values = array_values($data);

        $setClause = implode(' = ?, ', $columns).' = ?';

        $sql = "UPDATE {$this->table} SET {$setClause} WHERE {$this->primaryKey} = ?";
        $stmt = $this->db->prepare($sql);

        $values[] = $id;

        return $stmt->execute($values);
    }

    /**
     * Delete record by ID
     */
    public function delete($id)
    {
        $stmt = $this->db->prepare("DELETE FROM {$this->table} WHERE {$this->primaryKey} = ?");

        return $stmt->execute([$id]);
    }

    /**
     * Count records
     */
    public function count()
    {
        $stmt = $this->db->query("SELECT COUNT(*) as total FROM {$this->table}");
        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        return (int) $result['total'];
    }

    /**
     * Check if record exists
     */
    public function exists($id)
    {
        $stmt = $this->db->prepare("SELECT COUNT(*) as total FROM {$this->table} WHERE {$this->primaryKey} = ?");
        $stmt->execute([$id]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        return (int) $result['total'] > 0;
    }

    /**
     * Execute raw query
     */
    protected function query($sql, $params = [])
    {
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);

        return $stmt;
    }

    public function getDB()
    {
        return $this->db;
    }
}

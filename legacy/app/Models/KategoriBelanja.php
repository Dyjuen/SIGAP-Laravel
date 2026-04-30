<?php

namespace App\Models;

use App\Core\Model;

class KategoriBelanja extends Model
{
    protected $table = 'm_kategori_belanja';

    protected $primaryKey = 'kategori_belanja_id';

    public function findAll()
    {
        $stmt = $this->db->query("
            SELECT * FROM {$this->table} 
            WHERE is_active = 1 
            ORDER BY urutan ASC
        ");

        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    public function findById($id)
    {
        $this->db->query("SELECT * FROM {$this->table} WHERE {$this->primaryKey} = :id");
        $this->db->bind(':id', $id);

        return $this->db->single();
    }

    public function findByKode($kode)
    {
        $this->db->query("SELECT * FROM {$this->table} WHERE kode = :kode AND is_active = 1");
        $this->db->bind(':kode', $kode);

        return $this->db->single();
    }
}

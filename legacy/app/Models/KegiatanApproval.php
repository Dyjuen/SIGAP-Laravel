<?php

namespace App\Models;

use App\Core\Model;

class KegiatanApproval extends Model
{
    protected $table = 't_kegiatan_approval';

    protected $primaryKey = 'approval_kegiatan_id';

    /**
     * Find the latest note for a given kegiatan ID and approval level.
     *
     * @param  int  $kegiatanId  The ID of the kegiatan.
     * @param  string  $level  The approval level (e.g., 'PPK').
     * @return array|false The approval record or false if not found.
     */
    public function findCatatanByKegiatanIdAndLevel($kegiatanId, $level)
    {
        $sql = "SELECT catatan, updated_at 
                FROM {$this->table} 
                WHERE kegiatan_id = :kegiatan_id 
                AND approval_level = :approval_level 
                AND catatan IS NOT NULL
                ORDER BY updated_at DESC 
                LIMIT 1";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'kegiatan_id' => $kegiatanId,
            'approval_level' => $level,
        ]);

        return $stmt->fetch();
    }

    public function findAllByKegiatanId(int $kegiatanId)
    {
        $sql = "SELECT * FROM {$this->table} WHERE kegiatan_id = ? ORDER BY approval_kegiatan_id ASC";

        return $this->query($sql, [$kegiatanId])->fetchAll();
    }

    /**
     * Find a specific approval record by kegiatan ID and approval level.
     *
     * @param  int  $kegiatanId  The ID of the kegiatan.
     * @param  string  $level  The approval level.
     * @return array|false The full approval record or false if not found.
     */
    public function findByKegiatanIdAndLevel($kegiatanId, $level)
    {
        $sql = "SELECT * FROM {$this->table} 
                WHERE kegiatan_id = :kegiatan_id 
                AND approval_level = :approval_level 
                LIMIT 1";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'kegiatan_id' => $kegiatanId,
            'approval_level' => $level,
        ]);

        return $stmt->fetch();
    }

    /**
     * Find the currently active approval step for a given kegiatan ID.
     *
     * @param  int  $kegiatanId  The ID of the kegiatan.
     * @return array|false The approval record or false if not found.
     */
    public function findActiveByKegiatanId(int $kegiatanId)
    {
        $sql = "SELECT * FROM {$this->table} 
                WHERE kegiatan_id = :kegiatan_id 
                AND status = 'Aktif' 
                LIMIT 1";

        $stmt = $this->db->prepare($sql);
        $stmt->execute(['kegiatan_id' => $kegiatanId]);

        return $stmt->fetch();
    }
}

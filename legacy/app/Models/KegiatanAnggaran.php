<?php

namespace App\Models;

use App\Core\Model;
use PDO;

class KegiatanAnggaran extends Model
{
    protected $table = 't_kegiatan_anggaran';

    protected $primaryKey = 'anggaran_id';

    /**
     * Get anggaran items by kegiatan_id by joining through t_kegiatan and t_telaah
     */
    public function getByKegiatanId($kegiatanId)
    {
        $sql = 'SELECT ta.* 
                FROM t_kegiatan_anggaran ta
                JOIN t_kegiatan k ON ta.kegiatan_id = k.kegiatan_id
                WHERE k.kegiatan_id = ?';

        return $this->query($sql, [$kegiatanId])->fetchAll(PDO::FETCH_ASSOC);
    }
}

<?php

namespace App\Models;

use App\Core\Model;
use PDO;

class KegiatanLogStatus extends Model
{
    protected $table = 't_kegiatan_log_status';

    protected $primaryKey = 'log_id';

    /**
     * Get logs by kegiatan_id by joining through t_kegiatan and t_kak
     */
    public function getByKegiatanId($kegiatanId)
    {
        $sql = 'SELECT kls.*, u.nama_lengkap as actor_nama, s_lama.nama_status as status_lama, s_baru.nama_status as status_baru
                FROM t_kegiatan_log_status kls
                JOIN t_kegiatan k ON kls.kegiatan_id = k.kegiatan_id
                JOIN m_users u ON kls.actor_user_id = u.user_id
                LEFT JOIN m_kegiatan_status s_lama ON kls.status_id_lama = s_lama.status_id
                JOIN m_kegiatan_status s_baru ON kls.status_id_baru = s_baru.status_id
                WHERE k.kegiatan_id = ?
                ORDER BY kls.timestamp ASC';

        return $this->query($sql, [$kegiatanId])->fetchAll(PDO::FETCH_ASSOC);
    }
}

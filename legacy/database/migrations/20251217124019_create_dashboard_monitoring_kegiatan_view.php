<?php

declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class CreateDashboardMonitoringKegiatanView extends AbstractMigration
{
    /**
     * Change Method.
     *
     * Write your reversible migrations using this method.
     *
     * More information on writing migrations is available here:
     * https://book.cakephp.org/phinx/0/en/migrations.html#the-change-method
     *
     * Remember to call "create()" or "update()" and NOT "save()" when working
     * with the Table class.
     */
    public function change(): void
    {
        $this->execute("
            CREATE OR REPLACE VIEW v_dashboard_monitoring_kegiatan AS
            SELECT
                k.kegiatan_id,
                t.nama_kegiatan,
                u.nama_lengkap AS pengusul_nama,
                ks.nama_status,
                ks.status_id,
                COALESCE(active_approval.approval_level, ks.nama_status) AS status_saat_ini,
                active_approval.status AS status_approval_aktif,
                COALESCE(pencairan_sum.total_dicairkan, 0) AS dana_dicairkan,
                t.pengusul_user_id,
                active_approval.approval_level,
                k.created_at AS kegiatan_created_at
            FROM
                t_kegiatan k
            JOIN
                t_kak t ON k.kak_id = t.kak_id
            JOIN
                m_users u ON t.pengusul_user_id = u.user_id
            LEFT JOIN
                m_kegiatan_status ks ON t.status_id = ks.status_id
            LEFT JOIN
                t_kegiatan_approval ppk_approval ON k.kegiatan_id = ppk_approval.kegiatan_id AND ppk_approval.approval_level = 'PPK'
            LEFT JOIN
                t_kegiatan_approval active_approval ON k.kegiatan_id = active_approval.kegiatan_id AND active_approval.status IN ('Aktif', 'Revisi')
            LEFT JOIN (
                SELECT
                    kegiatan_id,
                    SUM(jumlah_dicairkan) AS total_dicairkan
                FROM
                    t_pencairan_dana
                GROUP BY
                    kegiatan_id
            ) AS pencairan_sum ON k.kegiatan_id = pencairan_sum.kegiatan_id
            ORDER BY kegiatan_created_at DESC;
        ");
    }
}

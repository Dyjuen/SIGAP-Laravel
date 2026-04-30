<?php

declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class CreateGetKakStatisticsProcedure extends AbstractMigration
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
    public function up(): void
    {
        $this->execute("
            CREATE PROCEDURE sp_get_kak_statistics(IN p_user_id INT)
            BEGIN
                SELECT
                    COUNT(CASE WHEN ks.nama_status = 'Draft' THEN 1 END) as total_draft,
                    COUNT(CASE WHEN ks.nama_status = 'Review Verifikator' THEN 1 END) as total_review_verifikator,
                    COUNT(CASE WHEN ks.nama_status = 'Revisi' THEN 1 END) as total_revisi
                FROM t_kak t
                JOIN m_kegiatan_status ks ON t.status_id = ks.status_id
                WHERE (p_user_id IS NULL OR t.pengusul_user_id = p_user_id);
            END;
        ");
    }

    public function down(): void
    {
        $this->execute('DROP PROCEDURE IF EXISTS sp_get_kak_statistics;');
    }
}

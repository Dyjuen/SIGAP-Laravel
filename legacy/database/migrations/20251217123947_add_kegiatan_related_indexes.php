<?php

declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class AddKegiatanRelatedIndexes extends AbstractMigration
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
        // Indexes for t_kak table
        $kakTable = $this->table('t_kak');
        $kakTable->addIndex(['pengusul_user_id'], ['name' => 'idx_kak_pengusul_user_id'])
            ->addIndex(['status_id'], ['name' => 'idx_kak_status_id'])
            ->addIndex(['tanggal_mulai'], ['name' => 'idx_kak_tanggal_mulai'])
            ->addIndex(['tanggal_selesai'], ['name' => 'idx_kak_tanggal_selesai'])
            ->update();

        // Indexes for t_kegiatan_approval table
        $kegiatanApprovalTable = $this->table('t_kegiatan_approval');
        $kegiatanApprovalTable->addIndex(['kegiatan_id'], ['name' => 'idx_kegiatan_approval_kegiatan_id'])
            ->addIndex(['kegiatan_id', 'approval_level', 'status'], ['name' => 'idx_kegiatan_approval_composite'])
            ->update();

        // Indexes for t_pencairan_dana table
        $pencairanDanaTable = $this->table('t_pencairan_dana');
        $pencairanDanaTable->addIndex(['kegiatan_id'], ['name' => 'idx_pencairan_dana_kegiatan_id'])
            ->update();
    }
}

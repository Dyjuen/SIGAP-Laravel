<?php

declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class CreateTKegiatanLogStatusTable extends AbstractMigration
{
    public function change()
    {
        $table = $this->table('t_kegiatan_log_status', ['id' => false, 'primary_key' => ['log_id']]);

        $table->addColumn('log_id', 'integer', ['identity' => true])
            ->addColumn('kegiatan_id', 'integer')
            ->addColumn('status_id_lama', 'integer', ['null' => true])
            ->addColumn('status_id_baru', 'integer')
            ->addColumn('actor_user_id', 'integer')
            ->addColumn('catatan', 'text', ['null' => true])
            ->addColumn('timestamp', 'timestamp', ['default' => 'CURRENT_TIMESTAMP'])
            ->addForeignKey('kegiatan_id', 't_kegiatan', 'kegiatan_id', [
                'delete' => 'CASCADE',
                'update' => 'CASCADE',
            ])
            ->addForeignKey('status_id_lama', 'm_kegiatan_status', 'status_id', [
                'delete' => 'SET_NULL',
                'update' => 'CASCADE',
            ])
            ->addForeignKey('status_id_baru', 'm_kegiatan_status', 'status_id', [
                'delete' => 'RESTRICT',
                'update' => 'CASCADE',
            ])
            ->addForeignKey('actor_user_id', 'm_users', 'user_id', [
                'delete' => 'RESTRICT',
                'update' => 'CASCADE',
            ])
            ->create();
    }
}

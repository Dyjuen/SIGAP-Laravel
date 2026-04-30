<?php

declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class CreateTKakLogStatusTable extends AbstractMigration
{
    public function change()
    {
        $table = $this->table('t_kak_log_status', ['id' => false, 'primary_key' => ['log_id']]);

        $table->addColumn('log_id', 'integer', ['identity' => true])
            ->addColumn('kak_id', 'integer')
            ->addColumn('status_id_lama', 'integer', ['null' => true])
            ->addColumn('status_id_baru', 'integer')
            ->addColumn('actor_user_id', 'integer')
            ->addColumn('catatan', 'text', ['null' => true])
            ->addColumn('timestamp', 'timestamp', ['default' => 'CURRENT_TIMESTAMP'])
            ->addForeignKey('kak_id', 't_kak', 'kak_id', [
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

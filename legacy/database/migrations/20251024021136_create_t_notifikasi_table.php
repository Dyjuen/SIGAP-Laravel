<?php

declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class CreateTNotifikasiTable extends AbstractMigration
{
    public function change()
    {
        $table = $this->table('t_notifikasi', ['id' => false, 'primary_key' => ['notifikasi_id']]);

        $table->addColumn('notifikasi_id', 'integer', ['identity' => true])
            ->addColumn('penerima_user_id', 'integer')
            ->addColumn('pesan', 'string', ['limit' => 255])
            ->addColumn('link_tujuan', 'string', ['limit' => 255, 'null' => true])
            ->addColumn('is_read', 'integer', ['limit' => 1, 'default' => 0])
            ->addColumn('created_at', 'timestamp', ['default' => 'CURRENT_TIMESTAMP'])
            ->addForeignKey('penerima_user_id', 'm_users', 'user_id', [
                'delete' => 'CASCADE',
                'update' => 'CASCADE',
            ])
            ->addIndex(['penerima_user_id', 'is_read'])
            ->create();
    }
}

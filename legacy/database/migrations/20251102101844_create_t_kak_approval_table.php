<?php

declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class CreateTKakApprovalTable extends AbstractMigration
{
    public function change(): void
    {
        $table = $this->table('t_kak_approval', ['id' => false, 'primary_key' => ['approval_telaah_id']]);
        $table->addColumn('approval_telaah_id', 'integer', ['identity' => true])
            ->addColumn('kak_id', 'integer')
            ->addColumn('approver_user_id', 'integer')
            ->addColumn('status', 'enum', [
                'values' => ['Menunggu', 'Aktif', 'Revisi', 'Disetujui', 'Ditolak'],
                'default' => 'Menunggu',
            ])
            ->addColumn('catatan', 'text', ['null' => true])
            ->addColumn('created_at', 'timestamp', ['default' => 'CURRENT_TIMESTAMP'])
            ->addColumn('updated_at', 'timestamp', ['default' => 'CURRENT_TIMESTAMP', 'update' => 'CURRENT_TIMESTAMP'])
            ->addForeignKey('kak_id', 't_kak', 'kak_id', [
                'delete' => 'CASCADE',
                'update' => 'CASCADE',
            ])
            ->addForeignKey('approver_user_id', 'm_users', 'user_id', [
                'delete' => 'RESTRICT',
                'update' => 'CASCADE',
            ])
            ->create();
    }
}

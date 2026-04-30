<?php

declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class CreateTKegiatanApprovalTable extends AbstractMigration
{
    public function change(): void
    {
        $table = $this->table('t_kegiatan_approval', ['id' => false, 'primary_key' => ['approval_kegiatan_id']]);
        $table->addColumn('approval_kegiatan_id', 'integer', ['identity' => true])
            ->addColumn('kegiatan_id', 'integer')
            ->addColumn('approval_level', 'string', [ // NEW COLUMN
                'limit' => 50,
                'null' => false,
            ])
            ->addColumn('approver_user_id', 'integer', ['null' => true]) // MODIFIED TO BE NULLABLE
            ->addColumn('status', 'enum', [
                'values' => ['Menunggu', 'Aktif', 'Disetujui', 'Revisi'], // MODIFIED ENUM
                'default' => 'Menunggu',
            ])
            ->addColumn('catatan', 'text', ['null' => true])
            ->addColumn('created_at', 'timestamp', ['default' => 'CURRENT_TIMESTAMP'])
            ->addColumn('updated_at', 'timestamp', ['default' => 'CURRENT_TIMESTAMP', 'update' => 'CURRENT_TIMESTAMP'])
            ->addForeignKey('kegiatan_id', 't_kegiatan', 'kegiatan_id', [
                'delete' => 'CASCADE',
                'update' => 'CASCADE',
            ])
            ->addForeignKey('approver_user_id', 'm_users', 'user_id', [
                'delete' => 'SET_NULL', // Changed from RESTRICT due to nullability
                'update' => 'CASCADE',
            ])
            ->create();
    }
}

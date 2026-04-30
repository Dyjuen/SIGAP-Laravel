<?php

declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class AddLampiranHistoryFields extends AbstractMigration
{
    public function change(): void
    {
        $table = $this->table('t_kegiatan_lampiran');

        // Status lampiran: 'pending', 'revision_requested', 'approved', 'archived'
        $table->addColumn('status_lampiran', 'enum', [
            'values' => ['pending', 'revision_requested', 'approved', 'archived'],
            'default' => 'pending',
        ])
        // Catatan dari reviewer (Bendahara/Admin)
            ->addColumn('catatan_reviewer', 'text', ['null' => true])
        // User yang memberikan catatan
            ->addColumn('reviewer_user_id', 'integer', ['null' => true])
        // Tanggal catatan diberikan
            ->addColumn('catatan_tanggal', 'timestamp', ['null' => true])
        // Revisi ke berapa
            ->addColumn('revisi_ke', 'integer', ['default' => 0])
        // Status approval: 'pending', 'approved', 'rejected'
            ->addColumn('status_approval', 'enum', [
                'values' => ['pending', 'approved', 'rejected'],
                'default' => 'pending',
            ])
        // Tanggal approval
            ->addColumn('approval_tanggal', 'timestamp', ['null' => true])
        // Parent lampiran ID (referensi ke lampiran versi sebelumnya)
            ->addColumn('parent_lampiran_id', 'integer', ['null' => true])
        // Updated at
            ->addColumn('updated_at', 'timestamp', ['default' => 'CURRENT_TIMESTAMP', 'update' => 'CURRENT_TIMESTAMP']);

        // Add foreign key untuk reviewer
        $table->addForeignKey('reviewer_user_id', 'm_users', 'user_id', [
            'delete' => 'SET_NULL',
            'update' => 'CASCADE',
        ]);

        // Add foreign key untuk parent lampiran (self-referencing)
        $table->addForeignKey('parent_lampiran_id', 't_kegiatan_lampiran', 'lampiran_id', [
            'delete' => 'SET_NULL',
            'update' => 'CASCADE',
        ]);

        $table->update();
    }
}

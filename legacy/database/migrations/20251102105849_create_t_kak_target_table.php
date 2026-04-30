<?php

declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class CreateTKakTargetTable extends AbstractMigration
{
    public function change(): void
    {
        $table = $this->table('t_kak_target', ['id' => false, 'primary_key' => ['target_id']]);

        $table->addColumn('target_id', 'integer', ['identity' => true])
            ->addColumn('kak_id', 'integer')
            ->addColumn('deskripsi_target', 'text')
            ->addColumn('bulan_indikator', 'string', ['limit' => 20, 'null' => true])
            ->addColumn('persentase_target', 'decimal', ['precision' => 5, 'scale' => 2, 'null' => true])
            ->addColumn('catatan_verifikator', 'text', ['null' => true])
            ->addForeignKey('kak_id', 't_kak', 'kak_id', [
                'delete' => 'CASCADE',
                'update' => 'CASCADE',
            ])
            ->create();
    }
}

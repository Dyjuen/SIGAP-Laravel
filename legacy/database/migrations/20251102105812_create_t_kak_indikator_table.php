<?php

declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class CreateTKakIndikatorTable extends AbstractMigration
{
    public function change()
    {
        $table = $this->table('t_kak_indikator', ['id' => false, 'primary_key' => ['indikator_id']]);

        $table->addColumn('indikator_id', 'integer', ['identity' => true])
            ->addColumn('kak_id', 'integer')
            ->addColumn('deskripsi_indikator', 'text')
            ->addColumn('catatan_verifikator', 'text', ['null' => true])
            ->addForeignKey('kak_id', 't_kak', 'kak_id', [
                'delete' => 'CASCADE',
                'update' => 'CASCADE',
            ])
            ->create();
    }
}

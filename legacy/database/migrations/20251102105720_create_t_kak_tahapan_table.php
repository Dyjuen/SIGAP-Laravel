<?php

declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class CreateTKakTahapanTable extends AbstractMigration
{
    public function change()
    {
        $table = $this->table('t_kak_tahapan', ['id' => false, 'primary_key' => ['tahapan_id']]);

        $table->addColumn('tahapan_id', 'integer', ['identity' => true])
            ->addColumn('kak_id', 'integer')
            ->addColumn('nama_tahapan', 'string', ['limit' => 255])
            ->addColumn('urutan', 'integer')
            ->addColumn('catatan_verifikator', 'text', ['null' => true])
            ->addForeignKey('kak_id', 't_kak', 'kak_id', [
                'delete' => 'CASCADE',
                'update' => 'CASCADE',
            ])
            ->create();
    }
}

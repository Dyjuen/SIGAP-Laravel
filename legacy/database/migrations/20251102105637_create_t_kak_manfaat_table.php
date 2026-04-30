<?php

declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class CreateTKakManfaatTable extends AbstractMigration
{
    public function change()
    {
        $table = $this->table('t_kak_manfaat', ['id' => false, 'primary_key' => ['manfaat_id']]);

        $table->addColumn('manfaat_id', 'integer', ['identity' => true])
            ->addColumn('kak_id', 'integer')
            ->addColumn('manfaat', 'text')
            ->addColumn('catatan_manfaat', 'text', ['null' => true])
            ->addForeignKey('kak_id', 't_kak', 'kak_id', [
                'delete' => 'CASCADE',
                'update' => 'CASCADE',
            ])
            ->create();
    }
}

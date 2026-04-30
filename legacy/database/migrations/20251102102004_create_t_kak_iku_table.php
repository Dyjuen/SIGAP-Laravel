<?php

declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class CreateTKakIkuTable extends AbstractMigration
{
    public function change(): void
    {
        $table = $this->table('t_kak_iku', ['id' => false, 'primary_key' => ['kak_id', 'iku_id']]);

        $table->addColumn('kak_id', 'integer', ['null' => false])
            ->addColumn('iku_id', 'integer', ['null' => false])
            ->addColumn('persentase_target', 'decimal', ['precision' => 5, 'scale' => 2, 'null' => true])
            ->addColumn('catatan_verifikator', 'text', ['null' => true])
            ->addForeignKey('kak_id', 't_kak', 'kak_id', [
                'delete' => 'CASCADE',
                'update' => 'CASCADE',
            ])
            ->addForeignKey('iku_id', 'm_iku', 'iku_id', [
                'delete' => 'CASCADE',
                'update' => 'CASCADE',
            ])
            ->create();
    }
}

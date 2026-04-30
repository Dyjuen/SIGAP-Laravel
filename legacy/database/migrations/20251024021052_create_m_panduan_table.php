<?php

declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class CreateMPanduanTable extends AbstractMigration
{
    public function change()
    {
        $table = $this->table('m_panduan', ['id' => false, 'primary_key' => ['panduan_id']]);

        $table->addColumn('panduan_id', 'integer', ['identity' => true])
            ->addColumn('judul_panduan', 'string', ['limit' => 200])
            ->addColumn('target_role_id', 'integer', ['null' => true])
            ->addForeignKey('target_role_id', 'm_roles', 'role_id', [
                'delete' => 'SET_NULL',
                'update' => 'CASCADE',
            ])
            ->create();
    }
}

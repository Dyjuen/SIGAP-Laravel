<?php

declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class CreateMRolesTable extends AbstractMigration
{
    public function change()
    {
        $table = $this->table('m_roles', ['id' => false, 'primary_key' => ['role_id']]);

        $table->addColumn('role_id', 'integer', ['identity' => true])
            ->addColumn('nama_role', 'string', ['limit' => 50])
            ->addIndex(['nama_role'], ['unique' => true])
            ->create();
    }
}

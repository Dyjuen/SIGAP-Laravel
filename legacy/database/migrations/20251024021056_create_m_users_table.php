<?php

declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class CreateMUsersTable extends AbstractMigration
{
    public function change()
    {
        $table = $this->table('m_users', ['id' => false, 'primary_key' => ['user_id']]);

        $table->addColumn('user_id', 'integer', ['identity' => true])
            ->addColumn('username', 'string', ['limit' => 50])
            ->addColumn('password_hash', 'string', ['limit' => 255])
            ->addColumn('nama_lengkap', 'string', ['limit' => 100])
            ->addColumn('email', 'string', ['limit' => 100])
            ->addColumn('role_id', 'integer', ['null' => true])
            ->addColumn('created_at', 'timestamp', ['default' => 'CURRENT_TIMESTAMP'])
            ->addColumn('updated_at', 'timestamp', ['default' => 'CURRENT_TIMESTAMP', 'update' => 'CURRENT_TIMESTAMP'])
            ->addIndex(['username'], ['unique' => true])
            ->addIndex(['email'], ['unique' => true])
            ->addForeignKey('role_id', 'm_roles', 'role_id', ['delete' => 'SET_NULL', 'update' => 'CASCADE'])
            ->create();
    }
}

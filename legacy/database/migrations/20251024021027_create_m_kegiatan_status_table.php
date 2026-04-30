<?php

declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class CreateMKegiatanStatusTable extends AbstractMigration
{
    public function change()
    {
        $table = $this->table('m_kegiatan_status', ['id' => false, 'primary_key' => ['status_id']]);

        $table->addColumn('status_id', 'integer', ['identity' => true])
            ->addColumn('nama_status', 'string', ['limit' => 50])
            ->addIndex(['nama_status'], ['unique' => true])
            ->create();
    }
}

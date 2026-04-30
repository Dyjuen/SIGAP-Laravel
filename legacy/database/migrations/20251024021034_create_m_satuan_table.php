<?php

declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class CreateMSatuanTable extends AbstractMigration
{
    public function change()
    {
        $table = $this->table('m_satuan', ['id' => false, 'primary_key' => ['satuan_id']]);

        $table->addColumn('satuan_id', 'integer', ['identity' => true])
            ->addColumn('nama_satuan', 'string', ['limit' => 50])
            ->addIndex(['nama_satuan'], ['unique' => true])
            ->create();
    }
}

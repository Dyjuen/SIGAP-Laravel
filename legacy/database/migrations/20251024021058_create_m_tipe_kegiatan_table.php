<?php

use Phinx\Migration\AbstractMigration;

class CreateMTipeKegiatanTable extends AbstractMigration
{
    public function change()
    {
        $table = $this->table('m_tipe_kegiatan', ['id' => false, 'primary_key' => ['tipe_kegiatan_id']]);

        $table->addColumn('tipe_kegiatan_id', 'integer', ['identity' => true])
            ->addColumn('nama_tipe', 'string', ['limit' => 100])
            ->create();
    }
}

<?php

declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class CreateMMataAnggaranTable extends AbstractMigration
{
    public function change()
    {
        $table = $this->table('m_mata_anggaran', ['id' => false, 'primary_key' => ['mata_anggaran_id']]);

        $table->addColumn('mata_anggaran_id', 'integer', ['identity' => true])
            ->addColumn('kode_anggaran', 'string', ['limit' => 50])
            ->addColumn('nama_sumber_dana', 'string', ['limit' => 100, 'null' => true])
            ->addColumn('tahun_anggaran', 'integer', ['limit' => 4, 'null' => true])
            ->addColumn('total_pagu', 'decimal', ['precision' => 15, 'scale' => 2, 'null' => true])
            ->create();
    }
}

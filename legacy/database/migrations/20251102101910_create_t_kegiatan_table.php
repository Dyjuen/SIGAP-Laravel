<?php

declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class CreateTKegiatanTable extends AbstractMigration
{
    public function change(): void
    {
        $table = $this->table('t_kegiatan', ['id' => false, 'primary_key' => ['kegiatan_id']]);

        $table->addColumn('kegiatan_id', 'integer', ['identity' => true])
            ->addColumn('kak_id', 'integer')
            ->addColumn('penanggung_jawab_manual', 'string', ['limit' => 255, 'null' => true])
            ->addColumn('pelaksana_manual', 'string', ['limit' => 255, 'null' => true])
            ->addColumn('tanggal_mulai_final', 'date', ['null' => true])
            ->addColumn('surat_pengantar_path', 'string', ['limit' => 255, 'null' => true])
            ->addColumn('tgl_batas_lpj', 'datetime', ['null' => true])
            ->addColumn('lpj_submitted_at', 'datetime', ['null' => true])
            ->addColumn('created_at', 'timestamp', ['default' => 'CURRENT_TIMESTAMP'])
            ->addColumn('updated_at', 'timestamp', ['default' => 'CURRENT_TIMESTAMP', 'update' => 'CURRENT_TIMESTAMP'])

              // Foreign Key t_kak
            ->addForeignKey('kak_id', 't_kak', 'kak_id', [
                'delete' => 'CASCADE',
                'update' => 'CASCADE',
            ])

              // One-to-one relationship
            ->addIndex(['kak_id'], ['unique' => true])
            ->create();
    }
}

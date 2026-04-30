<?php

declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class CreateTKegiatanLampiranTable extends AbstractMigration
{
    public function change()
    {
        $table = $this->table('t_kegiatan_lampiran', ['id' => false, 'primary_key' => ['lampiran_id']]);

        $table->addColumn('lampiran_id', 'integer', ['identity' => true])
            ->addColumn('anggaran_id', 'integer')
            ->addColumn('nama_file_asli', 'string', ['limit' => 255])
            ->addColumn('path_file_disimpan', 'string', ['limit' => 255])
            ->addColumn('uploader_user_id', 'integer')
            ->addColumn('created_at', 'timestamp', ['default' => 'CURRENT_TIMESTAMP'])
            ->addForeignKey('anggaran_id', 't_kak_anggaran', 'anggaran_id', [
                'delete' => 'CASCADE',
                'update' => 'CASCADE',
            ])
            ->addForeignKey('uploader_user_id', 'm_users', 'user_id', [
                'delete' => 'RESTRICT',
                'update' => 'CASCADE',
            ])
            ->create();
    }
}

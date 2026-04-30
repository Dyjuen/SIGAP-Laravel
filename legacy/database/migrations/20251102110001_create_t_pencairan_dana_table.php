<?php

use Phinx\Migration\AbstractMigration;

class CreateTPencairanDanaTable extends AbstractMigration
{
    public function change()
    {
        $this->table('t_pencairan_dana', ['id' => false, 'primary_key' => ['pencairan_id']])
            ->addColumn('pencairan_id', 'integer', ['identity' => true])
            ->addColumn('kegiatan_id', 'integer')
            ->addColumn('tanggal_pencairan', 'date')
            ->addColumn('jumlah_dicairkan', 'decimal', ['precision' => 15, 'scale' => 2])
            ->addColumn('keterangan', 'text', ['null' => true])
            ->addColumn('bukti_pencairan_path', 'string', ['limit' => 255, 'null' => true])
            ->addColumn('created_by', 'integer')
            ->addColumn('created_at', 'timestamp', ['default' => 'CURRENT_TIMESTAMP'])
            ->addForeignKey('kegiatan_id', 't_kegiatan', 'kegiatan_id', ['delete' => 'CASCADE', 'update' => 'CASCADE'])
            ->addForeignKey('created_by', 'm_users', 'user_id', ['delete' => 'RESTRICT', 'update' => 'CASCADE'])
            ->create();
    }
}

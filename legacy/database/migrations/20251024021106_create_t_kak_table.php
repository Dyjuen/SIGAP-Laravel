<?php

declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class CreateTKakTable extends AbstractMigration
{
    public function change()
    {
        $table = $this->table('t_kak', ['id' => false, 'primary_key' => ['kak_id']]);

        $table->addColumn('kak_id', 'integer', ['identity' => true])
            ->addColumn('tipe_kegiatan_id', 'integer', ['null' => true])
            ->addColumn('nama_kegiatan', 'string', ['limit' => 200])
            ->addColumn('deskripsi_kegiatan', 'text')
            ->addColumn('sasaran_utama', 'text', ['null' => true])
            ->addColumn('metode_pelaksanaan', 'text', ['null' => true])
            ->addColumn('kurun_waktu_pelaksanaan', 'string', ['limit' => 255, 'null' => true])
            ->addColumn('tanggal_mulai', 'date', ['null' => true])
            ->addColumn('tanggal_selesai', 'date', ['null' => true])
            ->addColumn('lokasi', 'string', ['limit' => 200, 'null' => true])
            ->addColumn('pengusul_user_id', 'integer')
            ->addColumn('mata_anggaran_id', 'integer', ['null' => true])
            ->addColumn('status_id', 'integer')
            ->addColumn('catatan_nama_kegiatan', 'text', ['null' => true])
            ->addColumn('catatan_deskripsi_kegiatan', 'text', ['null' => true])
            ->addColumn('catatan_sasaran_utama', 'text', ['null' => true])
            ->addColumn('catatan_metode_pelaksanaan', 'text', ['null' => true])
            ->addColumn('catatan_lokasi', 'text', ['null' => true])
            ->addColumn('catatan_tanggal', 'text', ['null' => true])
            ->addColumn('created_at', 'timestamp', ['default' => 'CURRENT_TIMESTAMP'])
            ->addColumn('updated_at', 'timestamp', ['default' => 'CURRENT_TIMESTAMP', 'update' => 'CURRENT_TIMESTAMP'])
            ->addForeignKey('tipe_kegiatan_id', 'm_tipe_kegiatan', 'tipe_kegiatan_id', ['delete' => 'SET_NULL', 'update' => 'CASCADE'])
            ->addForeignKey('pengusul_user_id', 'm_users', 'user_id', ['delete' => 'RESTRICT', 'update' => 'CASCADE'])
            ->addForeignKey('mata_anggaran_id', 'm_mata_anggaran', 'mata_anggaran_id', ['delete' => 'SET_NULL', 'update' => 'CASCADE'])
            ->addForeignKey('status_id', 'm_kegiatan_status', 'status_id', ['delete' => 'RESTRICT', 'update' => 'CASCADE'])
            ->create();
    }
}

<?php

declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class CreateMKategoriBelanjaTable extends AbstractMigration
{
    /**
     * Change Method.
     *
     * Write your reversible migrations using this method.
     *
     * More information on writing migrations is available here:
     * https://book.cakephp.org/phinx/0/en/migrations.html#the-change-method
     *
     * Remember to call "create()" or "update()" and NOT "save()" when working
     * with the Table class.
     */
    public function change(): void
    {
        $table = $this->table('m_kategori_belanja', ['id' => false, 'primary_key' => ['kategori_belanja_id']]);

        $table->addColumn('kategori_belanja_id', 'integer', ['identity' => true])
            ->addColumn('kode', 'string', ['limit' => 20])
            ->addColumn('nama', 'string', ['limit' => 100])
            ->addColumn('keterangan', 'text', ['null' => true])
            ->addColumn('urutan', 'integer', ['default' => 0])
            ->addColumn('is_active', 'boolean', ['default' => true])
            ->addColumn('created_at', 'timestamp', ['default' => 'CURRENT_TIMESTAMP'])
            ->addColumn('updated_at', 'timestamp', ['default' => 'CURRENT_TIMESTAMP', 'update' => 'CURRENT_TIMESTAMP'])
            ->addIndex(['kode'], ['unique' => true])
            ->addIndex(['is_active'])
            ->create();
    }
}

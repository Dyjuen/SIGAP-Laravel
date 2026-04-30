<?php

declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class AddIndexToPanduanTargetRoleId extends AbstractMigration
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
        $table = $this->table('m_panduan');
        $table->addIndex(['target_role_id'], ['name' => 'idx_panduan_target_role_id'])
            ->update();
    }
}

<?php

declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class AlterTKakIkuChangePersentaseToTargetSatuan extends AbstractMigration
{
    public function change(): void
    {
        $table = $this->table('t_kak_iku');

        // Remove persentase_target column
        $table->removeColumn('persentase_target');

        // Add target column (number)
        $table->addColumn('target', 'integer', ['null' => false, 'default' => 0, 'after' => 'iku_id']);

        // Add satuan_id column
        $table->addColumn('satuan_id', 'integer', ['null' => true, 'after' => 'target']);

        // Add foreign key for satuan_id
        $table->addForeignKey('satuan_id', 'm_satuan', 'satuan_id', [
            'delete' => 'SET_NULL',
            'update' => 'CASCADE',
        ]);

        $table->update();
    }
}

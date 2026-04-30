<?php

declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class AddBendaharaSetorToApprovalLevel extends AbstractMigration
{
    public function change(): void
    {
        $table = $this->table('t_kegiatan_approval');
        $table->changeColumn('approval_level', 'enum', [
            'values' => ['PPK', 'Wadir2', 'Bendahara-Cair', 'Bendahara-LPJ', 'Bendahara-Setor'],
            'null' => false,
        ])
            ->save();
    }
}

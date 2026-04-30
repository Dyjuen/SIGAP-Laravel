<?php

declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class AddSetorFisikToKegiatanApprovalStatus extends AbstractMigration
{
    public function change(): void
    {
        $table = $this->table('t_kegiatan_approval');
        $table->changeColumn('status', 'enum', [
            'values' => ['Menunggu', 'Aktif', 'Disetujui', 'Revisi', 'Selesai'],
            'default' => 'Menunggu',
        ])
            ->save();
    }
}

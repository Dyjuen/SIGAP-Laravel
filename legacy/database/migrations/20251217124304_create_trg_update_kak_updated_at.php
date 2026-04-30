<?php

declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class CreateTrgUpdateKakUpdatedAt extends AbstractMigration
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
    public function up(): void
    {
        // Trigger for AFTER INSERT on t_kak_anggaran
        $this->execute('
            CREATE TRIGGER trg_update_kak_updated_at_ai
            AFTER INSERT ON t_kak_anggaran
            FOR EACH ROW
            BEGIN
                UPDATE t_kak SET updated_at = NOW() WHERE kak_id = NEW.kak_id;
            END;
        ');

        // Trigger for AFTER UPDATE on t_kak_anggaran
        $this->execute('
            CREATE TRIGGER trg_update_kak_updated_at_au
            AFTER UPDATE ON t_kak_anggaran
            FOR EACH ROW
            BEGIN
                IF NEW.kak_id <> OLD.kak_id THEN
                    -- If kak_id changes, update both old and new parent KAKs
                    UPDATE t_kak SET updated_at = NOW() WHERE kak_id = OLD.kak_id;
                    UPDATE t_kak SET updated_at = NOW() WHERE kak_id = NEW.kak_id;
                ELSEIF NEW.harga_satuan <> OLD.harga_satuan OR NEW.volume1 <> OLD.volume1 THEN
                    -- If other relevant fields change, update the parent KAK
                    UPDATE t_kak SET updated_at = NOW() WHERE kak_id = NEW.kak_id;
                END IF;
            END;
        ');

        // Trigger for AFTER DELETE on t_kak_anggaran
        $this->execute('
            CREATE TRIGGER trg_update_kak_updated_at_ad
            AFTER DELETE ON t_kak_anggaran
            FOR EACH ROW
            BEGIN
                UPDATE t_kak SET updated_at = NOW() WHERE kak_id = OLD.kak_id;
            END;
        ');
    }

    public function down(): void
    {
        $this->execute('DROP TRIGGER IF EXISTS trg_update_kak_updated_at_ai;');
        $this->execute('DROP TRIGGER IF EXISTS trg_update_kak_updated_at_au;');
        $this->execute('DROP TRIGGER IF EXISTS trg_update_kak_updated_at_ad;');
    }
}

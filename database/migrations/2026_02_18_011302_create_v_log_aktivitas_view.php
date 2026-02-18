<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public $withinTransaction = false;

    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::statement('DROP VIEW IF EXISTS v_log_aktivitas');
        DB::statement("
            CREATE VIEW v_log_aktivitas AS
            SELECT
                'KAK_STATUS_' || CAST(log_id AS TEXT) AS log_id,
                CAST('KAK_STATUS' AS TEXT) AS log_type,
                timestamp AS created_at,
                actor_user_id AS user_id,
                kak_id,
                CAST(NULL AS INTEGER) AS kegiatan_id,
                status_id_lama AS old_status,
                status_id_baru AS new_status,
                CAST(NULL AS TEXT) AS approval_status,
                CAST(NULL AS TEXT) AS approval_level,
                catatan
            FROM t_kak_log_status
            UNION ALL
            SELECT
                'KEGIATAN_STATUS_' || CAST(log_id AS TEXT) AS log_id,
                CAST('KEGIATAN_STATUS' AS TEXT) AS log_type,
                timestamp AS created_at,
                actor_user_id AS user_id,
                CAST(NULL AS INTEGER) AS kak_id,
                kegiatan_id,
                status_id_lama AS old_status,
                status_id_baru AS new_status,
                CAST(NULL AS TEXT) AS approval_status,
                CAST(NULL AS TEXT) AS approval_level,
                catatan
            FROM t_kegiatan_log_status
            UNION ALL
            SELECT
                'KAK_APPROVAL_' || CAST(approval_telaah_id AS TEXT) AS log_id,
                CAST('KAK_APPROVAL' AS TEXT) AS log_type,
                created_at,
                approver_user_id AS user_id,
                kak_id,
                CAST(NULL AS INTEGER) AS kegiatan_id,
                CAST(NULL AS INTEGER) AS old_status,
                CAST(NULL AS INTEGER) AS new_status,
                CAST(status AS TEXT) AS approval_status,
                CAST(NULL AS TEXT) AS approval_level,
                catatan
            FROM t_kak_approval
            UNION ALL
            SELECT
                'KEGIATAN_APPROVAL_' || CAST(approval_kegiatan_id AS TEXT) AS log_id,
                CAST('KEGIATAN_APPROVAL' AS TEXT) AS log_type,
                created_at,
                approver_user_id AS user_id,
                CAST(NULL AS INTEGER) AS kak_id,
                kegiatan_id,
                CAST(NULL AS INTEGER) AS old_status,
                CAST(NULL AS INTEGER) AS new_status,
                CAST(status AS TEXT) AS approval_status,
                CAST(approval_level AS TEXT) AS approval_level,
                catatan
            FROM t_kegiatan_approval
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('DROP VIEW IF EXISTS v_log_aktivitas');
    }
};

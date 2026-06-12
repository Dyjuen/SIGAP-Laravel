<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (DB::connection()->getDriverName() === 'pgsql') {
            $tables = [
                'm_satuan' => 'satuan_id',
                'm_iku' => 'iku_id',
                'm_mata_anggaran' => 'mata_anggaran_id',
                'm_tipe_kegiatan' => 'tipe_kegiatan_id',
                'm_kategori_belanja' => 'kategori_belanja_id',
            ];

            foreach ($tables as $table => $column) {
                // Set the serial sequence value to the current max ID in the table to prevent duplicate key violations
                DB::statement("
                    SELECT setval(
                        pg_get_serial_sequence('$table', '$column'), 
                        COALESCE((SELECT MAX($column) FROM $table), 1)
                    );
                ");
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No operation needed for resetting sequences on rollback
    }
};

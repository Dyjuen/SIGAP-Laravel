<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('t_kegiatan', function (Blueprint $table) {
            $table->date('realisasi_tgl_mulai')->nullable()->after('spk_kesesuaian_waktu');
            $table->date('realisasi_tgl_selesai')->nullable()->after('realisasi_tgl_mulai');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('t_kegiatan', function (Blueprint $table) {
            $table->dropColumn([
                'realisasi_tgl_mulai',
                'realisasi_tgl_selesai',
            ]);
        });
    }
};

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
            $table->integer('spk_kesesuaian_waktu')->nullable();
            $table->integer('spk_ketepatan_anggaran')->nullable();
            $table->integer('spk_kesesuaian_output')->nullable();
            $table->integer('spk_ketepatan_lpj')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('t_kegiatan', function (Blueprint $table) {
            $table->dropColumn([
                'spk_kesesuaian_waktu',
                'spk_ketepatan_anggaran',
                'spk_kesesuaian_output',
                'spk_ketepatan_lpj',
            ]);
        });
    }
};

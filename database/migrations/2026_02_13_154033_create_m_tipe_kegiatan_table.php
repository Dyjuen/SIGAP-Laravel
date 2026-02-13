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
        if (! Schema::hasTable('m_tipe_kegiatan')) {
            Schema::create('m_tipe_kegiatan', function (Blueprint $table) {
                $table->increments('tipe_kegiatan_id');
                $table->string('nama_tipe', 100);
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('m_tipe_kegiatan');
    }
};

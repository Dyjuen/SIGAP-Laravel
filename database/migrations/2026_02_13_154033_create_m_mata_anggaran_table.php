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
        if (! Schema::hasTable('m_mata_anggaran')) {
            Schema::create('m_mata_anggaran', function (Blueprint $table) {
                $table->increments('mata_anggaran_id');
                $table->string('kode_anggaran', 50);
                $table->string('nama_sumber_dana', 100)->nullable();
                $table->integer('tahun_anggaran')->nullable();
                $table->decimal('total_pagu', 15, 2)->nullable();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('m_mata_anggaran');
    }
};

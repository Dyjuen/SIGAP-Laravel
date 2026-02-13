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
        if (! Schema::hasTable('t_kegiatan')) {
            Schema::create('t_kegiatan', function (Blueprint $table) {
                $table->increments('kegiatan_id');
                $table->unsignedInteger('kak_id');
                $table->string('penanggung_jawab_manual', 255)->nullable();
                $table->string('pelaksana_manual', 255)->nullable();
                $table->date('tanggal_mulai_final')->nullable();
                $table->string('surat_pengantar_path', 255)->nullable();
                $table->dateTime('tgl_batas_lpj')->nullable();
                $table->dateTime('lpj_submitted_at')->nullable();
                $table->timestamp('created_at')->useCurrent();
                $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();

                $table->unique('kak_id');
                $table->foreign('kak_id')->references('kak_id')->on('t_kak')->onDelete('cascade')->onUpdate('cascade');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('t_kegiatan');
    }
};

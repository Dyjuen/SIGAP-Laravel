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
        if (! Schema::hasTable('t_kegiatan_lampiran')) {
            Schema::create('t_kegiatan_lampiran', function (Blueprint $table) {
                $table->increments('lampiran_id');
                $table->unsignedInteger('anggaran_id');
                $table->string('nama_file_asli', 255);
                $table->string('path_file_disimpan', 255);
                $table->unsignedInteger('uploader_user_id');
                $table->timestamp('created_at')->useCurrent();

                $table->foreign('anggaran_id')->references('anggaran_id')->on('t_kak_anggaran')->onDelete('cascade')->onUpdate('cascade');
                $table->foreign('uploader_user_id')->references('user_id')->on('m_users')->onDelete('restrict')->onUpdate('cascade');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('t_kegiatan_lampiran');
    }
};

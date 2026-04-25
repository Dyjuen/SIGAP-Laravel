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
        if (! Schema::hasTable('t_kak_tahapan')) {
            Schema::create('t_kak_tahapan', function (Blueprint $table) {
                $table->increments('tahapan_id');
                $table->unsignedInteger('kak_id');
                $table->string('nama_tahapan', 255);
                $table->integer('urutan');
                $table->text('catatan_verifikator')->nullable();

                $table->foreign('kak_id')->references('kak_id')->on('t_kak')->onDelete('cascade')->onUpdate('cascade');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('t_kak_tahapan');
    }
};

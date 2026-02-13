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
        if (! Schema::hasTable('t_kak_indikator')) {
            Schema::create('t_kak_indikator', function (Blueprint $table) {
                $table->increments('indikator_id');
                $table->unsignedInteger('kak_id');
                $table->text('deskripsi_indikator');
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
        Schema::dropIfExists('t_kak_indikator');
    }
};

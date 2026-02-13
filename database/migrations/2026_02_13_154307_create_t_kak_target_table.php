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
        if (! Schema::hasTable('t_kak_target')) {
            Schema::create('t_kak_target', function (Blueprint $table) {
                $table->increments('target_id');
                $table->unsignedInteger('kak_id');
                $table->text('deskripsi_target');
                $table->string('bulan_indikator', 20)->nullable();
                $table->decimal('persentase_target', 5, 2)->nullable();
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
        Schema::dropIfExists('t_kak_target');
    }
};

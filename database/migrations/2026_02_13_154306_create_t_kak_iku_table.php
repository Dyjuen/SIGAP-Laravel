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
        if (! Schema::hasTable('t_kak_iku')) {
            Schema::create('t_kak_iku', function (Blueprint $table) {
                $table->unsignedInteger('kak_id');
                $table->unsignedInteger('iku_id');
                $table->integer('target')->default(0);
                $table->unsignedInteger('satuan_id')->nullable();
                $table->text('catatan_verifikator')->nullable();

                $table->primary(['kak_id', 'iku_id']);
                $table->foreign('kak_id')->references('kak_id')->on('t_kak')->onDelete('cascade')->onUpdate('cascade');
                $table->foreign('iku_id')->references('iku_id')->on('m_iku')->onDelete('cascade')->onUpdate('cascade');
                $table->foreign('satuan_id')->references('satuan_id')->on('m_satuan')->onDelete('set null')->onUpdate('cascade');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('t_kak_iku');
    }
};

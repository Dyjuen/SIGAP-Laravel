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
        if (! Schema::hasTable('t_kak_manfaat')) {
            Schema::create('t_kak_manfaat', function (Blueprint $table) {
                $table->increments('manfaat_id');
                $table->unsignedInteger('kak_id');
                $table->text('manfaat');
                $table->text('catatan_manfaat')->nullable();

                $table->foreign('kak_id')->references('kak_id')->on('t_kak')->onDelete('cascade')->onUpdate('cascade');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('t_kak_manfaat');
    }
};

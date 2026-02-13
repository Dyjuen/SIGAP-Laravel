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
        if (! Schema::hasTable('m_panduan')) {
            Schema::create('m_panduan', function (Blueprint $table) {
                $table->increments('panduan_id');
                $table->string('judul_panduan', 200);
                $table->unsignedInteger('target_role_id')->nullable();

                $table->foreign('target_role_id')
                    ->references('role_id')
                    ->on('m_roles')
                    ->onDelete('set null')
                    ->onUpdate('cascade');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('m_panduan');
    }
};

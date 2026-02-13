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
        if (! Schema::hasTable('t_notifikasi')) {
            Schema::create('t_notifikasi', function (Blueprint $table) {
                $table->increments('notifikasi_id');
                $table->unsignedInteger('penerima_user_id');
                $table->string('pesan', 255);
                $table->string('link_tujuan', 255)->nullable();
                $table->tinyInteger('is_read')->default(0);
                $table->timestamp('created_at')->useCurrent();

                $table->foreign('penerima_user_id')->references('user_id')->on('m_users')->onDelete('cascade')->onUpdate('cascade');
                $table->index(['penerima_user_id', 'is_read']);
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('t_notifikasi');
    }
};

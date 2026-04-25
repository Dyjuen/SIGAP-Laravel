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
        if (! Schema::hasTable('t_kak_log_status')) {
            Schema::create('t_kak_log_status', function (Blueprint $table) {
                $table->increments('log_id');
                $table->unsignedInteger('kak_id');
                $table->unsignedInteger('status_id_lama')->nullable();
                $table->unsignedInteger('status_id_baru');
                $table->unsignedInteger('actor_user_id');
                $table->text('catatan')->nullable();
                $table->timestamp('timestamp')->useCurrent();

                $table->foreign('kak_id')->references('kak_id')->on('t_kak')->onDelete('cascade')->onUpdate('cascade');
                $table->foreign('status_id_lama')->references('status_id')->on('m_kegiatan_status')->onDelete('set null')->onUpdate('cascade');
                $table->foreign('status_id_baru')->references('status_id')->on('m_kegiatan_status')->onDelete('restrict')->onUpdate('cascade');
                $table->foreign('actor_user_id')->references('user_id')->on('m_users')->onDelete('restrict')->onUpdate('cascade');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('t_kak_log_status');
    }
};

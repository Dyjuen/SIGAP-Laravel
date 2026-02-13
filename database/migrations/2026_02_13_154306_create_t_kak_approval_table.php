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
        if (! Schema::hasTable('t_kak_approval')) {
            Schema::create('t_kak_approval', function (Blueprint $table) {
                $table->increments('approval_telaah_id');
                $table->unsignedInteger('kak_id');
                $table->unsignedInteger('approver_user_id');
                $table->enum('status', ['Menunggu', 'Aktif', 'Revisi', 'Disetujui', 'Ditolak'])->default('Menunggu');
                $table->text('catatan')->nullable();
                $table->timestamp('created_at')->useCurrent();
                $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();

                $table->foreign('kak_id')->references('kak_id')->on('t_kak')->onDelete('cascade')->onUpdate('cascade');
                $table->foreign('approver_user_id')->references('user_id')->on('m_users')->onDelete('restrict')->onUpdate('cascade');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('t_kak_approval');
    }
};

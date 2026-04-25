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
        if (! Schema::hasTable('t_kegiatan_approval')) {
            Schema::create('t_kegiatan_approval', function (Blueprint $table) {
                $table->increments('approval_kegiatan_id');
                $table->unsignedInteger('kegiatan_id');
                $table->string('approval_level', 50);
                $table->unsignedInteger('approver_user_id')->nullable();
                $table->enum('status', ['Menunggu', 'Aktif', 'Disetujui', 'Revisi'])->default('Menunggu');
                $table->text('catatan')->nullable();
                $table->timestamp('created_at')->useCurrent();
                $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();

                $table->foreign('kegiatan_id')->references('kegiatan_id')->on('t_kegiatan')->onDelete('cascade')->onUpdate('cascade');
                $table->foreign('approver_user_id')->references('user_id')->on('m_users')->onDelete('set null')->onUpdate('cascade');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('t_kegiatan_approval');
    }
};

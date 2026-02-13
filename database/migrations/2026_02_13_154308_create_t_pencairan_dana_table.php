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
        if (! Schema::hasTable('t_pencairan_dana')) {
            Schema::create('t_pencairan_dana', function (Blueprint $table) {
                $table->increments('pencairan_id');
                $table->unsignedInteger('kegiatan_id');
                $table->date('tanggal_pencairan');
                $table->decimal('jumlah_dicairkan', 15, 2);
                $table->text('keterangan')->nullable();
                $table->string('bukti_pencairan_path', 255)->nullable();
                $table->unsignedInteger('created_by');
                $table->timestamp('created_at')->useCurrent();

                $table->foreign('kegiatan_id')->references('kegiatan_id')->on('t_kegiatan')->onDelete('cascade')->onUpdate('cascade');
                $table->foreign('created_by')->references('user_id')->on('m_users')->onDelete('restrict')->onUpdate('cascade');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('t_pencairan_dana');
    }
};

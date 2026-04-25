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
        if (! Schema::hasTable('t_kak')) {
            Schema::create('t_kak', function (Blueprint $table) {
                $table->increments('kak_id');
                $table->unsignedInteger('tipe_kegiatan_id')->nullable();
                $table->string('nama_kegiatan', 200);
                $table->text('deskripsi_kegiatan');
                $table->text('sasaran_utama')->nullable();
                $table->text('metode_pelaksanaan')->nullable();
                $table->string('kurun_waktu_pelaksanaan', 255)->nullable();
                $table->date('tanggal_mulai')->nullable();
                $table->date('tanggal_selesai')->nullable();
                $table->string('lokasi', 200)->nullable();
                $table->unsignedInteger('pengusul_user_id');
                $table->unsignedInteger('mata_anggaran_id')->nullable();
                $table->unsignedInteger('status_id');
                $table->text('catatan_nama_kegiatan')->nullable();
                $table->text('catatan_tipe_kegiatan')->nullable();
                $table->text('catatan_deskripsi_kegiatan')->nullable();
                $table->text('catatan_sasaran_utama')->nullable();
                $table->text('catatan_metode_pelaksanaan')->nullable();
                $table->text('catatan_lokasi')->nullable();
                $table->text('catatan_tanggal')->nullable();
                $table->timestamp('created_at')->useCurrent();
                $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();

                $table->foreign('tipe_kegiatan_id')->references('tipe_kegiatan_id')->on('m_tipe_kegiatan')->onDelete('set null')->onUpdate('cascade');
                $table->foreign('pengusul_user_id')->references('user_id')->on('m_users')->onDelete('restrict')->onUpdate('cascade');
                $table->foreign('mata_anggaran_id')->references('mata_anggaran_id')->on('m_mata_anggaran')->onDelete('set null')->onUpdate('cascade');
                $table->foreign('status_id')->references('status_id')->on('m_kegiatan_status')->onDelete('restrict')->onUpdate('cascade');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('t_kak');
    }
};

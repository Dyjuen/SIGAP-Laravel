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
        if (! Schema::hasTable('t_kegiatan_anggaran')) {
            Schema::create('t_kegiatan_anggaran', function (Blueprint $table) {
                $table->increments('anggaran_id');
                $table->unsignedInteger('kegiatan_id');
                $table->unsignedInteger('kategori_belanja_id');
                $table->string('uraian', 255);
                $table->decimal('volume1', 10, 2)->nullable();
                $table->unsignedInteger('satuan1_id')->nullable();
                $table->decimal('volume2', 10, 2)->nullable();
                $table->unsignedInteger('satuan2_id')->nullable();
                $table->decimal('volume3', 10, 2)->nullable();
                $table->unsignedInteger('satuan3_id')->nullable();
                $table->unsignedInteger('satuan_total_id')->nullable();
                $table->decimal('harga_satuan', 15, 2)->nullable();
                $table->decimal('jumlah_diusulkan', 15, 2)->nullable();
                $table->text('catatan_verifikator')->nullable();

                $table->decimal('realisasi_volume1', 10, 2)->nullable();
                $table->unsignedInteger('realisasi_satuan1_id')->nullable();
                $table->decimal('realisasi_volume2', 10, 2)->nullable();
                $table->unsignedInteger('realisasi_satuan2_id')->nullable();
                $table->decimal('realisasi_volume3', 10, 2)->nullable();
                $table->unsignedInteger('realisasi_satuan3_id')->nullable();
                $table->decimal('realisasi_harga_satuan', 15, 2)->nullable();
                $table->decimal('realisasi_jumlah', 15, 2)->nullable();

                $table->foreign('kegiatan_id')->references('kegiatan_id')->on('t_kegiatan')->onDelete('cascade')->onUpdate('cascade');
                $table->foreign('kategori_belanja_id')->references('kategori_belanja_id')->on('m_kategori_belanja')->onDelete('cascade')->onUpdate('cascade');
                $table->foreign('satuan1_id')->references('satuan_id')->on('m_satuan')->onDelete('set null')->onUpdate('cascade');
                $table->foreign('satuan2_id')->references('satuan_id')->on('m_satuan')->onDelete('set null')->onUpdate('cascade');
                $table->foreign('satuan3_id')->references('satuan_id')->on('m_satuan')->onDelete('set null')->onUpdate('cascade');
                $table->foreign('satuan_total_id')->references('satuan_id')->on('m_satuan')->onDelete('set null')->onUpdate('cascade');
                $table->foreign('realisasi_satuan1_id')->references('satuan_id')->on('m_satuan')->onDelete('set null')->onUpdate('cascade');
                $table->foreign('realisasi_satuan2_id')->references('satuan_id')->on('m_satuan')->onDelete('set null')->onUpdate('cascade');
                $table->foreign('realisasi_satuan3_id')->references('satuan_id')->on('m_satuan')->onDelete('set null')->onUpdate('cascade');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('t_kegiatan_anggaran');
    }
};

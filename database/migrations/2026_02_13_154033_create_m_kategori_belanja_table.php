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
        if (! Schema::hasTable('m_kategori_belanja')) {
            Schema::create('m_kategori_belanja', function (Blueprint $table) {
                $table->increments('kategori_belanja_id');
                $table->string('kode', 20)->unique();
                $table->string('nama', 100);
                $table->text('keterangan')->nullable();
                $table->integer('urutan')->default(0);
                $table->boolean('is_active')->default(true);
                $table->timestamp('created_at')->useCurrent();
                $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();

                $table->index('is_active');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('m_kategori_belanja');
    }
};

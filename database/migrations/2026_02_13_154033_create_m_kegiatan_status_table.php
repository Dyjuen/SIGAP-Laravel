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
        if (! Schema::hasTable('m_kegiatan_status')) {
            Schema::create('m_kegiatan_status', function (Blueprint $table) {
                $table->increments('status_id');
                $table->string('nama_status', 50)->unique();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('m_kegiatan_status');
    }
};

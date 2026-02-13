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
        if (! Schema::hasTable('m_iku')) {
            Schema::create('m_iku', function (Blueprint $table) {
                $table->increments('iku_id');
                $table->string('kode_iku', 20)->unique();
                $table->string('nama_iku', 255);
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('m_iku');
    }
};

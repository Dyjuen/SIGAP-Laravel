<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('m_tipe_kegiatan', function (Blueprint $table) {
            $table->softDeletes();
        });

        Schema::table('m_kategori_belanja', function (Blueprint $table) {
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::table('m_tipe_kegiatan', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });

        Schema::table('m_kategori_belanja', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });
    }
};

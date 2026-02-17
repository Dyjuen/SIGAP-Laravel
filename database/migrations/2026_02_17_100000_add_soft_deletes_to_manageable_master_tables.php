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
        Schema::table('m_iku', function (Blueprint $table) {
            $table->softDeletes();
        });

        Schema::table('m_satuan', function (Blueprint $table) {
            $table->softDeletes();
        });

        Schema::table('m_mata_anggaran', function (Blueprint $table) {
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('m_iku', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });

        Schema::table('m_satuan', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });

        Schema::table('m_mata_anggaran', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });
    }
};

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
        Schema::table('t_kegiatan_lampiran', function (Blueprint $table) {
            $table->string('file_hash', 64)->nullable()->after('path_file_disimpan');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('t_kegiatan_lampiran', function (Blueprint $table) {
            $table->dropColumn('file_hash');
        });
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('t_kegiatan', function (Blueprint $table) {
            $table->date('tanggal_selesai_final')->nullable()->after('tanggal_mulai_final');
        });
    }

    public function down(): void
    {
        Schema::table('t_kegiatan', function (Blueprint $table) {
            $table->dropColumn('tanggal_selesai_final');
        });
    }
};

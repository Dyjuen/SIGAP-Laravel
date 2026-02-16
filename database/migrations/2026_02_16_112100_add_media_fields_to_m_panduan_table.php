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
        Schema::table('m_panduan', function (Blueprint $table) {
            $table->string('tipe_media', 20)->default('document')->after('judul_panduan');
            $table->string('path_media', 255)->nullable()->after('tipe_media');
            $table->index('target_role_id', 'idx_panduan_target_role_id');
        });

        if (Schema::hasColumn('m_panduan', 'isi_panduan')) {
            Schema::table('m_panduan', function (Blueprint $table) {
                $table->dropColumn('isi_panduan');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('m_panduan', function (Blueprint $table) {
            $table->dropColumn(['tipe_media', 'path_media']);
            $table->dropIndex('idx_panduan_target_role_id');
        });

        if (! Schema::hasColumn('m_panduan', 'isi_panduan')) {
            Schema::table('m_panduan', function (Blueprint $table) {
                $table->text('isi_panduan')->nullable();
            });
        }
    }
};

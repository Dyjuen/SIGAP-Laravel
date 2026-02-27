<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (! Schema::hasTable('t_kegiatan_lampiran')) {
            // Create custom enum types if using PostgreSQL
            if (DB::getDriverName() === 'pgsql') {
                DB::statement("DO $$ BEGIN
                    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'lampiran_status') THEN
                        CREATE TYPE lampiran_status AS ENUM ('pending', 'revision_requested', 'approved', 'archived');
                    END IF;
                    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'lampiran_approval') THEN
                        CREATE TYPE lampiran_approval AS ENUM ('pending', 'approved', 'rejected');
                    END IF;
                END $$;");
            }

            Schema::create('t_kegiatan_lampiran', function (Blueprint $table) {
                $table->increments('lampiran_id');
                $table->unsignedInteger('anggaran_id');
                $table->string('nama_file_asli', 255);
                $table->string('path_file_disimpan', 255);
                $table->unsignedInteger('uploader_user_id');
                $table->text('catatan')->nullable();
                $table->timestamp('created_at')->useCurrent();

                // Use custom type for PostgreSQL, otherwise standard enum/string
                if (DB::getDriverName() === 'pgsql') {
                    $table->addColumn('lampiran_status', 'status_lampiran')->default('pending');
                } else {
                    $table->string('status_lampiran')->default('pending');
                }

                $table->text('catatan_reviewer')->nullable();
                $table->unsignedInteger('reviewer_user_id')->nullable();
                $table->timestamp('catatan_tanggal')->nullable();
                $table->integer('revisi_ke')->default(0);

                if (DB::getDriverName() === 'pgsql') {
                    $table->addColumn('lampiran_approval', 'status_approval')->default('pending');
                } else {
                    $table->string('status_approval')->default('pending');
                }

                $table->timestamp('approval_tanggal')->nullable();
                $table->unsignedInteger('parent_lampiran_id')->nullable();
                $table->timestamp('updated_at')->nullable();

                $table->foreign('anggaran_id')->references('anggaran_id')->on('t_kak_anggaran')->onDelete('cascade')->onUpdate('cascade');
                $table->foreign('uploader_user_id')->references('user_id')->on('m_users')->onDelete('restrict')->onUpdate('cascade');
                $table->foreign('reviewer_user_id')->references('user_id')->on('m_users')->onDelete('set null')->onUpdate('cascade');
                $table->foreign('parent_lampiran_id')->references('lampiran_id')->on('t_kegiatan_lampiran')->onDelete('set null')->onUpdate('cascade');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('t_kegiatan_lampiran');
    }
};

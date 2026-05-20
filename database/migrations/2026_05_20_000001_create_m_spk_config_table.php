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
        Schema::create('m_spk_config', function (Blueprint $table) {
            $table->id();
            $table->decimal('weight_waktu', 5, 2)->default(25.00);
            $table->decimal('weight_anggaran', 5, 2)->default(25.00);
            $table->decimal('weight_output', 5, 2)->default(25.00);
            $table->decimal('weight_lpj', 5, 2)->default(25.00);

            $table->integer('waktu_min')->default(50);
            $table->integer('waktu_max')->default(100);

            $table->integer('anggaran_min')->default(50);
            $table->integer('anggaran_max')->default(100);

            $table->integer('output_min')->default(0);
            $table->integer('output_max')->default(100);

            $table->integer('lpj_min')->default(50);
            $table->integer('lpj_max')->default(100);

            $table->integer('lpj_penalty_per_day')->default(5);
            $table->timestamps();
        });

        // Seed initial default config row
        DB::table('m_spk_config')->insert([
            'id' => 1,
            'weight_waktu' => 25.00,
            'weight_anggaran' => 25.00,
            'weight_output' => 25.00,
            'weight_lpj' => 25.00,
            'waktu_min' => 50,
            'waktu_max' => 100,
            'anggaran_min' => 50,
            'anggaran_max' => 100,
            'output_min' => 0,
            'output_max' => 100,
            'lpj_min' => 50,
            'lpj_max' => 100,
            'lpj_penalty_per_day' => 5,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('m_spk_config');
    }
};

<?php

namespace Database\Factories;

use App\Models\KAK;
use App\Models\KegiatanStatus;
use App\Models\MataAnggaran;
use App\Models\TipeKegiatan;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\KAK>
 */
class KAKFactory extends Factory
{
    protected $model = KAK::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // Ensure we have at least one of each required master data
        $tipe = TipeKegiatan::inRandomOrder()->first() ?? TipeKegiatan::factory()->create();
        $status = KegiatanStatus::where('nama_status', 'Draft')->first();
        if (! $status) {
            $status = KegiatanStatus::create(['status_id' => 1, 'nama_status' => 'Draft']);
        }

        $pengusul = User::whereHas('role', fn ($q) => $q->where('nama_role', 'Pengusul'))->inRandomOrder()->first()
            ?? User::factory()->create(['role_id' => 3]); // Assuming 3 is Pengusul based on seeder

        return [
            'tipe_kegiatan_id' => $tipe->tipe_kegiatan_id,
            'nama_kegiatan' => $this->faker->sentence(3),
            'deskripsi_kegiatan' => $this->faker->paragraph(),
            'sasaran_utama' => $this->faker->sentence(),
            'metode_pelaksanaan' => $this->faker->sentence(),
            'kurun_waktu_pelaksanaan' => '1 Bulan',
            'tanggal_mulai' => now()->addDays(1)->format('Y-m-d'),
            'tanggal_selesai' => now()->addDays(30)->format('Y-m-d'),
            'lokasi' => $this->faker->city(),
            'pengusul_user_id' => $pengusul->user_id,
            'mata_anggaran_id' => null, // Default null for draft
            'status_id' => $status->status_id,
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }

    /**
     * State for 'Review Verifikator' status.
     */
    public function review(): static
    {
        return $this->state(fn (array $attributes) => [
            'status_id' => 2, // Review Verifikator
        ]);
    }

    /**
     * State for 'Disetujui' status.
     */
    public function approved(): static
    {
        return $this->state(fn (array $attributes) => [
            'status_id' => 3, // Disetujui
            'mata_anggaran_id' => MataAnggaran::factory(), // Approved needs Mata Anggaran
        ]);
    }
}

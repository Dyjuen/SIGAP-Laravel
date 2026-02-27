<?php

namespace Database\Factories;

use App\Models\KAKAnggaran;
use App\Models\KegiatanLampiran;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class KegiatanLampiranFactory extends Factory
{
    protected $model = KegiatanLampiran::class;

    public function definition(): array
    {
        return [
            'anggaran_id' => KAKAnggaran::factory(),
            'nama_file_asli' => $this->faker->word().'.pdf',
            'path_file_disimpan' => 'lampiran/'.$this->faker->uuid().'.pdf',
            'uploader_user_id' => User::factory(),
            'catatan' => $this->faker->sentence(),
            'status_lampiran' => 'pending',
            'status_approval' => 'pending',
            'revisi_ke' => 0,
            'created_at' => now(),
        ];
    }
}

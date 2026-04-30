<?php

namespace App\Validators;

use App\Core\Validator;

class KegiatanValidator extends Validator
{
    public function __construct()
    {
        // Constructor is now empty
    }

    /**
     * Validate create kegiatan
     */
    public function validateCreate(array $data): bool
    {
        // Basic validation rules
        $rules = [
            'nama_kegiatan' => 'required|min:10|max:200',
            'deskripsi_kegiatan' => 'required|min:50',
            'tanggal_mulai' => 'required|date',
            'tanggal_selesai' => 'required|date',
            'lokasi' => 'required|min:5|max:200',
            'mata_anggaran_id' => 'required|integer',
        ];

        // Apply basic validation
        if (! $this->validate($data, $rules)) {
            return false;
        }

        // Custom validations
        $this->validateDateRange($data['tanggal_mulai'] ?? '', $data['tanggal_selesai'] ?? '');

        return ! $this->hasErrors();
    }

    /**
     * Validate update kegiatan
     */
    public function validateUpdate(array $data): bool
    {
        // Same rules as create
        return $this->validateCreate($data);
    }

    /**
     * Validate date range
     */
    private function validateDateRange($tanggalMulai, $tanggalSelesai)
    {
        if (empty($tanggalMulai) || empty($tanggalSelesai)) {
            return;
        }

        $mulai = strtotime($tanggalMulai);
        $selesai = strtotime($tanggalSelesai);
        $today = strtotime(date('Y-m-d'));

        // Tanggal mulai tidak boleh kurang dari hari ini
        if ($mulai < $today) {
            $this->addError('tanggal_mulai', 'Tanggal mulai tidak boleh kurang dari hari ini.');
        }

        // Tanggal selesai harus setelah tanggal mulai
        if ($selesai <= $mulai) {
            $this->addError('tanggal_selesai', 'Tanggal selesai harus setelah tanggal mulai.');
        }

        // Durasi maksimal 365 hari (1 tahun)
        $diff = ($selesai - $mulai) / 86400; // Convert to days
        if ($diff > 365) {
            $this->addError('tanggal_selesai', 'Durasi kegiatan maksimal 365 hari (1 tahun).');
        }
    }
}

<?php

namespace App\Validators;

use App\Core\Validator;

class KAKValidator extends Validator
{
    public function validateKAKData(array $data): bool
    {
        // Validate main KAK data
        $kak_rules = [
            'nama_kegiatan' => 'required',
            'deskripsi_kegiatan' => 'required',
            'metode_pelaksanaan' => 'required',
            'kurun_waktu_pelaksanaan' => 'required',
            'tanggal_mulai' => 'required',
            'tanggal_selesai' => 'required',
            'lokasi' => 'required',
        ];

        if (! isset($data['kak']) || ! parent::validate($data['kak'], $kak_rules)) {
            // Errors are already in $this->errors
        }

        // Validate penerima_manfaat (array of objects)
        if (isset($data['kak']['penerima_manfaat'])) {
            if (! is_array($data['kak']['penerima_manfaat'])) {
                $this->addError('kak.penerima_manfaat', 'Penerima manfaat harus berupa array.');
            } else {
                foreach ($data['kak']['penerima_manfaat'] as $index => $manfaat_item) {
                    $manfaat_validator = new Validator;
                    $manfaat_rules = [
                        'sasaran_utama' => 'required',
                        'manfaat' => 'required',
                    ];
                    if (! $manfaat_validator->validate($manfaat_item, $manfaat_rules)) {
                        $this->errors['kak.penerima_manfaat.'.$index] = $manfaat_validator->getErrors();
                    }
                }
            }
        }

        // Validate tahapan_pelaksanaan (array of objects)
        if (isset($data['kak']['tahapan_pelaksanaan'])) {
            if (! is_array($data['kak']['tahapan_pelaksanaan'])) {
                $this->addError('kak.tahapan_pelaksanaan', 'Tahapan pelaksanaan harus berupa array.');
            } else {
                foreach ($data['kak']['tahapan_pelaksanaan'] as $index => $tahapan_item) {
                    $tahapan_validator = new Validator;
                    $tahapan_rules = [
                        'nama_tahapan' => 'required',
                        'urutan' => 'required',
                    ];
                    if (! $tahapan_validator->validate($tahapan_item, $tahapan_rules)) {
                        $this->errors['kak.tahapan_pelaksanaan.'.$index] = $tahapan_validator->getErrors();
                    }
                }
            }
        }

        // Validate indikator_kinerja (array of objects)
        if (isset($data['kak']['indikator_kinerja'])) {
            if (! is_array($data['kak']['indikator_kinerja'])) {
                $this->addError('kak.indikator_kinerja', 'Indikator kinerja harus berupa array.');
            } else {
                foreach ($data['kak']['indikator_kinerja'] as $index => $indikator_item) {
                    $indikator_validator = new Validator;
                    $indikator_rules = [
                        'bulan_indikator' => 'required',
                        'deskripsi_target' => 'required',
                        'persentase_target' => 'required',
                    ];
                    if (! $indikator_validator->validate($indikator_item, $indikator_rules)) {
                        $this->errors['kak.indikator_kinerja.'.$index] = $indikator_validator->getErrors();
                    }
                }
            }
        }

        // Validate target_iku (array of objects)
        if (isset($data['target_iku'])) {
            if (! is_array($data['target_iku'])) {
                $this->addError('target_iku', 'Target IKU harus berupa array.');
            } else {
                foreach ($data['target_iku'] as $index => $iku_item) {
                    $iku_validator = new Validator;
                    $iku_rules = [
                        'iku_id' => 'required',
                        'target' => 'required',
                        'satuan_id' => 'required',
                    ];
                    if (! $iku_validator->validate($iku_item, $iku_rules)) {
                        $this->errors['target_iku.'.$index] = $iku_validator->getErrors();
                    }
                }
            }
        }

        // Validate rab (array of objects)
        if (isset($data['rab'])) {
            if (! is_array($data['rab'])) {
                $this->addError('rab', 'RAB harus berupa array.');
            } else {
                $anggaran_validator = new AnggaranValidator;
                foreach ($data['rab'] as $index => $rab_item) {
                    if (! $anggaran_validator->validateAnggaran($rab_item)) {
                        $this->errors['rab.'.$index] = $anggaran_validator->getErrors();
                    }
                }
            }
        }

        return ! $this->hasErrors();
    }
}

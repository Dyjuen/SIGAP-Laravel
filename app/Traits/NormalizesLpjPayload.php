<?php

namespace App\Traits;

trait NormalizesLpjPayload
{
    /**
     * Normalize the LPJ payload for validation and processing.
     * Converts sequential mobile format to associative array format,
     * and normalizes flat bukti files array to keyed bukti files.
     */
    protected function normalizeLpjPayload(): void
    {
        if ($this->has('realisasi') && is_array($this->realisasi)) {
            $realisasi = $this->realisasi;
            
            // Mobile API clients send 'realisasi' as a flat sequential list of objects:
            // [
            //   {"anggaran_id": 45, "volume1": 2, "satuan1_id": 1, "harga_satuan": 10000},
            //   {"anggaran_id": 46, "volume1": 1, "satuan1_id": 1, "harga_satuan": 20000}
            // ]
            //
            // Web clients send it as a nested associative array keyed by 'anggaran_id':
            // {
            //   "45": {"volume1": 2, "satuan1_id": 1, "harga_satuan": 10000},
            //   "46": {"volume1": 1, "satuan1_id": 1, "harga_satuan": 20000}
            // }
            //
            // If it is a sequential list (mobile format), transform it to the associative web shape.
            if (array_is_list($realisasi) && !empty($realisasi) && isset($realisasi[0]['anggaran_id'])) {
                $formattedRealisasi = [];
                foreach ($realisasi as $item) {
                    if (isset($item['anggaran_id'])) {
                        $formattedRealisasi[$item['anggaran_id']] = [
                            'volume1' => $item['volume1'] ?? null,
                            'satuan1_id' => $item['satuan1_id'] ?? null,
                            'volume2' => $item['volume2'] ?? null,
                            'satuan2_id' => $item['satuan2_id'] ?? null,
                            'volume3' => $item['volume3'] ?? null,
                            'satuan3_id' => $item['satuan3_id'] ?? null,
                            'harga_satuan' => $item['harga_satuan'] ?? null,
                        ];
                    }
                }
                $this->merge(['realisasi' => $formattedRealisasi]);
            }
        }

        // Normalize flat bukti_files array to keyed bukti array for mobile API uploads
        if ($this->hasFile('bukti_files') && !$this->has('bukti')) {
            $files = $this->file('bukti_files');
            if (is_array($files)) {
                // Find first anggaran_id from realisasi
                $anggaranId = null;
                if ($this->has('realisasi') && is_array($this->realisasi)) {
                    $keys = array_keys($this->realisasi);
                    $anggaranId = $keys[0] ?? null;
                }
                if ($anggaranId) {
                    $this->merge(['bukti' => [$anggaranId => $files]]);
                }
            }
        }
    }
}

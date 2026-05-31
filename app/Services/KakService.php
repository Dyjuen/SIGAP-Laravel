<?php

namespace App\Services;

use App\Models\User;
use App\Models\KAK;
use App\Models\KAKAnggaran;
use App\Models\KAKIku;
use App\Models\KAKManfaat;
use App\Models\KAKTahapan;
use App\Models\KAKTarget;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class KakService
{
    /**
     * Create a KAK with nested relations.
     */
    public function create(array $data, User $actor): KAK
    {
        return DB::transaction(function () use ($data, $actor) {
            $kakData = $this->extractParentData($data);
            $kakData['kurun_waktu_pelaksanaan'] = $this->computeKurunWaktu(
                $kakData['tanggal_mulai'],
                $kakData['tanggal_selesai']
            );
            $kakData['pengusul_user_id'] = $actor->user_id;
            $kakData['status_id'] = 1; // Draft

            $kak = KAK::create($kakData);

            $this->saveChildren($kak, $data);

            return $kak;
        });
    }

    public function update(KAK $kak, array $data): KAK
    {
        if (! in_array($kak->status_id, [1, 4, 5])) {
            abort(403, 'Anda tidak dapat mengedit KAK ini.');
        }

        return DB::transaction(function () use ($kak, $data) {
            $kakData = $this->extractParentData($data);
            $kakData['kurun_waktu_pelaksanaan'] = $this->computeKurunWaktu(
                $kakData['tanggal_mulai'],
                $kakData['tanggal_selesai']
            );

            $kak->update($kakData);

            $this->saveChildren($kak, $data, true);

            return $kak;
        });
    }

    /**
     * Delete KAK.
     */
    public function delete(KAK $kak): void
    {
        $kak->delete();
    }

    private function extractParentData(array $data): array
    {
        // Handle nesting if from StoreKakRequest (under 'kak' key)
        $raw = isset($data['kak']) && is_array($data['kak']) ? $data['kak'] : $data;

        $fields = [
            'nama_kegiatan', 'deskripsi_kegiatan', 'metode_pelaksanaan',
            'tanggal_mulai', 'tanggal_selesai', 'lokasi',
            'tipe_kegiatan_id', 'sasaran_utama'
        ];

        $extracted = [];
        foreach ($fields as $field) {
            if (array_key_exists($field, $raw)) {
                $extracted[$field] = $raw[$field];
            }
        }
        return $extracted;
    }

    private function saveChildren(KAK $kak, array $data, bool $isUpdate = false): void
    {
        $rawKak = isset($data['kak']) && is_array($data['kak']) ? $data['kak'] : $data;

        // 1. Manfaat
        $manfaatData = collect($rawKak['manfaat'] ?? [])->filter(fn ($m) => ! empty($m['value']));
        $incomingManfaatIds = $manfaatData->pluck('manfaat_id')->filter()->all();
        if ($isUpdate) {
            $kak->manfaat()->whereNotIn('manfaat_id', $incomingManfaatIds)->delete();
        }
        foreach ($manfaatData as $m) {
            if ($isUpdate && ! empty($m['manfaat_id'])) {
                $kak->manfaat()->where('manfaat_id', $m['manfaat_id'])->update([
                    'manfaat' => $m['value'],
                ]);
            } else {
                KAKManfaat::create([
                    'kak_id' => $kak->kak_id,
                    'manfaat' => $m['value'],
                ]);
            }
        }

        // 2. Tahapan
        $tahapanRaw = $rawKak['tahapan_pelaksanaan'] ?? $rawKak['tahapan'] ?? [];
        $tahapanData = collect($tahapanRaw)->filter(fn ($t) => ! empty($t['nama_tahapan']));
        $incomingTahapanIds = $tahapanData->pluck('tahapan_id')->filter()->all();
        if ($isUpdate) {
            $kak->tahapan()->whereNotIn('tahapan_id', $incomingTahapanIds)->delete();
        }
        foreach ($tahapanData as $idx => $t) {
            if ($isUpdate && ! empty($t['tahapan_id'])) {
                $kak->tahapan()->where('tahapan_id', $t['tahapan_id'])->update([
                    'nama_tahapan' => $t['nama_tahapan'],
                    'urutan' => $idx + 1,
                ]);
            } else {
                KAKTahapan::create([
                    'kak_id' => $kak->kak_id,
                    'nama_tahapan' => $t['nama_tahapan'],
                    'urutan' => $idx + 1,
                ]);
            }
        }

        // 3. Indikator Kinerja
        $indikatorData = collect($rawKak['indikator_kinerja'] ?? [])->filter(fn ($i) => ! empty($i['deskripsi_target']));
        $incomingTargetIds = $indikatorData->pluck('target_id')->filter()->all();
        if ($isUpdate) {
            $kak->targets()->whereNotIn('target_id', $incomingTargetIds)->delete();
        }
        foreach ($indikatorData as $i) {
            $targetData = [
                'bulan_indikator' => $i['bulan_indikator'] ?? null,
                'deskripsi_target' => $i['deskripsi_target'],
                'persentase_target' => $i['persentase_target'] ?? null,
            ];
            if ($isUpdate && ! empty($i['target_id'])) {
                $kak->targets()->where('target_id', $i['target_id'])->update($targetData);
            } else {
                KAKTarget::create(array_merge($targetData, ['kak_id' => $kak->kak_id]));
            }
        }

        // 4. Target IKU
        $ikuData = collect($data['target_iku'] ?? [])->filter(fn ($i) => ! empty($i['iku_id']) && ! empty($i['target']));
        $incomingIkuIds = $ikuData->pluck('iku_id')->unique()->filter()->all();
        if ($isUpdate) {
            $kak->ikus()->whereNotIn('iku_id', $incomingIkuIds)->delete();
        }
        $ikuData = $ikuData->unique('iku_id')->values();
        foreach ($ikuData as $i) {
            KAKIku::updateOrCreate(
                ['kak_id' => $kak->kak_id, 'iku_id' => $i['iku_id']],
                [
                    'target' => $i['target'],
                    'satuan_id' => $i['satuan_id'] ?? null,
                ]
            );
        }

        // 5. RAB (Anggaran)
        $rabData = collect($data['rab'] ?? [])->filter(fn ($r) => ! empty($r['uraian']) && ! empty($r['kategori_belanja_id']));
        $incomingAnggaranIds = $rabData->pluck('anggaran_id')->filter()->all();
        if ($isUpdate) {
            $kak->anggaran()->whereNotIn('anggaran_id', $incomingAnggaranIds)->delete();
        }
        foreach ($rabData as $r) {
            $vol1 = $r['volume1'] ?? 1;
            $vol2 = $r['volume2'] ?? 1;
            $vol3 = $r['volume3'] ?? 1;
            $harga = $r['harga_satuan'] ?? 0;
            $jumlah = $vol1 * $vol2 * $vol3 * $harga;

            $angData = [
                'kategori_belanja_id' => $r['kategori_belanja_id'],
                'uraian' => $r['uraian'],
                'volume1' => $vol1,
                'satuan1_id' => $r['satuan1_id'] ?? $r['satuan_id'] ?? null,
                'volume2' => $r['volume2'] ?? null,
                'satuan2_id' => $r['satuan2_id'] ?? null,
                'volume3' => $r['volume3'] ?? null,
                'satuan3_id' => $r['satuan3_id'] ?? null,
                'harga_satuan' => $harga,
                'jumlah_diusulkan' => $jumlah,
            ];

            if ($isUpdate && ! empty($r['anggaran_id'])) {
                $kak->anggaran()->where('anggaran_id', $r['anggaran_id'])->update($angData);
            } else {
                $angData['kak_id'] = $kak->kak_id;
                KAKAnggaran::create($angData);
            }
        }
    }

    private function computeKurunWaktu(string $start, string $end): string
    {
        $startDate = Carbon::parse($start);
        $endDate = Carbon::parse($end);
        $diffDays = $startDate->diffInDays($endDate) + 1;

        if ($diffDays < 30) {
            return "{$diffDays} Hari";
        }

        $months = (int) floor($diffDays / 30);
        $days = $diffDays % 30;

        return $days > 0 ? "{$months} Bulan {$days} Hari" : "{$months} Bulan";
    }

    public function applyListFilters($query, User $user): \Illuminate\Database\Eloquent\Builder
    {
        if ($user->role_id === 3) {
            // Pengusul: only own KAKs in KAK stage (statuses 1, 2, 4, 5)
            $query->where('pengusul_user_id', $user->user_id)
                  ->whereIn('status_id', [1, 2, 4, 5]);
        } elseif ($user->role_id === 2) {
            // Verifikator: only KAKs in "Review Verifikator" status (status_id = 2)
            // and matching their Tipe Kegiatan
            $query->where('status_id', 2);

            if (method_exists($user, 'getVerifikatorTipeId')) {
                $tipeId = $user->getVerifikatorTipeId();
            } else {
                $tipeId = null;
                if (preg_match('/verifikator(\d+)/', $user->username, $matches)) {
                    $tipeId = (int) $matches[1];
                }
            }

            if ($tipeId !== null) {
                $query->where('tipe_kegiatan_id', $tipeId);
            } else {
                $query->whereRaw('1 = 0');
            }
        } else {
            // Admin/Others: only KAKs in KAK stage (statuses 1, 2, 4, 5)
            $query->whereIn('status_id', [1, 2, 4, 5]);
        }

        return $query;
    }
}

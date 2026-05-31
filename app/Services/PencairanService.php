<?php

namespace App\Services;

use App\Events\PencairanSelesai;
use App\Exceptions\PencairanException;
use App\Models\KAKAnggaran;
use App\Models\Kegiatan;
use App\Models\KegiatanApproval;
use App\Models\KegiatanLogStatus;
use App\Models\PencairanDana;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class PencairanService
{
    /**
     * Compute financial summary for a kegiatan.
     */
    public function computeSisaDana(Kegiatan $kegiatan): array
    {
        $totalAnggaran = KAKAnggaran::where('kak_id', $kegiatan->kak_id)
            ->sum('jumlah_diusulkan');

        $totalDicairkan = PencairanDana::where('kegiatan_id', $kegiatan->kegiatan_id)
            ->sum('jumlah_dicairkan');

        return [
            'total_anggaran_disetujui' => (float) $totalAnggaran,
            'total_dicairkan' => (float) $totalDicairkan,
            'sisa_dana' => (float) ($totalAnggaran - $totalDicairkan),
        ];
    }

    /**
     * Record a new disbursement.
     *
     * @throws PencairanException
     */
    public function store(Kegiatan $kegiatan, float $nominalPencairan, ?string $keterangan, User $actor): PencairanDana
    {
        $bendaharaCairApproval = $kegiatan->approvals()
            ->where('approval_level', 'Bendahara-Cair')
            ->where('status', 'Aktif')
            ->first();

        if (! $bendaharaCairApproval) {
            throw new PencairanException('Pencairan belum dapat dilakukan. Status persetujuan Bendahara-Cair belum Aktif.');
        }

        $summary = $this->computeSisaDana($kegiatan);
        if ($nominalPencairan > $summary['sisa_dana']) {
            throw new PencairanException('Nominal pencairan melebihi sisa dana yang tersedia.');
        }

        return PencairanDana::create([
            'kegiatan_id' => $kegiatan->kegiatan_id,
            'jumlah_dicairkan' => $nominalPencairan,
            'keterangan' => $keterangan,
            'created_by' => $actor->user_id,
            'tanggal_pencairan' => now()->toDateString(),
        ]);
    }

    /**
     * Complete the disbursement phase.
     *
     * @throws PencairanException
     */
    public function selesai(Kegiatan $kegiatan, User $actor): void
    {
        // Find the Bendahara-Cair step — must be Aktif
        $bendaharaCairApproval = $kegiatan->approvals()
            ->where('approval_level', 'Bendahara-Cair')
            ->where('status', 'Aktif')
            ->first();

        if (! $bendaharaCairApproval) {
            throw new PencairanException('Proses pencairan belum aktif atau sudah diselesaikan.');
        }

        DB::transaction(function () use ($kegiatan, $bendaharaCairApproval, $actor) {
            $kak = $kegiatan->kak;
            $oldStatus = $kak->status_id;

            // 1. Mark Bendahara-Cair as Disetujui
            $bendaharaCairApproval->update([
                'status' => 'Disetujui',
                'approver_user_id' => $actor->user_id,
                'catatan' => 'Proses pencairan dana telah selesai.',
            ]);

            // 2. Activate Bendahara-LPJ
            $bendaharaLpjApproval = KegiatanApproval::where('kegiatan_id', $kegiatan->kegiatan_id)
                ->where('approval_level', 'Bendahara-LPJ')
                ->first();

            if ($bendaharaLpjApproval) {
                $bendaharaLpjApproval->update(['status' => 'Aktif']);
            }

            // 3. Update KAK status to 10 (Menunggu LPJ)
            $newStatus = 10;
            $kak->update(['status_id' => $newStatus]);

            // 4. Log the status change
            KegiatanLogStatus::create([
                'kegiatan_id' => $kegiatan->kegiatan_id,
                'status_id_lama' => $oldStatus,
                'status_id_baru' => $newStatus,
                'actor_user_id' => $actor->user_id,
                'catatan' => 'Proses pencairan selesai, tahap LPJ dimulai.',
            ]);

            // Calculate total funds released
            $totalCair = $kegiatan->pencairanDana()->sum('jumlah_dicairkan');

            // Dispatch event to send email
            event(new PencairanSelesai($kegiatan, $totalCair));
        });
    }
}

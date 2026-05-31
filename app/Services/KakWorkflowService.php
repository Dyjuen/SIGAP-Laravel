<?php

namespace App\Services;

use App\Events\KakApproved;
use App\Events\KakRejected;
use App\Events\KakRevised;
use App\Events\KakSubmitted;
use App\Exceptions\KakWorkflowException;
use App\Models\KAK;
use App\Models\KAKApproval;
use App\Models\KAKLogStatus;
use App\Models\MataAnggaran;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class KakWorkflowService
{
    /**
     * Submit KAK for verification (Draft/Revisi -> Review)
     */
    public function submit(KAK $kak, User $actor): void
    {
        if (! in_array($kak->status_id, [1, 5])) {
            throw new KakWorkflowException('Anda hanya dapat mengajukan KAK dengan status Draft atau Revisi.');
        }

        DB::transaction(function () use ($kak, $actor) {
            $oldStatus = $kak->status_id;
            $kak->status_id = 2; // Review
            $kak->save();

            $this->logStatus($kak, $oldStatus, 2, $actor);

            $type = ($oldStatus === 5) ? 'resubmitted' : 'submitted';

            // Dispatch event outside or within transaction using DB::afterCommit if desired,
            // but standard event dispatching inside works since transaction is short.
            event(new KakSubmitted($kak, $type));
        });
    }

    /**
     * Approve KAK (Review -> Disetujui)
     */
    public function approve(KAK $kak, array $data, User $actor): void
    {
        if ($kak->status_id !== 2) {
            throw new KakWorkflowException('Hanya KAK dalam status Review yang dapat disetujui.');
        }

        DB::transaction(function () use ($kak, $data, $actor) {
            $oldStatus = $kak->status_id;

            if (! empty($data['mata_anggaran_id'])) {
                $mataAnggaranId = $data['mata_anggaran_id'];
            } else {
                // Handle Mata Anggaran Baru
                $mataAnggaran = MataAnggaran::firstOrCreate(
                    ['kode_anggaran' => $data['kode_anggaran']],
                    [
                        'nama_sumber_dana' => $data['nama_sumber_dana'],
                        'tahun_anggaran' => $data['tahun_anggaran'],
                        'total_pagu' => $data['total_pagu'],
                    ]
                );
                $mataAnggaranId = $mataAnggaran->mata_anggaran_id;
            }

            // Update KAK
            $kak->status_id = 3; // Disetujui
            $kak->mata_anggaran_id = $mataAnggaranId;

            // Clear catatan on Approval
            $this->clearCatatan($kak);
            $kak->save();

            // Log Status
            $this->logStatus($kak, $oldStatus, 3, $actor);

            // Create Approval record
            KAKApproval::create([
                'kak_id' => $kak->kak_id,
                'approver_user_id' => $actor->user_id,
                'status' => 'Disetujui',
                'tanggal_telaah' => now(),
                'catatan' => null,
            ]);

            event(new KakApproved($kak));
        });
    }

    /**
     * Reject KAK (Review -> Ditolak)
     */
    public function reject(KAK $kak, string $catatan, User $actor): void
    {
        if ($kak->status_id !== 2) {
            throw new KakWorkflowException('Hanya KAK dalam status Review yang dapat ditolak.');
        }

        if (empty($catatan)) {
            throw new KakWorkflowException('Catatan penolakan wajib diisi.');
        }

        DB::transaction(function () use ($kak, $catatan, $actor) {
            $oldStatus = $kak->status_id;

            $kak->status_id = 4; // Ditolak
            $kak->save();

            $this->logStatus($kak, $oldStatus, 4, $actor);

            KAKApproval::create([
                'kak_id' => $kak->kak_id,
                'approver_user_id' => $actor->user_id,
                'status' => 'Ditolak',
                'tanggal_telaah' => now(),
                'catatan' => $catatan,
            ]);

            event(new KakRejected($kak, 'rejected', $catatan));
        });
    }

    /**
     * Request Revision (Review -> Revisi)
     */
    public function revise(KAK $kak, array $data, User $actor): void
    {
        if ($kak->status_id !== 2) {
            throw new KakWorkflowException('Hanya KAK dalam status Review yang dapat direvisi.');
        }

        DB::transaction(function () use ($kak, $data, $actor) {
            $oldStatus = $kak->status_id;

            $kak->status_id = 5; // Revisi

            // Clear all previous review notes first before setting the new ones
            $this->clearCatatan($kak);

            // Save specific field notes
            $catatanKak = $data['catatan_kak'] ?? [];
            $kakFieldsMap = [
                'nama_kegiatan' => 'catatan_nama_kegiatan',
                'deskripsi_kegiatan' => 'catatan_deskripsi_kegiatan',
                'tipe_kegiatan_id' => 'catatan_tipe_kegiatan',
                'sasaran_utama' => 'catatan_sasaran_utama',
                'metode_pelaksanaan' => 'catatan_metode_pelaksanaan',
                'lokasi' => 'catatan_lokasi',
                'tanggal' => 'catatan_tanggal',
            ];

            foreach ($kakFieldsMap as $frontendKey => $dbCol) {
                if (isset($catatanKak[$frontendKey])) {
                    $kak->$dbCol = $catatanKak[$frontendKey];
                }
            }

            $kak->save();

            $this->logStatus($kak, $oldStatus, 5, $actor);

            KAKApproval::create([
                'kak_id' => $kak->kak_id,
                'approver_user_id' => $actor->user_id,
                'status' => 'Revisi',
                'tanggal_telaah' => now(),
                'catatan' => $data['catatan'] ?? null,
            ]);

            // Save child items' notes
            $anak = $data['anak'] ?? [];

            // Map table names from request to Eloquent relationships and primary keys
            $childMaps = [
                't_kak_manfaat' => ['relation' => 'manfaat', 'pk' => 'manfaat_id', 'note_col' => 'catatan_manfaat'],
                't_kak_tahapan' => ['relation' => 'tahapan', 'pk' => 'tahapan_id', 'note_col' => 'catatan_verifikator'],
                't_kak_target' => ['relation' => 'targets', 'pk' => 'target_id', 'note_col' => 'catatan_verifikator'],
                't_kak_iku' => ['relation' => 'ikus', 'pk' => 'iku_id', 'note_col' => 'catatan_verifikator'],
                't_kak_anggaran' => ['relation' => 'anggaran', 'pk' => 'anggaran_id', 'note_col' => 'catatan_verifikator'],
            ];

            foreach ($childMaps as $table => $map) {
                if (isset($anak[$table]) && is_array($anak[$table])) {
                    $relation = $map['relation'];
                    $pk = $map['pk'];
                    $noteCol = $map['note_col'];

                    foreach ($anak[$table] as $itemNote) {
                        if (isset($itemNote['id']) && array_key_exists($noteCol, $itemNote)) {
                            $kak->$relation()->where($pk, $itemNote['id'])->update([
                                $noteCol => $itemNote[$noteCol],
                            ]);
                        }
                    }
                }
            }

            event(new KakRevised($kak, 'revised', $data['catatan'] ?? null));
        });
    }

    /**
     * Log status transition helper.
     */
    private function logStatus(KAK $kak, int $oldStatusId, int $newStatusId, User $actor): void
    {
        KAKLogStatus::create([
            'kak_id' => $kak->kak_id,
            'status_id_lama' => $oldStatusId,
            'status_id_baru' => $newStatusId,
            'actor_user_id' => $actor->user_id,
            'created_at' => now(),
        ]);
    }

    /**
     * Clear all reviewer notes helper.
     */
    private function clearCatatan(KAK $kak): void
    {
        $kak->catatan_nama_kegiatan = null;
        $kak->catatan_tipe_kegiatan = null;
        $kak->catatan_deskripsi_kegiatan = null;
        $kak->catatan_sasaran_utama = null;
        $kak->catatan_metode_pelaksanaan = null;
        $kak->catatan_lokasi = null;
        $kak->catatan_tanggal = null;

        // Clear child notes
        $kak->manfaat()->update(['catatan_manfaat' => null]);
        $kak->tahapan()->update(['catatan_verifikator' => null]);
        $kak->targets()->update(['catatan_verifikator' => null]);
        $kak->ikus()->update(['catatan_verifikator' => null]);
        $kak->anggaran()->update(['catatan_verifikator' => null]);
    }
}

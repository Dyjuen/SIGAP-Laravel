<?php

namespace App\Services;

use App\Events\KegiatanApproved;
use App\Exceptions\KegiatanException;
use App\Models\KAK;
use App\Models\Kegiatan;
use App\Models\KegiatanApproval;
use App\Models\KegiatanLogStatus;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class KegiatanService
{
    /** Approval level → role name map used for both validation and next-step logic. */
    private const APPROVAL_ROLE_MAP = [
        'PPK'    => 'PPK',
        'Wadir2' => 'Wadir',
    ];

    /** Ordered steps seeded when a new Kegiatan is created. */
    private const APPROVAL_STEPS = [
        'PPK',
        'Wadir2',
        'Bendahara-Cair',
        'Bendahara-LPJ',
        'Bendahara-Setor',
    ];

    /** KAK status IDs for each approval level. */
    private const NEXT_STATUS = [
        'PPK'    => 7, // Review Wadir 2
        'Wadir2' => 8, // Proses Pencairan
    ];

    /** Level that becomes active after the given one is approved. */
    private const NEXT_STEP = [
        'PPK'    => 'Wadir2',
        'Wadir2' => 'Bendahara-Cair',
    ];

    /**
     * Create a new Kegiatan from an approved KAK.
     *
     * @throws KegiatanException
     */
    public function store(KAK $kak, array $data, ?UploadedFile $suratPengantar, User $actor): Kegiatan
    {
        if ($kak->kegiatan()->exists()) {
            throw new KegiatanException('Kegiatan untuk KAK ini sudah diajukan.');
        }

        if ($kak->status_id !== 3) {
            throw new KegiatanException('KAK belum disetujui Verifikator.');
        }

        $uploadedPath = null;

        try {
            return DB::transaction(function () use ($kak, $data, $suratPengantar, $actor, &$uploadedPath) {
                // 1. Upload surat pengantar
                if ($suratPengantar) {
                    $filename     = time() . '_' . $suratPengantar->getClientOriginalName();
                    $uploadedPath = $suratPengantar->storeAs('surat-pengantar', $filename, 'supabase');

                    if (! $uploadedPath) {
                        throw new KegiatanException('Gagal mengunggah surat pengantar ke storage.');
                    }
                }

                // 2. Create Kegiatan
                $kegiatan = Kegiatan::create([
                    'kak_id'                  => $kak->kak_id,
                    'penanggung_jawab_manual'  => $data['penanggung_jawab_manual'] ?? null,
                    'pelaksana_manual'         => $data['pelaksana_manual'] ?? null,
                    'surat_pengantar_path'     => $uploadedPath,
                ]);

                // 3. Seed approval steps
                foreach (self::APPROVAL_STEPS as $step) {
                    KegiatanApproval::create([
                        'kegiatan_id'    => $kegiatan->kegiatan_id,
                        'approval_level' => $step,
                        'status'         => $step === 'PPK' ? 'Aktif' : 'Menunggu',
                    ]);
                }

                // 4. Advance KAK status → Review PPK
                $oldStatus = $kak->status_id;
                $newStatus = 6;
                $kak->update(['status_id' => $newStatus]);

                // 5. Log
                KegiatanLogStatus::create([
                    'kegiatan_id'    => $kegiatan->kegiatan_id,
                    'status_id_lama' => $oldStatus,
                    'status_id_baru' => $newStatus,
                    'actor_user_id'  => $actor->user_id,
                    'catatan'        => 'Mengajukan Kegiatan',
                ]);

                return $kegiatan;
            });
        } catch (\Exception $e) {
            // Roll back uploaded file on failure
            if ($uploadedPath) {
                Storage::disk('supabase')->delete($uploadedPath);
            }
            throw $e;
        }
    }

    /**
     * Approve the active approval step for a Kegiatan.
     *
     * @throws KegiatanException
     */
    public function approve(Kegiatan $kegiatan, string $actorRole, ?string $catatan, User $actor): void
    {
        DB::transaction(function () use ($kegiatan, $actorRole, $catatan, $actor) {
            // Pessimistic lock on the active approval row
            $activeApproval = KegiatanApproval::where('kegiatan_id', $kegiatan->kegiatan_id)
                ->where('status', 'Aktif')
                ->lockForUpdate()
                ->first();

            if (! $activeApproval) {
                throw new KegiatanException('Tidak ada langkah persetujuan yang aktif.');
            }

            // Guard: role must match the active step
            $expectedRole = self::APPROVAL_ROLE_MAP[$activeApproval->approval_level] ?? null;
            if ($expectedRole === null || $expectedRole !== $actorRole) {
                abort(403, 'Akses ditolak: level persetujuan tidak sesuai dengan role Anda.');
            }

            // Re-check status after lock
            if ($activeApproval->status !== 'Aktif') {
                throw new KegiatanException('Persetujuan ini sudah diproses.');
            }

            // Mark current step approved
            $activeApproval->update([
                'status'           => 'Disetujui',
                'approver_user_id' => $actor->user_id,
                'catatan'          => $catatan,
            ]);

            $level  = $activeApproval->approval_level;
            $kak    = $kegiatan->kak;
            $oldKakStatus = $kak->status_id;

            // Activate next step and advance KAK status
            if (isset(self::NEXT_STEP[$level])) {
                KegiatanApproval::where('kegiatan_id', $kegiatan->kegiatan_id)
                    ->where('approval_level', self::NEXT_STEP[$level])
                    ->update(['status' => 'Aktif']);
            }

            $newStatus = self::NEXT_STATUS[$level] ?? null;

            if ($newStatus) {
                $kak->update(['status_id' => $newStatus]);

                KegiatanLogStatus::create([
                    'kegiatan_id'    => $kegiatan->kegiatan_id,
                    'status_id_lama' => $oldKakStatus,
                    'status_id_baru' => $newStatus,
                    'actor_user_id'  => $actor->user_id,
                    'catatan'        => $catatan ?: 'Disetujui oleh ' . $actorRole,
                ]);

                event(new KegiatanApproved($kegiatan, $actorRole, $catatan));
            }
        });
    }
}

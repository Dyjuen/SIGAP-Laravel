<?php

namespace App\Services;

use App\Models\User;
use App\Models\Kegiatan;
use Illuminate\Database\Eloquent\Builder;

class KegiatanMonitoringService
{
    public const APPROVAL_STEP_MAPPING = [
        'PPK'             => ['step' => 1, 'dateKey' => 'accPPK'],
        'Wadir2'          => ['step' => 2, 'dateKey' => 'accWD2'],
        'Bendahara-Cair'  => ['step' => 3, 'dateKey' => 'uangMuka'],
        'Bendahara-LPJ'   => ['step' => 4, 'dateKey' => 'lpj'],
        'Bendahara-Setor' => ['step' => 5, 'dateKey' => 'setorFisik'],
    ];

    /**
     * Build the query for monitoring based on role.
     */
    public function buildMonitoringQuery(User $user, ?string $searchTerm = null): Builder
    {
        $query = Kegiatan::with(['kak.tipeKegiatan', 'approvals']);
        $role = $user->getRoleName();

        if ($role === 'Pengusul') {
            $query->whereHas('kak', function ($q) use ($user) {
                $q->where('pengusul_user_id', $user->user_id);
            });
        } elseif ($role === 'Verifikator') {
            $tipeKegiatanId = $user->getVerifikatorTipeId();
            if ($tipeKegiatanId !== null) {
                $query->whereHas('kak', function ($q) use ($tipeKegiatanId) {
                    $q->where('tipe_kegiatan_id', $tipeKegiatanId);
                });
            }
        }

        if ($searchTerm) {
            $operator = config('database.default') === 'pgsql' ? 'ilike' : 'like';
            $query->whereHas('kak', function ($q) use ($searchTerm, $operator) {
                $q->where('nama_kegiatan', $operator, '%' . $searchTerm . '%');
            });
        }

        return $query;
    }

    /**
     * Build the stats query based on user role.
     */
    public function buildStatsQuery(User $user): Builder
    {
        $statsQuery = Kegiatan::query();
        $role = $user->getRoleName();

        if ($role === 'Pengusul') {
            $statsQuery->whereHas('kak', function ($q) use ($user) {
                $q->where('pengusul_user_id', $user->user_id);
            });
        } elseif ($role === 'Verifikator') {
            $tipeKegiatanId = $user->getVerifikatorTipeId();
            if ($tipeKegiatanId !== null) {
                $statsQuery->whereHas('kak', function ($q) use ($tipeKegiatanId) {
                    $q->where('tipe_kegiatan_id', $tipeKegiatanId);
                });
            }
        }

        return $statsQuery;
    }

    /**
     * Calculate stats for the dashboard/monitoring page.
     */
    public function getStats(User $user): array
    {
        $statsQuery = $this->buildStatsQuery($user);

        return [
            'total'     => $statsQuery->count(),
            'running'   => (clone $statsQuery)->whereHas('kak', function ($q) {
                $q->whereNotIn('status_id', [5, 10]);
            })->whereHas('approvals', function ($q) {
                $q->where('approval_level', 'Bendahara-Setor')->where('status', '!=', 'Disetujui');
            })->count(),
            'completed' => (clone $statsQuery)->whereHas('approvals', function ($q) {
                $q->where('approval_level', 'Bendahara-Setor')->where('status', 'Disetujui');
            })->count(),
        ];
    }

    /**
     * Map a single kegiatan item into the monitoring response structure.
     */
    public function mapMonitoringItem(Kegiatan $kegiatan): array
    {
        $dates = ['accPPK' => null, 'accWD2' => null, 'uangMuka' => null, 'lpj' => null, 'setorFisik' => null];
        $approvedSteps = [];
        $currentStatus = 1;

        foreach ($kegiatan->approvals as $approval) {
            if (
                ($approval->status === 'Disetujui' || $approval->status === 'Bendahara-Setor')
                && isset(self::APPROVAL_STEP_MAPPING[$approval->approval_level])
            ) {
                $mapping = self::APPROVAL_STEP_MAPPING[$approval->approval_level];
                $dates[$mapping['dateKey']] = $approval->updated_at
                    ? $approval->updated_at->format('d/m/Y')
                    : null;
                $approvedSteps[] = $mapping['step'];
            }
        }

        $maxApprovedStep = ! empty($approvedSteps) ? max($approvedSteps) : 0;
        $activeApproval  = $kegiatan->approvals->where('status', 'Aktif')->first();

        if ($activeApproval && isset(self::APPROVAL_STEP_MAPPING[$activeApproval->approval_level])) {
            $currentStatus = self::APPROVAL_STEP_MAPPING[$activeApproval->approval_level]['step'];
        } else {
            $currentStatus = $maxApprovedStep === 5 ? 6 : $maxApprovedStep + 1;
        }

        return [
            'kak_id'        => $kegiatan->kak_id,
            'kegiatan_id'   => $kegiatan->kegiatan_id,
            'nama_kegiatan' => $kegiatan->kak ? $kegiatan->kak->nama_kegiatan : '-',
            'status'        => $currentStatus,
            'dates'         => $dates,
            'overdueDays'   => 0,
        ];
    }
}

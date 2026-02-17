<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\KAKApproval;
use App\Models\KAKLogStatus;
use App\Models\KegiatanApproval;
use App\Models\KegiatanLogStatus;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Inertia\Inertia;

class LogController extends Controller
{
    public function index(Request $request)
    {
        $filters = $request->only(['role', 'log_type', 'start_date', 'end_date']);

        // Helper to apply filters to query
        $applyFilters = function ($query, $dateCol = 'created_at', $actorCol = 'actor_user_id') use ($filters) {
            if (! empty($filters['start_date'])) {
                $query->whereDate($dateCol, '>=', $filters['start_date']);
            }
            if (! empty($filters['end_date'])) {
                $query->whereDate($dateCol, '<=', $filters['end_date']);
            }
            if (! empty($filters['role'])) {
                $query->whereHas('actor.role', function ($q) use ($filters) {
                    $q->where('nama_role', $filters['role']);
                });
            }
        };

        // 1. KAK Status Logs
        $kakLogs = collect();
        if (empty($filters['log_type']) || $filters['log_type'] === 'KAK_STATUS') {
            $query = KAKLogStatus::with(['actor.role', 'kak', 'oldStatus', 'newStatus']);
            $applyFilters($query, 'timestamp', 'actor_user_id');
            $kakLogs = $query->get()->map(function ($item) {
                return [
                    'log_type' => 'KAK_STATUS',
                    'created_at' => $item->timestamp,
                    'user_id' => $item->actor_user_id,
                    'user_name' => $item->actor->nama_lengkap ?? 'Unknown',
                    'user_role' => $item->actor->role->nama_role ?? 'System',
                    'context_title' => $item->kak->nama_kegiatan ?? '-',
                    'description' => sprintf(
                        'Mengubah status KAK "%s" dari "%s" menjadi "%s"',
                        $item->kak->nama_kegiatan ?? '-',
                        $item->oldStatus->nama_status ?? '-',
                        $item->newStatus->nama_status ?? '-'
                    ),
                    'catatan' => $item->catatan,
                ];
            });
        }

        // 2. Kegiatan Status Logs
        $kegiatanLogs = collect();
        if (empty($filters['log_type']) || $filters['log_type'] === 'KEGIATAN_STATUS') {
            $query = KegiatanLogStatus::with(['actor.role', 'kegiatan.kak', 'oldStatus', 'newStatus']);
            $applyFilters($query, 'timestamp', 'actor_user_id');
            $kegiatanLogs = $query->get()->map(function ($item) {
                return [
                    'log_type' => 'KEGIATAN_STATUS',
                    'created_at' => $item->timestamp,
                    'user_id' => $item->actor_user_id,
                    'user_name' => $item->actor->nama_lengkap ?? 'Unknown',
                    'user_role' => $item->actor->role->nama_role ?? 'System',
                    'context_title' => $item->kegiatan->kak->nama_kegiatan ?? '-',
                    'description' => sprintf(
                        'Mengubah status Kegiatan "%s" dari "%s" menjadi "%s"',
                        $item->kegiatan->kak->nama_kegiatan ?? '-',
                        $item->oldStatus->nama_status ?? '-',
                        $item->newStatus->nama_status ?? '-'
                    ),
                    'catatan' => $item->catatan,
                ];
            });
        }

        // 3. KAK Approval Logs
        $kakApprovalLogs = collect();
        if (empty($filters['log_type']) || $filters['log_type'] === 'KAK_APPROVAL') {
            $query = KAKApproval::with(['approver.role', 'kak']);
            $applyFilters($query, 'created_at', 'approver_user_id');
            $kakApprovalLogs = $query->get()->map(function ($item) {
                return [
                    'log_type' => 'KAK_APPROVAL',
                    'created_at' => $item->created_at,
                    'user_id' => $item->approver_user_id,
                    'user_name' => $item->approver->nama_lengkap ?? 'Unknown',
                    'user_role' => $item->approver->role->nama_role ?? 'System',
                    'context_title' => $item->kak->nama_kegiatan ?? '-',
                    'description' => sprintf(
                        'Memberikan status approval "%s" pada KAK "%s"',
                        $item->status,
                        $item->kak->nama_kegiatan ?? '-'
                    ),
                    'catatan' => $item->catatan,
                ];
            });
        }

        // 4. Kegiatan Approval Logs
        $kegiatanApprovalLogs = collect();
        if (empty($filters['log_type']) || $filters['log_type'] === 'KEGIATAN_APPROVAL') {
            $query = KegiatanApproval::with(['approver.role', 'kegiatan.kak']);
            $applyFilters($query, 'created_at', 'approver_user_id');
            $kegiatanApprovalLogs = $query->get()->map(function ($item) {
                return [
                    'log_type' => 'KEGIATAN_APPROVAL',
                    'created_at' => $item->created_at,
                    'user_id' => $item->approver_user_id,
                    'user_name' => $item->approver->nama_lengkap ?? 'System',
                    'user_role' => $item->approver->role->nama_role ?? 'System',
                    'context_title' => $item->kegiatan->kak->nama_kegiatan ?? '-',
                    'description' => sprintf(
                        'Memberikan status approval "%s" pada Kegiatan "%s" (Level: %s)',
                        $item->status,
                        $item->kegiatan->kak->nama_kegiatan ?? '-',
                        $item->approval_level
                    ),
                    'catatan' => $item->catatan,
                ];
            });
        }

        // Merge, Sort, Paginate
        $merged = $kakLogs->concat($kegiatanLogs)
            ->concat($kakApprovalLogs)
            ->concat($kegiatanApprovalLogs)
            ->sortByDesc('created_at')
            ->values();

        // Pagination
        $perPage = 15;
        $currentPage = LengthAwarePaginator::resolveCurrentPage();
        $currentItems = $merged->slice(($currentPage - 1) * $perPage, $perPage)->values();
        $logs = new LengthAwarePaginator($currentItems, $merged->count(), $perPage, $currentPage, [
            'path' => LengthAwarePaginator::resolveCurrentPath(),
            'query' => $request->query(),
        ]);

        $roles = Role::all(['role_id', 'nama_role']);

        return Inertia::render('Admin/Logs/Index', [
            'logs' => $logs,
            'roles' => $roles,
            'filters' => $filters,
        ]);
    }
}

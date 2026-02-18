<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Role;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LogController extends Controller
{
    public function index(Request $request)
    {
        $filters = $request->only(['role', 'log_type', 'start_date', 'end_date']);

        $logs = \App\Models\LogAktivitas::with(['user.role', 'kak', 'kegiatan.kak', 'oldStatus', 'newStatus'])
            ->filter($filters)
            ->orderBy('created_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        // Transform collection to match desired frontend structure
        $logs->getCollection()->transform(function ($item) {
            return [
                'log_id' => $item->log_id,
                'log_type' => $item->log_type,
                'created_at' => $item->created_at,
                'user_id' => $item->user_id,
                'user_name' => $item->user->nama_lengkap ?? 'Unknown',
                'user_role' => $item->user?->role?->nama_role ?? 'System',
                'context_title' => $item->context_title,
                'description' => $item->log_description,
                'catatan' => $item->catatan,
            ];
        });

        $roles = Role::all(['role_id', 'nama_role']);

        return Inertia::render('Admin/Logs/Index', [
            'logs' => $logs,
            'roles' => $roles,
            'filters' => $filters,
        ]);
    }
}

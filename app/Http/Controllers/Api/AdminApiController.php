<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\KAK;
use App\Models\Kegiatan;
use App\Models\KegiatanApproval;
use App\Models\LogAktivitas;
use App\Models\Panduan;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AdminApiController extends Controller
{
    private function isAdmin(Request $request): bool
    {
        return $request->user()?->role_id === 1;
    }

    private function forbiddenResponse()
    {
        return response()->json(['message' => 'Akses ditolak. Hanya Admin yang dapat mengakses fitur ini.'], 403);
    }

    /**
     * Get real stats for the admin dashboard.
     */
    public function getStats(Request $request)
    {
        $totalKak = KAK::count();
        $totalKegiatan = Kegiatan::count();
        $pendingApprovals = KegiatanApproval::where('status', 'Aktif')->count();
        $totalUsers = User::count();

        // Active users (users who are not soft deleted)
        $activeUsers = User::whereNull('deleted_at')->count();

        return response()->json([
            'total_kak' => $totalKak,
            'total_kegiatan' => $totalKegiatan,
            'pending_approvals' => $pendingApprovals,
            'total_users' => $totalUsers,
            'active_users' => $activeUsers,
        ]);
    }

    /**
     * Get real users.
     */
    public function getUsers(Request $request)
    {
        if (! $this->isAdmin($request)) {
            return $this->forbiddenResponse();
        }

        $users = User::with('role')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn ($user) => [
                'user_id' => $user->user_id,
                'username' => $user->username,
                'nama_lengkap' => $user->nama_lengkap,
                'email' => $user->email,
                'role_name' => $user->getRoleName(),
                'role_id' => $user->role_id,
                'created_at' => $user->created_at?->toIso8601String(),
            ]);

        return response()->json($users);
    }

    /**
     * Create a new user.
     */
    public function createUser(Request $request)
    {
        if (! $this->isAdmin($request)) {
            return $this->forbiddenResponse();
        }

        $request->validate([
            'username' => 'required|string|unique:m_users,username',
            'password' => 'required|string|min:4',
            'nama_lengkap' => 'required|string',
            'email' => 'required|email|unique:m_users,email',
            'role_id' => 'required|integer',
        ]);

        $user = User::create([
            'username' => $request->username,
            'password_hash' => Hash::make($request->password),
            'nama_lengkap' => $request->nama_lengkap,
            'email' => $request->email,
            'role_id' => $request->role_id,
        ]);

        return response()->json([
            'message' => 'User berhasil ditambahkan.',
            'user' => [
                'user_id' => $user->user_id,
                'username' => $user->username,
                'nama_lengkap' => $user->nama_lengkap,
                'email' => $user->email,
                'role_name' => $user->getRoleName(),
                'role_id' => $user->role_id,
            ],
        ], 201);
    }

    /**
     * Delete a user.
     */
    public function deleteUser(Request $request, $id)
    {
        if (! $this->isAdmin($request)) {
            return $this->forbiddenResponse();
        }

        $user = User::findOrFail($id);

        if ($request->user()->user_id === $user->user_id) {
            return response()->json([
                'message' => 'Anda tidak dapat menghapus akun sendiri.',
            ], 403);
        }

        $user->delete();

        return response()->json([
            'message' => 'User berhasil dihapus.',
        ]);
    }

    /**
     * Get recent activity logs.
     */
    public function getLogs(Request $request)
    {
        if (! $this->isAdmin($request)) {
            return $this->forbiddenResponse();
        }

        $logs = LogAktivitas::with(['user.role'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($item) {
                return [
                    'log_id' => $item->log_id,
                    'log_type' => $item->log_type,
                    'created_at' => $item->created_at?->toIso8601String(),
                    'user_name' => $item->user->nama_lengkap ?? 'Unknown',
                    'user_role' => $item->user?->role?->nama_role ?? 'System',
                    'context_title' => $item->context_title,
                    'description' => $item->log_description,
                ];
            });

        return response()->json($logs);
    }

    /**
     * Get real list of system guides (Panduan)
     */
    public function getPanduan(Request $request)
    {
        // All authenticated users can read panduan (matches web behavior)
        $guides = Panduan::orderBy('panduan_id', 'desc')->get()->map(fn ($p) => [
            'id' => $p->panduan_id,
            'title' => $p->judul_panduan,
            'type' => $p->tipe_media,
            'path' => $p->path_media,
            'target_role_id' => $p->target_role_id,
        ]);

        return response()->json($guides);
    }

    /**
     * Add a new system guide manual (Panduan)
     */
    public function createPanduan(Request $request)
    {
        if (! $this->isAdmin($request)) {
            return $this->forbiddenResponse();
        }

        $request->validate([
            'title' => 'required|string',
            'type' => 'required|string|in:document,video',
            'path' => 'required|string',
        ]);

        $p = Panduan::create([
            'judul_panduan' => $request->title,
            'tipe_media' => $request->type,
            'path_media' => $request->path,
            'target_role_id' => null,
        ]);

        return response()->json([
            'message' => 'Panduan berhasil ditambahkan.',
            'guide' => [
                'id' => $p->panduan_id,
                'title' => $p->judul_panduan,
                'type' => $p->tipe_media,
                'path' => $p->path_media,
            ],
        ], 201);
    }

    /**
     * Delete a guide manual (Panduan)
     */
    public function deletePanduan(Request $request, $id)
    {
        if (! $this->isAdmin($request)) {
            return $this->forbiddenResponse();
        }

        $p = Panduan::findOrFail($id);
        $p->delete();

        return response()->json(['message' => 'Panduan berhasil dihapus.']);
    }
}

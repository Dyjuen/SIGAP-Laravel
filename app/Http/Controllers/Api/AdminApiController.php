<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LogAktivitas;
use App\Models\Panduan;
use App\Models\User;
use App\Models\SpkConfig;
use App\Models\Kegiatan;
use Carbon\Carbon;
use Illuminate\Http\Request;
use App\Services\UserService;
use App\Services\PanduanService;
use App\Services\DashboardService;
use App\Http\Requests\Admin\UpdateUserRequest;
use App\Http\Requests\Admin\ChangePasswordRequest;
use App\Http\Requests\Admin\UpdatePanduanRequest;

class AdminApiController extends Controller
{
    protected UserService $userService;
    protected PanduanService $panduanService;
    protected DashboardService $dashboardService;

    public function __construct(
        UserService $userService,
        PanduanService $panduanService,
        DashboardService $dashboardService
    ) {
        $this->userService = $userService;
        $this->panduanService = $panduanService;
        $this->dashboardService = $dashboardService;
    }


    /**
     * Get real stats for the admin dashboard.
     */
    public function getStats(Request $request)
    {
        $stats = $this->dashboardService->getDirekturStats();
        $stats['total_users'] = User::count();
        $stats['active_users'] = User::whereNull('deleted_at')->count();

        return response()->json($stats);
    }

    /**
     * Get real users.
     */
    public function getUsers(Request $request)
    {


        $search = $request->input('search');

        $users = User::with('role')
            ->when($search, function ($query, $search) {
                $operator = config('database.default') === 'pgsql' ? 'ilike' : 'like';
                $query->where(function ($q) use ($search, $operator) {
                    $q->where('nama_lengkap', $operator, "%{$search}%")
                        ->orWhere('username', $operator, "%{$search}%")
                        ->orWhere('email', $operator, "%{$search}%")
                        ->orWhereHas('role', function ($qr) use ($search, $operator) {
                            $qr->where('nama_role', $operator, "%{$search}%");
                        });
                });
            })
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

    public function createUser(\App\Http\Requests\Admin\StoreUserRequest $request)
    {


        $user = $this->userService->create($request->validated());

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


        $user = User::findOrFail($id);

        if ($request->user()->user_id === $user->user_id) {
            return response()->json([
                'message' => 'Anda tidak dapat menghapus akun sendiri.',
            ], 403);
        }

        $this->userService->delete($user);

        return response()->json([
            'message' => 'User berhasil dihapus.',
        ]);
    }

    /**
     * Get recent activity logs.
     */
    public function getLogs(Request $request)
    {


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

    public function createPanduan(\App\Http\Requests\Admin\StorePanduanRequest $request)
    {


        $p = $this->panduanService->store($request->validated(), $request->file('file'));

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


        $p = Panduan::findOrFail($id);
        $this->panduanService->delete($p);

        return response()->json(['message' => 'Panduan berhasil dihapus.']);
    }

    /**
     * Update a user.
     */
    public function updateUser(UpdateUserRequest $request, User $user)
    {
        $this->userService->update($user, $request->validated());

        return response()->json([
            'message' => 'Profil user berhasil diupdate.',
            'user' => [
                'user_id' => $user->user_id,
                'username' => $user->username,
                'nama_lengkap' => $user->nama_lengkap,
                'email' => $user->email,
                'role_id' => $user->role_id,
            ]
        ]);
    }

    /**
     * Change a user's password.
     */
    public function changePasswordUser(ChangePasswordRequest $request, User $user)
    {


        $this->userService->changePassword($user, $request->new_password);

        return response()->json([
            'message' => 'Password user berhasil diubah.',
        ]);
    }

    /**
     * Update a system guide.
     */
    public function updatePanduan(UpdatePanduanRequest $request, Panduan $panduan)
    {


        $this->panduanService->update($panduan, $request->validated(), $request->file('file'));

        return response()->json([
            'message' => 'Panduan berhasil diperbarui.',
            'guide' => [
                'id' => $panduan->panduan_id,
                'title' => $panduan->judul_panduan,
                'type' => $panduan->tipe_media,
                'path' => $panduan->path_media,
            ]
        ]);
    }

    /**
     * Get SPK index data.
     */
    public function getSpk(Request $request)
    {


        $config = SpkConfig::getActive();

        $kegiatansRaw = Kegiatan::with([
            'kak.pengusul',
            'kak.anggaran',
        ])
            ->whereNotNull('lpj_submitted_at')
            ->get();

        $kegiatans = $kegiatansRaw->map(function ($kegiatan) use ($config) {
            $totalBudget = (float) $kegiatan->kak->anggaran->sum('jumlah_diusulkan');
            $totalRealization = (float) $kegiatan->kak->anggaran->sum('realisasi_jumlah');

            $ketepatanAnggaran = $config->anggaran_max;
            if ($totalBudget > 0) {
                $ratio = $totalRealization / $totalBudget;
                if (abs($ratio - 1) >= 0.001) {
                    $differencePercentage = abs(1 - $ratio) * 100;
                    $ketepatanAnggaran = (int) max($config->anggaran_min, min($config->anggaran_max, round($config->anggaran_max - $differencePercentage)));
                }
            }

            $ketepatanLpj = $config->lpj_max;
            if ($kegiatan->tgl_batas_lpj) {
                $deadline = Carbon::parse($kegiatan->tgl_batas_lpj);
                $submissionTime = Carbon::parse($kegiatan->lpj_submitted_at);
                if ($submissionTime->gt($deadline)) {
                    $daysLate = $submissionTime->diffInDays($deadline);
                    $ketepatanLpj = (int) max($config->lpj_min, min($config->lpj_max, $config->lpj_max - ($daysLate * $config->lpj_penalty_per_day)));
                }
            }

            $waktu = (int) $kegiatan->spk_kesesuaian_waktu;
            $output = (int) $kegiatan->spk_kesesuaian_output;

            $totalScore = (
                ($waktu * $config->weight_waktu) +
                ($ketepatanAnggaran * $config->weight_anggaran) +
                ($output * $config->weight_output) +
                ($ketepatanLpj * $config->weight_lpj)
            ) / 100.0;

            $totalScore = round($totalScore, 2);

            if ($totalScore >= 85) {
                $kategori = 'Sangat Baik';
            } elseif ($totalScore >= 70) {
                $kategori = 'Baik';
            } elseif ($totalScore >= 55) {
                $kategori = 'Cukup';
            } else {
                $kategori = 'Kurang';
            }

            return [
                'kegiatan_id' => $kegiatan->kegiatan_id,
                'nama_kegiatan' => $kegiatan->kak->nama_kegiatan ?? '-',
                'pengusul' => $kegiatan->kak->pengusul->nama_lengkap ?? '-',
                'waktu_score' => $waktu,
                'anggaran_score' => $ketepatanAnggaran,
                'output_score' => $output,
                'lpj_score' => $ketepatanLpj,
                'total_score' => $totalScore,
                'kategori' => $kategori,
                'lpj_submitted_at' => $kegiatan->lpj_submitted_at->format('d M Y H:i'),
            ];
        });

        $totalEvaluated = $kegiatans->count();
        $averageScore = $totalEvaluated > 0 ? round($kegiatans->avg('total_score'), 2) : 0;

        $highestKegiatan = null;
        $lowestKegiatan = null;
        if ($totalEvaluated > 0) {
            $sorted = $kegiatans->sortByDesc('total_score');
            $highest = $sorted->first();
            $highestKegiatan = [
                'nama_kegiatan' => $highest['nama_kegiatan'],
                'score' => $highest['total_score'],
            ];

            $lowest = $sorted->last();
            $lowestKegiatan = [
                'nama_kegiatan' => $lowest['nama_kegiatan'],
                'score' => $lowest['total_score'],
            ];
        }

        $categoryCounts = [
            'Sangat Baik' => $kegiatans->where('kategori', 'Sangat Baik')->count(),
            'Baik' => $kegiatans->where('kategori', 'Baik')->count(),
            'Cukup' => $kegiatans->where('kategori', 'Cukup')->count(),
            'Kurang' => $kegiatans->where('kategori', 'Kurang')->count(),
        ];

        return response()->json([
            'spk_config' => $config,
            'kegiatans' => $kegiatans,
            'statistics' => [
                'average_score' => $averageScore,
                'highest_kegiatan' => $highestKegiatan,
                'lowest_kegiatan' => $lowestKegiatan,
                'total_evaluated' => $totalEvaluated,
                'category_counts' => $categoryCounts,
            ],
        ]);
    }

    /**
     * Update SPK config.
     */
    public function updateSpkConfig(Request $request)
    {
        $validatedData = $request->validate([
            'weight_waktu' => ['required', 'numeric', 'min:0', 'max:100'],
            'weight_anggaran' => ['required', 'numeric', 'min:0', 'max:100'],
            'weight_output' => ['required', 'numeric', 'min:0', 'max:100'],
            'weight_lpj' => ['required', 'numeric', 'min:0', 'max:100'],
            'waktu_min' => ['required', 'integer', 'min:0', 'max:100'],
            'waktu_max' => ['required', 'integer', 'min:0', 'max:100', 'gt:waktu_min'],
            'anggaran_min' => ['required', 'integer', 'min:0', 'max:100'],
            'anggaran_max' => ['required', 'integer', 'min:0', 'max:100', 'gt:anggaran_min'],
            'output_min' => ['required', 'integer', 'min:0', 'max:100'],
            'output_max' => ['required', 'integer', 'min:0', 'max:100', 'gt:output_min'],
            'lpj_min' => ['required', 'integer', 'min:0', 'max:100'],
            'lpj_max' => ['required', 'integer', 'min:0', 'max:100', 'gt:lpj_min'],
            'lpj_penalty_per_day' => ['required', 'integer', 'min:0', 'max:50'],
        ], [
            'required' => ':attribute wajib diisi.',
            'numeric' => ':attribute harus berupa angka.',
            'integer' => ':attribute harus berupa bilangan bulat.',
            'min' => ':attribute minimal :min.',
            'max' => ':attribute maksimal :max.',
            'gt' => ':attribute harus lebih besar dari :value.',
        ]);

        $sum = floatval($request->weight_waktu) +
               floatval($request->weight_anggaran) +
               floatval($request->weight_output) +
               floatval($request->weight_lpj);

        if (abs($sum - 100.0) > 0.001) {
            return response()->json([
                'message' => 'Jumlah seluruh bobot kriteria harus tepat bernilai 100% (saat ini '.$sum.'%).',
                'errors' => [
                    'weights_sum' => ['Jumlah seluruh bobot kriteria harus tepat bernilai 100% (saat ini '.$sum.'%).']
                ]
            ], 422);
        }

        $config = SpkConfig::getActive();
        $config->update($validatedData);

        return response()->json([
            'message' => 'Konfigurasi parameter SPK berhasil diperbarui.',
            'spk_config' => $config,
        ]);
    }
}

<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ChangePasswordRequest;
use App\Http\Requests\Admin\StoreUserRequest;
use App\Http\Requests\Admin\UpdateUserRequest;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use App\Services\UserService;
use Inertia\Inertia;
use Inertia\Response;

class AccountController extends Controller
{
    protected UserService $userService;

    public function __construct(UserService $userService)
    {
        $this->userService = $userService;
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
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
                'role' => $user->getRoleName(),
                'role_id' => $user->role_id,
                'created_at' => $user->created_at,
            ]);

        $roles = Role::all(['role_id', 'nama_role']);

        return Inertia::render('Admin/UserManagement/Index', [
            'users' => $users,
            'roles' => $roles,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreUserRequest $request)
    {
        $this->userService->create($request->all());

        return redirect()->back()->with('success', 'User berhasil ditambahkan.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateUserRequest $request, User $user)
    {
        $this->userService->update($user, $request->all());

        return redirect()->back()->with('success', 'Profil user berhasil diupdate.');
    }

    /**
     * Change the user's password.
     */
    public function changePassword(ChangePasswordRequest $request, User $user)
    {
        $this->userService->changePassword($user, $request->new_password);

        return redirect()->back()->with('success', 'Password user berhasil diubah.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, User $user)
    {
        if ($request->user()->user_id === $user->user_id) {
            abort(403, 'Anda tidak dapat menghapus akun sendiri.');
        }

        $this->userService->delete($user);

        return redirect()->back()->with('success', 'User berhasil dihapus.');
    }
}

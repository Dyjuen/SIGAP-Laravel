<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ChangePasswordRequest;
use App\Http\Requests\Admin\StoreUserRequest;
use App\Http\Requests\Admin\UpdateUserRequest;
use App\Mail\PasswordResetMail;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;

class AccountController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        $users = User::with('role')
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
        User::create([
            'username' => $request->username,
            'password_hash' => Hash::make($request->password),
            'nama_lengkap' => $request->nama_lengkap,
            'email' => $request->email,
            'role_id' => $request->role_ids[0] ?? null,
        ]);

        return redirect()->back()->with('success', 'User berhasil ditambahkan.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateUserRequest $request, User $user)
    {
        $user->update([
            'nama_lengkap' => $request->nama_lengkap,
            'email' => $request->email,
            'role_id' => $request->role_ids[0] ?? null,
        ]);

        return redirect()->back()->with('success', 'Profil user berhasil diupdate.');
    }

    /**
     * Change the user's password.
     */
    public function changePassword(ChangePasswordRequest $request, User $user)
    {
        $user->update([
            'password_hash' => Hash::make($request->new_password),
        ]);

        // Notify user via email
        if ($user->email) {
            Mail::to($user->email)->send(new PasswordResetMail([
                'recipient_name' => $user->nama_lengkap,
                'new_password' => $request->new_password,
                'action_link' => config('app.url').'/login',
            ]));
        }

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

        $user->delete();

        return redirect()->back()->with('success', 'User berhasil dihapus.');
    }
}

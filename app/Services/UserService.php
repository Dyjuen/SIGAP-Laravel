<?php

namespace App\Services;

use App\Events\UserPasswordReset;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserService
{
    /**
     * Create a new user.
     */
    public function create(array $data): User
    {
        return User::create([
            'username' => $data['username'],
            'password_hash' => Hash::make($data['password']),
            'nama_lengkap' => $data['nama_lengkap'],
            'email' => $data['email'],
            'role_id' => $data['role_id'] ?? $data['role_ids'][0] ?? null,
        ]);
    }

    /**
     * Update an existing user.
     */
    public function update(User $user, array $data): User
    {
        $user->update([
            'nama_lengkap' => $data['nama_lengkap'],
            'email' => $data['email'],
            'role_id' => $data['role_id'] ?? $data['role_ids'][0] ?? null,
        ]);

        return $user;
    }

    /**
     * Change user's password and dispatch reset event.
     */
    public function changePassword(User $user, string $newPassword): void
    {
        $user->update([
            'password_hash' => Hash::make($newPassword),
        ]);

        event(new UserPasswordReset($user, $newPassword));
    }

    /**
     * Delete a user.
     */
    public function delete(User $user): void
    {
        $user->delete();
    }
}

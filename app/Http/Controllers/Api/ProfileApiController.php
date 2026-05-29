<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class ProfileApiController extends Controller
{
    /**
     * Get user profile.
     */
    public function show(Request $request)
    {
        return response()->json($request->user());
    }

    /**
     * Update user profile.
     */
    public function update(ProfileUpdateRequest $request)
    {
        $user = $request->user();
        $user->fill($request->validated());
        $user->save();

        return response()->json([
            'message' => 'Profil berhasil diperbarui.',
            'user' => $user,
        ]);
    }

    /**
     * Delete user profile.
     */
    public function destroy(Request $request)
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ], [
            'password.required' => 'Kata sandi harus diisi.',
            'password.current_password' => 'Kata sandi yang Anda masukkan salah.',
        ]);

        $user = $request->user();
        $user->delete();

        return response()->json([
            'message' => 'Akun berhasil dihapus.',
        ]);
    }
}

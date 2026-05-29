<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    /**
     * Handle a login request to the application via API.
     */
    public function login(Request $request)
    {
        $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        if (! Auth::attempt($request->only('username', 'password'))) {
            return response()->json([
                'message' => 'Kredensial tidak valid.',
            ], 401);
        }

        $user = Auth::user();
        $token = $user->createToken('mobile-app')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => [
                'id' => $user->user_id,
                'username' => $user->username,
                'nama_lengkap' => $user->nama_lengkap,
                'email' => $user->email,
                'role_id' => $user->role_id,
                'role_name' => $user->getRoleName(),
            ],
        ]);
    }

    /**
     * Handle a logout request via API.
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully',
        ]);
    }

    /**
     * Handle a token refresh request via API (rolling token refresh).
     */
    public function refresh(Request $request)
    {
        $user = $request->user();
        $user->currentAccessToken()->delete();
        $newToken = $user->createToken('mobile-app')->plainTextToken;

        return response()->json([
            'token' => $newToken,
        ]);
    }
}

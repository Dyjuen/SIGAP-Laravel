<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DeviceToken;
use Illuminate\Http\Request;

class DeviceTokenController extends Controller
{
    /**
     * Store or update a device token.
     */
    public function store(Request $request)
    {
        $request->validate([
            'token' => 'required|string|max:500',
            'platform' => 'required|string|in:android',
        ]);

        $user = $request->user();

        // Upsert the token. If it already exists, associate it with the current user.
        DeviceToken::updateOrCreate(
            ['token' => $request->token],
            [
                'user_id' => $user->user_id,
                'platform' => $request->platform,
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Token perangkat berhasil disimpan.',
        ]);
    }

    /**
     * Delete a device token.
     */
    public function destroy(Request $request)
    {
        $request->validate([
            'token' => 'required|string|max:500',
        ]);

        DeviceToken::where('token', $request->token)
            ->where('user_id', $request->user()->user_id)
            ->delete();

        return response()->json([
            'success' => true,
            'message' => 'Token perangkat berhasil dihapus.',
        ]);
    }
}

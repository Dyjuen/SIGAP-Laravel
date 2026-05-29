<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notifikasi;
use Illuminate\Http\Request;

class NotificationApiController extends Controller
{
    /**
     * Get user notifications.
     */
    public function index(Request $request)
    {
        $notifications = Notifikasi::where('penerima_user_id', $request->user()->user_id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($notifications);
    }

    /**
     * Mark a notification as read.
     */
    public function markAsRead(Request $request, Notifikasi $notification)
    {
        if ($notification->penerima_user_id !== $request->user()->user_id) {
            return response()->json(['message' => 'Akses ditolak.'], 403);
        }

        $notification->update(['is_read' => 1]);

        return response()->json([
            'success' => true,
            'message' => 'Notifikasi ditandai telah dibaca.'
        ]);
    }

    /**
     * Mark all unread notifications as read.
     */
    public function markAllAsRead(Request $request)
    {
        Notifikasi::where('penerima_user_id', $request->user()->user_id)
            ->where('is_read', 0)
            ->update(['is_read' => 1]);

        return response()->json([
            'success' => true,
            'message' => 'Semua notifikasi ditandai telah dibaca.'
        ]);
    }
}

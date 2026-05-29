<?php

namespace App\Http\Controllers;

use App\Models\Notifikasi;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class NotificationController extends Controller
{
    /**
     * Mark a notification as read.
     */
    public function markAsRead(Notifikasi $notification)
    {
        // Simple Gate check for ownership
        if ($notification->penerima_user_id !== auth()->id()) {
            abort(403);
        }

        $notification->update(['is_read' => 1]);

        return response()->json(['message' => 'Notification marked as read']);
    }

    /**
     * Mark all unread notifications for the current user as read.
     */
    public function markAllAsRead()
    {
        Notifikasi::where('penerima_user_id', auth()->id())
            ->where('is_read', 0)
            ->update(['is_read' => 1]);

        return response()->json(['message' => 'All notifications marked as read']);
    }
}

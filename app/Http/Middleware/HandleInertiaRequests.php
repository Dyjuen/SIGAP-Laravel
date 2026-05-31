<?php

namespace App\Http\Middleware;

use App\Models\Notifikasi;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user() ? [
                    'id' => $request->user()->user_id,
                    'username' => $request->user()->username,
                    'nama_lengkap' => $request->user()->nama_lengkap,
                    'email' => $request->user()->email,
                    'role_id' => $request->user()->role_id, // Expose role_id for frontend logic
                    'role' => $request->user()->getRoleName(),
                    'unread_notifications' => Notifikasi::where('penerima_user_id', $request->user()->user_id)
                        ->where('is_read', 0)
                        ->latest('notifikasi_id')
                        ->limit(10)
                        ->get(),
                ] : null,
            ],
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
                'message' => $request->session()->get('message'),
            ],
            'app' => [
                'notification_polling_interval' => (int) env('NOTIFICATION_POLLING_INTERVAL', 300000), // Default 5 mins
            ],
        ];
    }
}

<?php

namespace App\Providers;

use App\Events\KakApproved;
use App\Events\KakRejected;
use App\Events\KakRevised;
use App\Events\KakSubmitted;
use App\Events\KegiatanApproved;
use App\Events\LpjApproved;
use App\Events\LpjCompleted;
use App\Events\LpjRevised;
use App\Events\LpjSubmitted;
use App\Events\PencairanSelesai;
use App\Events\UserPasswordReset;
use App\Listeners\SendKakWorkflowEmail;
use App\Listeners\SendKegiatanEmail;
use App\Listeners\SendLpjEmail;
use App\Listeners\SendPasswordResetEmail;
use App\Listeners\SendPencairanEmail;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;
use Kreait\Firebase\Messaging;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(Messaging::class, function ($app) {
            return $app->make('firebase.messaging');
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        Event::listen(KakSubmitted::class, SendKakWorkflowEmail::class);
        Event::listen(KakApproved::class, SendKakWorkflowEmail::class);
        Event::listen(KakRejected::class, SendKakWorkflowEmail::class);
        Event::listen(KakRevised::class, SendKakWorkflowEmail::class);
        Event::listen(UserPasswordReset::class, SendPasswordResetEmail::class);
        Event::listen(LpjSubmitted::class, SendLpjEmail::class);
        Event::listen(LpjRevised::class, SendLpjEmail::class);
        Event::listen(LpjApproved::class, SendLpjEmail::class);
        Event::listen(LpjCompleted::class, SendLpjEmail::class);
        Event::listen(PencairanSelesai::class, SendPencairanEmail::class);
        Event::listen(KegiatanApproved::class, SendKegiatanEmail::class);

        // Configure strong password defaults
        Password::defaults(function () {
            $rule = Password::min(10)
                ->letters()
                ->mixedCase()
                ->numbers()
                ->symbols();

            return app()->isProduction() ? $rule->uncompromised() : $rule;
        });

        // Audit Trail untuk Login
        Event::listen(\Illuminate\Auth\Events\Login::class, function ($event) {
            \Illuminate\Support\Facades\Log::info('[AUTH_AUDIT] Login Sukses', [
                'user_id' => $event->user->user_id ?? $event->user->id,
                'username' => $event->user->username ?? $event->user->email,
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
                'timestamp' => now()->toIso8601String(),
            ]);
        });

        // Audit Trail untuk Logout
        Event::listen(\Illuminate\Auth\Events\Logout::class, function ($event) {
            if ($event->user) {
                \Illuminate\Support\Facades\Log::info('[AUTH_AUDIT] Logout', [
                    'user_id' => $event->user->user_id ?? $event->user->id,
                    'username' => $event->user->username ?? $event->user->email,
                    'ip_address' => request()->ip(),
                    'user_agent' => request()->userAgent(),
                    'timestamp' => now()->toIso8601String(),
                ]);
            }
        });

        // Audit Trail untuk Percobaan Login Gagal
        Event::listen(\Illuminate\Auth\Events\Failed::class, function ($event) {
            \Illuminate\Support\Facades\Log::warning('[AUTH_AUDIT] Login Gagal', [
                'username_attempted' => $event->credentials['username'] ?? $event->credentials['email'] ?? 'unknown',
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
                'timestamp' => now()->toIso8601String(),
            ]);
        });
    }
}

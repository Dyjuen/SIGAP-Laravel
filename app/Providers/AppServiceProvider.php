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

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
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
    }
}

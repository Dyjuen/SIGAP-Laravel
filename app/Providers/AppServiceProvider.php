<?php

namespace App\Providers;

use Illuminate\Support\Facades\Event;
use App\Events\KakSubmitted;
use App\Events\KakApproved;
use App\Events\KakRejected;
use App\Events\KakRevised;
use App\Events\KegiatanApproved;
use App\Events\UserPasswordReset;
use App\Listeners\SendKakWorkflowEmail;
use App\Listeners\SendKegiatanEmail;
use App\Listeners\SendPasswordResetEmail;
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
        Event::listen(\App\Events\LpjSubmitted::class, \App\Listeners\SendLpjEmail::class);
        Event::listen(\App\Events\LpjRevised::class, \App\Listeners\SendLpjEmail::class);
        Event::listen(\App\Events\LpjApproved::class, \App\Listeners\SendLpjEmail::class);
        Event::listen(\App\Events\LpjCompleted::class, \App\Listeners\SendLpjEmail::class);
        Event::listen(\App\Events\PencairanSelesai::class, \App\Listeners\SendPencairanEmail::class);
        Event::listen(KegiatanApproved::class, SendKegiatanEmail::class);
    }
}


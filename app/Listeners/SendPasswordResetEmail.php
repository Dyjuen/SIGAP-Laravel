<?php

namespace App\Listeners;

use App\Events\UserPasswordReset;
use App\Mail\PasswordResetMail;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Mail;

class SendPasswordResetEmail
{
    use InteractsWithQueue;

    /**
     * Handle the event.
     */
    public function handle(UserPasswordReset $event): void
    {
        $user = $event->user;

        if ($user->email) {
            Mail::to($user->email)->send(new PasswordResetMail([
                'recipient_name' => $user->nama_lengkap,
                'new_password' => $event->newPassword,
                'action_link' => config('app.url').'/login',
            ]));
        }
    }
}

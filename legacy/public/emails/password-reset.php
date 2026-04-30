<?php

// File: app/Views/emails/password-reset.php

$emailData = [
    'title' => 'Password direset',
    'status_color' => '#1ABDD4',
    'body' => "Halo, <strong>{$nama_user}</strong>. Password Anda untuk akun SIGAP PNJ telah berhasil direset.<br><br>Berikut adalah password sementara Anda:<br><strong>{$new_password}</strong>",
    'button_text' => 'Login Sekarang',
    'button_link' => $login_link,
    'footer_line1' => 'Jika Anda tidak merasa meminta reset password, mohon abaikan email ini.',
    'footer_line2' => 'Atau hubungi admin jika Anda merasa ada aktivitas yang mencurigakan.',
];

$subject = 'Password SIGAP PNJ Direset';

require __DIR__.'/_base.php';

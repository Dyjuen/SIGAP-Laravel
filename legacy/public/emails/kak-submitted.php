<?php

$emailData = [
    'title' => 'KAK Baru Disubmit',
    'status_color' => '#1ABDD4',
    'body' => "Halo <strong>Verifikator</strong>,<br><br>Ada KAK baru yang telah disubmit dan membutuhkan verifikasi.<br><br>Nama Kegiatan: <strong>{$nama_kegiatan}</strong><br>Diajukan oleh: <strong>{$pengusul_nama}</strong>",
    'button_text' => 'Review KAK',
    'button_link' => $actionLink,
];

$subject = '🔔 KAK Baru Membutuhkan Verifikasi';
require __DIR__.'/_base.php';

<?php

$emailData = [
    'title' => 'LPJ Baru Disubmit',
    'status_color' => '#1ABDD4',
    'body' => "Halo Tim Bendahara,<br><br>Laporan Pertanggungjawaban (LPJ) baru telah diserahkan oleh <strong>{$pengusul_nama}</strong> untuk kegiatan \"<strong>{$nama_kegiatan}</strong>\". Mohon untuk direview.",
    'button_text' => 'Review LPJ',
    'button_link' => $actionLink,
];

$subject = '🔔 LPJ Baru Membutuhkan Verifikasi';
require __DIR__.'/_base.php';

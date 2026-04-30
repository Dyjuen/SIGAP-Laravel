<?php

$emailData = [
    'title' => 'KAK Disetujui',
    'status_color' => '#28a745',
    'icon_text' => '✓',
    'body' => "Selamat <strong>{$pengusul_nama}</strong>,<br><br>KAK Anda untuk kegiatan \"<strong>{$nama_kegiatan}</strong>\" telah disetujui.<br><br>Langkah selanjutnya adalah membuat kegiatan berdasarkan KAK ini.",
    'button_text' => 'Buat Kegiatan',
    'button_link' => $actionLink,
];

$subject = '✅ KAK Disetujui - Lanjutkan ke Kegiatan';
require __DIR__.'/_base.php';

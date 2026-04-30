<?php

$emailData = [
    'title' => 'Pengingat LPJ H-7',
    'status_color' => '#1ABDD4',
    'icon_text' => '7',
    'body' => "Halo <strong>{$pengusul_nama}</strong>,<br><br>Ini adalah pengingat bahwa Laporan Pertanggungjawaban (LPJ) untuk kegiatan \"<strong>{$nama_kegiatan}</strong>\" harus diserahkan dalam 7 hari.",
    'button_text' => 'Lihat Detail Kegiatan',
    'button_link' => $actionLink,
];

$subject = 'Pengingat LPJ H-7';
require __DIR__.'/_base.php';

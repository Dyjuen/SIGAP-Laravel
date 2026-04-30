<?php

$emailData = [
    'title' => 'Pengingat LPJ H-1',
    'status_color' => '#dc3545',
    'icon_text' => '1',
    'body' => "Halo <strong>{$pengusul_nama}</strong>,<br><br>Ini adalah pengingat bahwa Laporan Pertanggungjawaban (LPJ) untuk kegiatan \"<strong>{$nama_kegiatan}</strong>\" harus diserahkan besok.",
    'button_text' => 'Lihat Detail Kegiatan',
    'button_link' => $actionLink,
];

$subject = 'Pengingat LPJ H-1';
require __DIR__.'/_base.php';

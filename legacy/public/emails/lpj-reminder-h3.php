<?php

$emailData = [
    'title' => 'Pengingat LPJ H-3',
    'status_color' => '#ffc107',
    'icon_text' => '3',
    'body' => "Halo <strong>{$pengusul_nama}</strong>,<br><br>Ini adalah pengingat bahwa Laporan Pertanggungjawaban (LPJ) untuk kegiatan \"<strong>{$nama_kegiatan}</strong>\" harus diserahkan dalam 3 hari.",
    'button_text' => 'Lihat Detail Kegiatan',
    'button_link' => $actionLink,
];

$subject = 'Pengingat LPJ H-3';
require __DIR__.'/_base.php';

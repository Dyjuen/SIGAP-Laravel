<?php

$emailData = [
    'title' => 'LPJ Melebihi Batas Waktu',
    'status_color' => '#dc3545',
    'icon_text' => '✗',
    'body' => "Halo <strong>{$pengusul_nama}</strong>,<br><br>Laporan Pertanggungjawaban (LPJ) untuk kegiatan \"<strong>{$nama_kegiatan}</strong>\" telah melewati batas waktu pengumpulan.",
    'button_text' => 'Lihat Detail Kegiatan',
    'button_link' => $actionLink,
];

$subject = 'LPJ Melebihi Batas Waktu';
require __DIR__.'/_base.php';

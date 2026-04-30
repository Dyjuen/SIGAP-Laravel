<?php

$emailData = [
    'title' => 'LPJ Ditolak',
    'status_color' => '#dc3545',
    'icon_text' => '✗',
    'body' => "Halo <strong>{$pengusul_nama}</strong>,<br><br>Laporan Pertanggungjawaban (LPJ) untuk kegiatan \"<strong>{$nama_kegiatan}</strong>\" telah ditolak.<br><br><strong>Catatan dari reviewer:</strong> ".($catatan ?? ''),
    'button_text' => 'Lihat Detail Kegiatan',
    'button_link' => $actionLink,
];

$subject = '❌ LPJ Ditolak';
require __DIR__.'/_base.php';

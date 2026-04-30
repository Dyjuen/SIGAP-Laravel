<?php

$emailData = [
    'title' => 'LPJ Disetujui',
    'status_color' => '#28a745',
    'icon_text' => '✓',
    'body' => "Halo <strong>{$pengusul_nama}</strong>,<br><br>Laporan Pertanggungjawaban (LPJ) untuk kegiatan \"<strong>{$nama_kegiatan}</strong>\" telah disetujui.",
    'button_text' => 'Lihat Detail Kegiatan',
    'button_link' => $actionLink,
];

$subject = '✅ LPJ Disetujui';
require __DIR__.'/_base.php';

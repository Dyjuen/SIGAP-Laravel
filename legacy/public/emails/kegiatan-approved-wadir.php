<?php

$emailData = [
    'title' => 'Kegiatan Disetujui Wadir',
    'status_color' => '#28a745',
    'icon_text' => '✓',
    'body' => "Halo <strong>{$pengusul_nama}</strong>,<br><br>Kegiatan Anda \"<strong>{$nama_kegiatan}</strong>\" telah disetujui oleh Wadir.",
    'button_text' => 'Lihat Detail Kegiatan',
    'button_link' => $actionLink,
];

$subject = '✅ Kegiatan Disetujui Wadir';
require __DIR__.'/_base.php';

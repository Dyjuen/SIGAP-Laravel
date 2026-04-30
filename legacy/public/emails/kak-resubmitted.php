<?php

$emailData = [
    'title' => 'KAK Telah Direvisi',
    'status_color' => '#1ABDD4',
    'body' => "Halo <strong>Verifikator</strong>,<br><br>KAK yang sebelumnya diminta revisi telah diperbaiki dan di-resubmit. Silakan review kembali.<br><br>Kegiatan: <strong>{$nama_kegiatan}</strong><br>Diajukan oleh: <strong>{$pengusul_nama}</strong>",
    'button_text' => 'Review Revisi',
    'button_link' => $actionLink,
];

$subject = '🔄 KAK Sudah Direvisi - Perlu Review Ulang';
require __DIR__.'/_base.php';

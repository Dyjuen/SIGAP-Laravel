<?php

$emailData = [
    'title' => 'KAK Ditolak',
    'status_color' => '#dc3545',
    'icon_text' => '✗',
    'body' => "Mohon maaf <strong>{$pengusul_nama}</strong>,<br><br>KAK Anda untuk kegiatan \"<strong>{$nama_kegiatan}</strong>\" telah ditolak.<br><br><strong>Alasan Penolakan:</strong> ".($catatan ?? '').'<br><br>Anda bisa membuat KAK baru atau menghubungi tim verifikator untuk mendiskusikan keputusan ini.',
];

$subject = '❌ KAK Ditolak';
require __DIR__.'/_base.php';

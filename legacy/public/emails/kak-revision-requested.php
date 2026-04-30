<?php

$emailData = [
    'title' => 'KAK Perlu Revisi',
    'status_color' => '#ffc107',
    'body' => "Halo <strong>{$pengusul_nama}</strong>,<br><br>KAK Anda membutuhkan revisi sebelum dapat disetujui. Silakan pelajari catatan verifikator di bawah ini.<br><br><strong>Catatan untuk Revisi:</strong> ".($catatan ?? ''),
    'button_text' => 'Edit & Resubmit',
    'button_link' => $actionLink,
];

$subject = '⚠️ KAK Perlu Revisi';
require __DIR__.'/_base.php';

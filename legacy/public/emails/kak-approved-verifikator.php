<?php

$emailData = [
    'title' => 'KAK Anda Telah Disetujui Verifikator',
    'status_color' => '#28a745', // Green for approved
    'icon_text' => '✓',
    'body' => "Selamat <strong>{$nama_pengusul}</strong>,<br><br>KAK Anda untuk kegiatan \"<strong>{$nama_kegiatan}</strong>\" telah **disetujui oleh verifikator**.<br><br>Anda dapat melihat detail KAK dan melanjutkan proses selanjutnya.",
    'button_text' => 'Lihat Detail KAK',
    'button_link' => $actionLink, // This will come from MailService
];

$subject = '✅ KAK Anda Telah Disetujui Verifikator';
require __DIR__.'/_base.php';

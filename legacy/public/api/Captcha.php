<?php

// public/api/captcha.php
session_start();

// Generate random captcha
$chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
$captcha = '';
for ($i = 0; $i < 6; $i++) {
    $captcha .= $chars[rand(0, strlen($chars) - 1)];
}
$_SESSION['captcha'] = $captcha;

// Image settings
$w = 200;
$h = 70;
$img = imagecreatetruecolor($w, $h);
imageantialias($img, true);

// CYAN THEME COLORS
$cyan_light = imagecolorallocate($img, 230, 250, 255);
$cyan_main = imagecolorallocate($img, 51, 200, 218);
$cyan_dark = imagecolorallocate($img, 30, 120, 140);
$cyan_border = imagecolorallocate($img, 51, 200, 218);
$cyan_line = imagecolorallocatealpha($img, 51, 200, 218, 80);

// Gradient background cyan
for ($y = 0; $y < $h; $y++) {
    $r = 230 - ($y / $h * 40);
    $g = 250 - ($y / $h * 10);
    $b = 255 - ($y / $h * 5);
    $c = imagecolorallocate($img, $r, $g, $b);
    imageline($img, 0, $y, $w, $y, $c);
}

// Decorative waves
for ($i = 0; $i < 3; $i++) {
    $offset = $i * 15;
    for ($x = 0; $x < $w; $x += 2) {
        $y = ($h / 2) + sin(($x + $offset) * 0.08) * 12;
        imagefilledellipse($img, $x, $y, 2, 2, $cyan_line);
    }
}

// Random dots pattern
for ($i = 0; $i < 40; $i++) {
    imagefilledellipse($img, rand(0, $w), rand(0, $h), rand(1, 3), rand(1, 3), $cyan_line);
}

// Draw captcha text
$spacing = 28;
$start_x = ($w - (strlen($captcha) * $spacing)) / 2;

for ($i = 0; $i < strlen($captcha); $i++) {
    $char = $captcha[$i];
    $x = $start_x + ($i * $spacing) + rand(-4, 4);
    $y = ($h / 2) - 15 + rand(-5, 5);

    // Shadow cyan terang
    $shadow = imagecolorallocatealpha($img, 100, 220, 230, 60);
    imagestring($img, 5, $x + 2, $y + 2, $char, $shadow);

    // Text utama cyan gelap
    imagestring($img, 5, $x, $y, $char, $cyan_dark);
}

// Border cyan 2px
imagesetthickness($img, 2);
imagerectangle($img, 1, 1, $w - 2, $h - 2, $cyan_border);

// No cache headers
header('Content-Type: image/png');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Cache-Control: post-check=0, pre-check=0', false);
header('Pragma: no-cache');
header('Expires: Mon, 01 Jan 1970 00:00:00 GMT');

imagepng($img, null, 9);
imagedestroy($img);

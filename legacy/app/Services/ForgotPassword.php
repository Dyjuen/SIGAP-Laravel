<?php

// api/auth/forgot-password.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only allow POST method
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

// Validate input
if (! isset($input['username']) || ! isset($input['email'])) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Username dan email harus diisi',
    ]);
    exit();
}

$username = trim($input['username']);
$email = trim($input['email']);

// Validate email format
if (! filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Format email tidak valid',
    ]);
    exit();
}

try {
    // Database connection (adjust with your config)
    require_once __DIR__.'/../../config/database.php';

    // Check if user exists with matching username and email
    $stmt = $pdo->prepare('
        SELECT id, username, email, nama 
        FROM users 
        WHERE username = ? AND email = ? AND deleted_at IS NULL
    ');
    $stmt->execute([$username, $email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (! $user) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => 'Username atau email tidak ditemukan',
        ]);
        exit();
    }

    // Generate new random password
    $newPassword = bin2hex(random_bytes(4)); // 8 character random password
    $hashedPassword = password_hash($newPassword, PASSWORD_BCRYPT);

    // Update password in database
    $updateStmt = $pdo->prepare('
        UPDATE users 
        SET password = ?, updated_at = NOW() 
        WHERE id = ?
    ');
    $updateStmt->execute([$hashedPassword, $user['id']]);

    // Send email with new password
    $to = $user['email'];
    $subject = 'Reset Password - SIGAP PNJ';
    $message = "
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #33C8DA 0%, #2BA9B8 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 10px 10px; }
            .password-box { background: white; border: 2px solid #33C8DA; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 2px; color: #2BA9B8; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='header'>
                <h2>Reset Password SIGAP PNJ</h2>
            </div>
            <div class='content'>
                <p>Halo <strong>{$user['nama']}</strong>,</p>
                <p>Anda telah meminta reset password untuk akun SIGAP PNJ Anda.</p>
                <p>Berikut adalah password baru Anda:</p>
                <div class='password-box'>{$newPassword}</div>
                <p><strong>Username:</strong> {$user['username']}</p>
                <p>Silakan login menggunakan password baru di atas. Kami sangat menyarankan Anda untuk mengganti password ini setelah login pertama.</p>
                <p>Jika Anda tidak meminta reset password, silakan hubungi administrator segera.</p>
            </div>
            <div class='footer'>
                <p>Sistem Informasi Pengelolaan Anggaran dan Pelaporan</p>
                <p>Politeknik Negeri Jakarta</p>
            </div>
        </div>
    </body>
    </html>
    ";

    $headers = 'MIME-Version: 1.0'."\r\n";
    $headers .= 'Content-type:text/html;charset=UTF-8'."\r\n";
    $headers .= 'From: SIGAP PNJ <no-reply@sigap-pnj.ac.id>'."\r\n";

    // Send email
    $emailSent = mail($to, $subject, $message, $headers);

    if (! $emailSent) {
        // Log the error but still return success (password was changed)
        error_log("Failed to send email to {$email}");
    }

    // Log the activity
    $logStmt = $pdo->prepare("
        INSERT INTO activity_logs (user_id, action, description, created_at) 
        VALUES (?, 'forgot_password', ?, NOW())
    ");
    $logStmt->execute([
        $user['id'],
        "Password reset requested from IP: {$_SERVER['REMOTE_ADDR']}",
    ]);

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Password baru telah dikirim ke email Anda. Silakan cek inbox atau folder spam.',
    ]);

} catch (PDOException $e) {
    error_log('Database error: '.$e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Terjadi kesalahan server. Silakan coba lagi nanti.',
    ]);
} catch (Exception $e) {
    error_log('General error: '.$e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Terjadi kesalahan. Silakan hubungi administrator.',
    ]);
}

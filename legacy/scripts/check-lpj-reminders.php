<?php

/**
 * Script untuk cron job check LPJ reminders
 * Simpan di: scripts/check-lpj-reminders.php
 *
 * Jalankan setiap hari jam 8 pagi:
 * Cron syntax: 0 8 * * * /usr/bin/php /path/to/project/scripts/check-lpj-reminders.php
 *
 * Untuk development (tanpa cron):
 * Bisa panggil manual via API: POST /api/lpj/check-reminders
 * Atau jalankan: php scripts/check-lpj-reminders.php
 */

// Load autoloader and bootstrap
require_once __DIR__.'/../vendor/autoload.php';

// Define ROOT constant
if (! defined('ROOT')) {
    define('ROOT', dirname(__DIR__));
}

// Load environment variables
try {
    $dotenv = Dotenv\Dotenv::createImmutable(ROOT);
    $dotenv->load();
} catch (InvalidPathException $e) {
    exit('Could not find .env file. Please create one from .env.example.');
}

// Load database configuration
require_once ROOT.'/config/database.php';

require_once __DIR__.'/../app/helpers.php';

use App\Services\LpjTimerService;
use Dotenv\Exception\InvalidPathException;

// Set timezone
date_default_timezone_set('Asia/Jakarta');

// Log start
$logDir = __DIR__.'/../storage/logs';
if (! is_dir($logDir)) {
    mkdir($logDir, 0755, true);
}
$logFile = $logDir.'/lpj-cron-'.date('Y-m-d').'.log';
$startTime = date('Y-m-d H:i:s');

function logMessage($message, $logFile)
{
    $timestamp = date('Y-m-d H:i:s');
    file_put_contents($logFile, "[{$timestamp}] {$message}\n", FILE_APPEND);
}

logMessage('=== LPJ Reminder Check Started ===', $logFile);

try {
    // Initialize service
    $lpjService = new LpjTimerService;

    // Check and send reminders
    $emailResults = $lpjService->checkAndSendReminders();

    // Log results
    logMessage('Email Sending Results:', $logFile);
    logMessage('  - H-7 reminders sent: '.$emailResults['h7_sent'], $logFile);
    logMessage('  - H-3 reminders sent: '.$emailResults['h3_sent'], $logFile);
    logMessage('  - H-1 reminders sent: '.$emailResults['h1_sent'], $logFile);
    logMessage('  - Overdue notifications sent: '.$emailResults['overdue_sent'], $logFile);
    logMessage('  Total emails sent: '.count($emailResults['sent']), $logFile);

    foreach ($emailResults['sent'] as $sentEmail) {
        logMessage("    SENT: '{$sentEmail['subject']}' to {$sentEmail['to']}", $logFile);
    }
    logMessage('  Total failed: '.count($emailResults['failed']), $logFile);
    foreach ($emailResults['failed'] as $failedEmail) {
        logMessage("    FAILED: '{$failedEmail['subject']}' to {$failedEmail['to']} - Error: {$failedEmail['error']}", $logFile);
    }

    logMessage('Status: SUCCESS', $logFile);

    // Exit dengan status success
    exit(0);

} catch (Exception $e) {
    // Log error
    logMessage('ERROR: '.$e->getMessage(), $logFile);
    logMessage('Stack trace: '.$e->getTraceAsString(), $logFile);
    logMessage('Status: FAILED', $logFile);

    // Exit dengan status error
    exit(1);
} finally {
    $endTime = date('Y-m-d H:i:s');
    logMessage("=== LPJ Reminder Check Ended ===\n", $logFile);
}

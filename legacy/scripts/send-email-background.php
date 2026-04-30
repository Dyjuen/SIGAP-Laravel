<?php

// Load autoloader and helpers
require_once __DIR__.'/../vendor/autoload.php';
require_once __DIR__.'/../app/helpers.php'; // Assuming helpers are needed

use App\Services\MailService;

// Set timezone (important for logs)
date_default_timezone_set('Asia/Jakarta');

$logFile = __DIR__.'/../storage/logs/email_background-'.date('Y-m-d').'.log';

function logBackgroundMessage($message, $logFile)
{
    $timestamp = date('Y-m-d H:i:s');
    file_put_contents($logFile, "[{$timestamp}] {$message}\n", FILE_APPEND);
}

logBackgroundMessage('--- Background Email Sender Started ---', $logFile);

try {
    // Expecting parameters as a single JSON argument
    if (! isset($argv[1])) {
        logBackgroundMessage('Error: No JSON arguments provided.', $logFile);
        exit(1);
    }

    $paramsJson = $argv[1];
    $params = json_decode($paramsJson, true);

    if (json_last_error() !== JSON_ERROR_NONE) {
        logBackgroundMessage('Error: Invalid JSON argument. '.json_last_error_msg(), $logFile);
        exit(1);
    }

    logBackgroundMessage('Received parameters: '.json_encode($params), $logFile);

    $mailService = new MailService;

    // Determine which email to send based on a 'type' parameter
    $emailType = $params['type'] ?? 'default';

    switch ($emailType) {
        case 'kak_approved_verifikator':
            $result = $mailService->sendKakApprovedVerifikatorEmail(
                $params['recipientEmail'],
                $params['recipientName'],
                $params['kakName'],
                $params['kakId']
            );
            break;
            // Add other email types here as needed
        default:
            logBackgroundMessage("Error: Unknown email type '{$emailType}'", $logFile);
            exit(1);
    }

    if ($result === true) {
        logBackgroundMessage("Email '{$emailType}' successfully sent to {$params['recipientEmail']}", $logFile);
    } else {
        logBackgroundMessage("Email '{$emailType}' failed to send to {$params['recipientEmail']}: {$result}", $logFile);
        exit(1);
    }

} catch (Exception $e) {
    logBackgroundMessage('FATAL ERROR: '.$e->getMessage(), $logFile);
    logBackgroundMessage('Stack trace: '.$e->getTraceAsString(), $logFile);
    exit(1);
}

logBackgroundMessage('--- Background Email Sender Finished ---', $logFile);
exit(0);

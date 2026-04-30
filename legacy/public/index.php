<?php

if (file_exists(__DIR__.'/../.env')) {
    $lines = file(__DIR__.'/../.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) {
            continue;
        }
        [$key, $value] = explode('=', $line, 2);
        $_ENV[trim($key)] = trim($value);
        putenv(trim($key).'='.trim($value));
    }
}
/**
 * Application Entry Point
 *
 * Handles all incoming HTTP requests and routes them to appropriate controllers
 */

// Start session if not already started
if (! session_id()) {
    session_start();
}

// Define root directory constant
define('ROOT', dirname(__DIR__));

// Load Composer autoloader
require_once ROOT.'/vendor/autoload.php';

// Load environment variables
$dotenv = Dotenv\Dotenv::createImmutable(ROOT);
$dotenv->load();

use App\Core\Router;

// Load database configuration
require_once ROOT.'/config/database.php';

// Load helper functions
require_once ROOT.'/app/helpers.php';

// Enable error reporting for development (disable in production)
if (getenv('APP_ENV') === 'development' || ! getenv('APP_ENV')) {
    error_reporting(E_ALL);
    ini_set('display_errors', '1');
} else {
    error_reporting(0);
    ini_set('display_errors', '0');
}

// Set timezone
date_default_timezone_set('Asia/Jakarta');

// Set JSON response headers
header('Content-Type: application/json; charset=utf-8');

// Enable CORS for development (configure properly in production)
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Max-Age: 86400'); // 24 hours

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Global error handler
set_exception_handler(function ($exception) {
    // Log error (you can customize this to log to file)
    error_log($exception->getMessage());
    error_log($exception->getTraceAsString());

    // Return JSON error response
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => $_ENV['APP_ENV'] === 'development'
            ? $exception->getMessage()
            : 'Terjadi kesalahan pada server',
        'code' => 500,
        'trace' => $_ENV['APP_ENV'] === 'development'
            ? $exception->getTraceAsString()
            : null,
    ]);
    exit;
});

// Global error handler for PHP errors
set_error_handler(function ($errno, $errstr, $errfile, $errline) {
    // Convert error to exception
    throw new ErrorException($errstr, 0, $errno, $errfile, $errline);
});

// Create router instance
$router = new Router;

// Load API routes
require_once ROOT.'/routes/api.php';

// Dispatch request
$router->dispatch();

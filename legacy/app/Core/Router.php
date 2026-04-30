<?php

namespace App\Core;

class Router
{
    private $routes = [];

    private $fallbackHandler = null;

    public function get($path, $handler, $middlewares = [])
    {
        $this->addRoute('GET', $path, $handler, $middlewares);
    }

    public function post($path, $handler, $middlewares = [])
    {
        $this->addRoute('POST', $path, $handler, $middlewares);
    }

    public function put($path, $handler, $middlewares = [])
    {
        $this->addRoute('PUT', $path, $handler, $middlewares);
    }

    public function delete($path, $handler, $middlewares = [])
    {
        $this->addRoute('DELETE', $path, $handler, $middlewares);
    }

    private function addRoute($method, $path, $handler, $middlewares)
    {

        $this->routes[] = [
            'method' => $method,
            'path' => $path,
            'handler' => $handler,
            'middlewares' => $middlewares,
        ];
    }

    public function fallback($handler)
    {
        $this->fallbackHandler = $handler;
    }

    public function dispatch()
    {
        $requestMethod = $_SERVER['REQUEST_METHOD'];
        $requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

        // ✅ Debug log untuk troubleshooting
        error_log('=== ROUTER DISPATCH ===');
        error_log('RAW URI: '.$requestUri);

        if (empty($requestUri) || $requestUri[0] !== '/') {
            $requestUri = '/'.$requestUri;
        }

        // ✅ Normalisasi trailing slash
        if ($requestUri !== '/' && substr($requestUri, -1) === '/') {
            $requestUri = rtrim($requestUri, '/');
        }

        // ✅ Hapus prefix /api karena routes didefinisikan tanpa prefix
        $requestUri = preg_replace('#^/api#', '', $requestUri);

        error_log('Method: '.$requestMethod);
        error_log('Normalized URI: '.$requestUri);
        error_log('Total routes: '.count($this->routes));

        foreach ($this->routes as $route) {
            if ($route['method'] !== $requestMethod) {
                continue;
            }

            $pattern = $this->convertToRegex($route['path']);

            error_log("Testing route: {$route['path']} | Pattern: {$pattern}");

            if (preg_match($pattern, $requestUri, $matches)) {
                error_log("✅ MATCHED! Handler: {$route['handler']}");
                array_shift($matches);

                foreach ($route['middlewares'] as $middleware) {
                    $middleware->handle();
                }

                $this->executeHandler($route['handler'], $matches);

                return;
            }
        }

        error_log('❌ No route matched');

        if ($this->fallbackHandler) {
            call_user_func($this->fallbackHandler);
        } else {
            http_response_code(404);
            header('Content-Type: application/json');
            echo json_encode([
                'status' => 'error',
                'message' => 'Endpoint tidak ditemukan',
                'code' => 404,
                'hint' => 'Gunakan GET /api/health untuk melihat daftar endpoint yang tersedia',
                'debug' => [
                    'requested_uri' => $requestUri,
                    'method' => $requestMethod,
                    'available_routes' => array_map(function ($r) {
                        return $r['method'].' '.$r['path'];
                    }, $this->routes),
                ],
            ]);
        }
        exit;
    }

    private function convertToRegex($path)
    {
        // Ubah {id} menjadi (?P<id>[\w-]+)
        $pattern = preg_replace('/\{([\w]+)\}/', '(?P<$1>[\w-]+)', $path);

        // Escape slash
        $pattern = str_replace('/', '\/', $pattern);

        return '/^'.$pattern.'$/';
    }

    private function executeHandler($handler, $params = [])
    {
        try {
            if (is_callable($handler)) {
                call_user_func_array($handler, $params);
            } elseif (is_string($handler)) {
                [$controller, $method] = explode('@', $handler);

                // Cek apakah controller sudah punya namespace lengkap
                if (strpos($controller, '\\') !== false) {
                    // Sudah ada namespace (e.g., "Api\TelaahController")
                    $controllerClass = 'App\\Controllers\\'.$controller;
                } else {
                    // Belum ada namespace (backward compatibility)
                    $controllerClass = 'App\\Controllers\\'.$controller;
                }

                error_log("Attempting to load: {$controllerClass}");
                error_log("Method: {$method}");

                // ✅ Try to manually require file if autoload fails
                if (! class_exists($controllerClass)) {
                    // Extract path from namespace
                    // App\Controllers\Api\TelaahController -> app/Controllers/Api/TelaahController.php
                    $filePath = __DIR__.'/../../'.str_replace('\\', '/', $controllerClass).'.php';

                    error_log("Trying to require: {$filePath}");

                    if (file_exists($filePath)) {
                        require_once $filePath;
                        error_log('✅ File required successfully');
                    } else {
                        throw new \Exception("Controller file not found: {$filePath}");
                    }
                }

                if (! class_exists($controllerClass)) {
                    throw new \Exception("Controller class {$controllerClass} not found after require");
                }

                $controllerInstance = new $controllerClass;

                if (! method_exists($controllerInstance, $method)) {
                    throw new \Exception("Method {$method} not found in {$controllerClass}");
                }

                $params = array_values($params);
                call_user_func_array([$controllerInstance, $method], $params);
            } else {
                throw new \Exception('Invalid route handler');
            }
        } catch (\Exception $e) {
            error_log('Router execution error: '.$e->getMessage());
            error_log('Stack trace: '.$e->getTraceAsString());
            http_response_code(500);
            header('Content-Type: application/json');
            echo json_encode([
                'status' => 'error',
                'message' => 'Internal server error',
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            exit;
        }
    }
}

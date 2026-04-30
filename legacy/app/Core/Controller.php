<?php

namespace App\Core;

use App\Middlewares\AuthMiddleware;

class Controller
{
    protected $db;

    protected $user;

    /**
     * Base controller constructor.
     * Initializes database connection and authenticated user data.
     */
    public function __construct()
    {
        $this->db = Database::getInstance();
        $this->user = AuthMiddleware::getAuthUser();
    }

    /**
     * Get JSON input from the request body.
     *
     * @return array|null
     */
    protected function getInput()
    {
        $input = file_get_contents('php://input');

        return json_decode($input, true);
    }

    /**
     * Memuat file view dan mengirimkan data ke dalamnya (Untuk Rute WEB).
     */
    public function view($view, $data = [])
    {
        extract($data);
        $contentView = ROOT.'/app/Views/'.$view.'.php';
        if (file_exists($contentView)) {
            require_once ROOT.'/app/Views/layouts/app.php';
        } else {
            exit('View tidak ditemukan di: '.$contentView);
        }
    }

    /**
     * Memuat file model.
     */
    public function model($model)
    {
        $modelClass = 'App\\Models\\'.$model;

        if (! class_exists($modelClass)) {
            $modelPath = ROOT.'/app/Models/'.$model.'.php';
            if (file_exists($modelPath)) {
                require_once $modelPath;
            }
        }

        if (! class_exists($modelClass)) {
            throw new \Exception("Model {$modelClass} not found");
        }

        return new $modelClass;
    }

    // --- FUNGSI BARU UNTUK API ---

    /**
     * Mengirim respons JSON standar.
     *
     * @param  int  $statusCode  Kode status HTTP (misal: 200, 404, 401)
     * @param  array  $data  Data yang akan di-encode ke JSON
     */
    public function jsonResponse($statusCode, $data)
    {
        http_response_code($statusCode);
        echo json_encode($data);
        exit; // Hentikan eksekusi setelah mengirim respons
    }

    /**
     * Helper untuk respons JSON sukses (HTTP 200).
     *
     * @param  string  $message  Pesan sukses
     * @param  mixed  $data  Data opsional yang dikirim
     */
    public function jsonSuccess($message, $data = [])
    {
        $response = ['status' => 'success', 'message' => $message];
        if (! empty($data)) {
            $response['data'] = $data;
        }
        $this->jsonResponse(200, $response);
    }

    /**
     * Helper untuk respons JSON error (HTTP 4xx/5xx).
     *
     * @param  int  $statusCode  Kode status HTTP (misal: 400, 401, 404, 500)
     * @param  string  $message  Pesan error
     * @param  array  $errors  Detail error opsional
     */
    public function jsonError($statusCode, $message, $errors = [])
    {
        $response = ['status' => 'error', 'message' => $message];
        if (! empty($errors)) {
            $response['errors'] = $errors;
        }
        $this->jsonResponse($statusCode, $response);
    }
}

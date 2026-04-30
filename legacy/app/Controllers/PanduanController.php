<?php

namespace App\Controllers;

use App\Core\Controller;
use App\Core\FileUpload;
use App\Core\Response;
use App\Middlewares\AuthMiddleware;
use App\Middlewares\RoleMiddleware;
use App\Models\Panduan;
use App\Validators\PanduanValidator;

class PanduanController extends Controller
{
    private $panduanModel;

    private $userData;

    public function __construct()
    {
        $this->panduanModel = new Panduan;
        $this->userData = AuthMiddleware::getAuthUser();
    }

    public function index()
    {
        try {
            $role_id = $this->userData['role_id'] ?? null;
            $userRoles = $this->userData['roles'] ?? [];

            if (in_array('Admin', $userRoles)) {
                $panduan = $this->panduanModel->findAll();
            } else {
                $panduan = $this->panduanModel->findByRole($role_id);
            }

            // Auto-detect tipe_media if NULL
            $panduan = array_map(function ($item) {
                if (empty($item['tipe_media']) || is_null($item['tipe_media'])) {
                    // Detect based on path_media
                    if (! empty($item['path_media'])) {
                        if (filter_var($item['path_media'], FILTER_VALIDATE_URL) ||
                            strpos($item['path_media'], 'youtube.com') !== false ||
                            strpos($item['path_media'], 'youtu.be') !== false) {
                            $item['tipe_media'] = 'video';
                        } else {
                            $item['tipe_media'] = 'document';
                        }
                    } else {
                        $item['tipe_media'] = 'document'; // Default
                    }
                }

                return $item;
            }, $panduan);

            Response::success($panduan, 'Data panduan berhasil diambil.');
        } catch (\Exception $e) {
            Response::error('Gagal mengambil data panduan: '.$e->getMessage(), 500);
        }
    }

    public function show($id)
    {
        try {
            $panduan = $this->panduanModel->find($id);

            if (! $panduan) {
                Response::notFound('Panduan tidak ditemukan.');

                return;
            }

            // Auto-detect tipe_media if NULL
            if (empty($panduan['tipe_media']) || is_null($panduan['tipe_media'])) {
                if (! empty($panduan['path_media'])) {
                    if (filter_var($panduan['path_media'], FILTER_VALIDATE_URL) ||
                        strpos($panduan['path_media'], 'youtube.com') !== false ||
                        strpos($panduan['path_media'], 'youtu.be') !== false) {
                        $panduan['tipe_media'] = 'video';
                    } else {
                        $panduan['tipe_media'] = 'document';
                    }
                } else {
                    $panduan['tipe_media'] = 'document';
                }
            }

            $role_id = $this->userData['role_id'] ?? null;
            $userRoles = $this->userData['roles'] ?? [];

            if (in_array('Admin', $userRoles)) {
                Response::success($panduan, 'Detail panduan berhasil diambil.');

                return;
            }

            if ($panduan['target_role_id'] == $role_id) {
                Response::success($panduan, 'Detail panduan berhasil diambil.');
            } else {
                Response::notFound('Panduan tidak ditemukan atau Anda tidak memiliki akses.');
            }

        } catch (\Exception $e) {
            Response::error('Gagal mengambil data panduan: '.$e->getMessage(), 500);
        }
    }

    public function store()
    {
        (new RoleMiddleware(['Admin']))->handle();

        $data = $_POST;

        $validator = new PanduanValidator;
        if (! $validator->validatePanduan($data)) {
            Response::validationError($validator->getErrors(), 'Validasi gagal.');

            return;
        }

        try {
            $tipeMedia = $data['tipe_media'] ?? 'document';

            $createData = [
                'judul_panduan' => $data['judul_panduan'],
                'target_role_id' => $data['target_role_id'] ?? null,
                'tipe_media' => $tipeMedia,
            ];

            if ($tipeMedia === 'video') {
                // For video, store the URL directly
                $createData['path_media'] = $data['path_media'] ?? null;
            } else {
                // For document, handle file upload
                if (! empty($_FILES)) {
                    $theFile = reset($_FILES); // Get the first uploaded file regardless of its name
                    if (isset($theFile['error']) && $theFile['error'] === UPLOAD_ERR_OK) {
                        $allowed_types = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'];
                        $uploader = new FileUpload('/storage/uploads/documents/panduan/', $allowed_types);
                        $uploadResult = $uploader->upload($theFile);

                        if ($uploadResult['success']) {
                            $createData['path_media'] = $uploadResult['file_path'];
                        } else {
                            Response::error('Gagal mengupload file: '.$uploadResult['message'], 400);

                            return;
                        }
                    }
                } else {
                    $createData['path_media'] = $data['path_media'] ?? null;
                }
            }

            $panduanId = $this->panduanModel->create($createData);
            $newPanduan = $this->panduanModel->find($panduanId);

            Response::created($newPanduan, 'Panduan berhasil dibuat.');
        } catch (\Exception $e) {
            Response::error('Gagal menyimpan panduan: '.$e->getMessage(), 500);
        }
    }

    public function update($id)
    {
        (new RoleMiddleware(['Admin']))->handle();

        $data = $_POST;

        $validator = new PanduanValidator;
        if (! $validator->validatePanduan($data, true)) { // true = isUpdate
            Response::validationError($validator->getErrors(), 'Validasi gagal.');

            return;
        }

        try {
            $panduan = $this->panduanModel->find($id);
            if (! $panduan) {
                Response::notFound('Panduan tidak ditemukan.');

                return;
            }

            $tipeMedia = $data['tipe_media'] ?? $panduan['tipe_media'] ?? 'document';

            $updateData = [
                'judul_panduan' => $data['judul_panduan'],
                'target_role_id' => $data['target_role_id'] ?? null,
                'tipe_media' => $tipeMedia,
            ];

            if ($tipeMedia === 'video') {
                // For video, store the URL directly
                $updateData['path_media'] = $data['path_media'] ?? $panduan['path_media'];
            } else {
                // For document, handle file upload
                if (! empty($_FILES)) {
                    $theFile = reset($_FILES); // Get the first uploaded file regardless of its name
                    if (isset($theFile['error']) && $theFile['error'] === UPLOAD_ERR_OK) {
                        // Delete old file if it exists
                        if (! empty($panduan['path_media']) && file_exists($panduan['path_media'])) {
                            $deleter = new FileUpload;
                            $deleter->delete($panduan['path_media']);
                        }

                        $allowed_types = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'];
                        $uploader = new FileUpload('/storage/uploads/documents/panduan/', $allowed_types);
                        $uploadResult = $uploader->upload($theFile);

                        if ($uploadResult['success']) {
                            $updateData['path_media'] = $uploadResult['file_path'];
                        } else {
                            Response::error('Gagal mengupload file: '.$uploadResult['message'], 400);

                            return;
                        }
                    } else {
                        // Keep old file if no new file uploaded
                        $updateData['path_media'] = $panduan['path_media'];
                    }
                } else {
                    // Keep old file if no file field sent
                    $updateData['path_media'] = $panduan['path_media'];
                }
            }

            $this->panduanModel->update($id, $updateData);
            $updatedPanduan = $this->panduanModel->find($id);

            Response::success($updatedPanduan, 'Panduan berhasil diperbarui.');
        } catch (\Exception $e) {
            Response::error('Gagal memperbarui panduan: '.$e->getMessage(), 500);
        }
    }

    public function destroy($id)
    {
        (new RoleMiddleware(['Admin']))->handle();

        try {
            $panduan = $this->panduanModel->find($id);
            if (! $panduan) {
                Response::notFound('Panduan tidak ditemukan.');

                return;
            }

            if (! empty($panduan['path_media'])) {
                $deleter = new FileUpload;
                $deleter->delete($panduan['path_media']);
            }

            $this->panduanModel->delete($id);

            Response::success(null, 'Panduan berhasil dihapus.');
        } catch (\Exception $e) {
            Response::error('Gagal menghapus panduan: '.$e->getMessage(), 500);
        }
    }

    public function download($id)
    {
        try {
            $panduan = $this->panduanModel->find($id);
            if (! $panduan) {
                Response::notFound('Panduan tidak ditemukan.');

                return;
            }

            // Check role access
            $role_id = $this->userData['role_id'] ?? null;
            $userRoles = $this->userData['roles'] ?? [];

            if (! in_array('Admin', $userRoles) && $panduan['target_role_id'] != $role_id) {
                Response::error('Anda tidak memiliki akses ke panduan ini.', 403);

                return;
            }

            // For video, return the URL
            if ($panduan['tipe_media'] === 'video') {
                Response::success(['url' => $panduan['path_media']], 'URL video berhasil diambil.');

                return;
            }

            // For documents, serve the file
            $filePath = $panduan['path_media'];

            // If path doesn't start with absolute path, prepend project root
            if (! file_exists($filePath)) {
                // Try prepending the project root directory
                $projectRoot = dirname(__DIR__, 2); // Go up 2 levels from Controllers folder
                $filePath = $projectRoot.$filePath;
            }

            if (! file_exists($filePath)) {
                error_log('File not found: '.$filePath.' (original: '.$panduan['path_media'].')');
                Response::error('File tidak ditemukan di server: '.basename($panduan['path_media']), 404);

                return;
            }

            $fileName = basename($filePath);
            $mimeType = mime_content_type($filePath);

            header('Content-Type: '.$mimeType);
            header('Content-Disposition: inline; filename="'.$fileName.'"');
            header('Content-Length: '.filesize($filePath));
            header('Cache-Control: public, max-age=3600');

            readfile($filePath);
            exit;

        } catch (\Exception $e) {
            Response::error('Gagal mengambil file: '.$e->getMessage(), 500);
        }
    }
}

<?php

namespace App\Controllers;

use App\Core\Response;
use App\Middlewares\AuthMiddleware;
use App\Models\Notifikasi;

class NotificationController
{
    private $notifikasiModel;

    private $userData;

    public function __construct()
    {
        $this->notifikasiModel = new Notifikasi;
        $this->userData = AuthMiddleware::getAuthUser();
    }

    /**
     * Get all notifications for the authenticated user
     *
     * GET /api/notifications
     */
    public function getNotificationsForUser()
    {
        try {
            $userId = $this->userData['user_id'];
            $notifications = $this->notifikasiModel->getByUser($userId);

            Response::success($notifications, 'Notifikasi berhasil diambil.');

        } catch (\Exception $e) {
            Response::error('Gagal mengambil notifikasi: '.$e->getMessage(), 500);
        }
    }

    /**
     * Mark a notification as read
     *
     * POST /api/notifications/{id}/read
     */
    public function markAsRead()
    {
        try {
            // Get notification_id from URL
            $uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
            preg_match('/\/notifications\/(\d+)\/read$/', $uri, $matches);
            $notificationId = $matches[1] ?? null;

            if (! $notificationId) {
                Response::error('ID Notifikasi tidak valid.', 400);
            }

            $notification = $this->notifikasiModel->findById($notificationId);

            if (! $notification) {
                Response::notFound('Notifikasi tidak ditemukan.');
            }

            // Authorization: User can only mark their own notifications as read
            if ($notification['penerima_user_id'] != $this->userData['user_id']) {
                Response::forbidden('Anda tidak memiliki akses ke notifikasi ini.');
            }

            $this->notifikasiModel->markAsRead($notificationId);

            Response::success(null, 'Notifikasi ditandai sebagai sudah dibaca.');

        } catch (\Exception $e) {
            Response::error('Gagal menandai notifikasi: '.$e->getMessage(), 500);
        }
    }
}

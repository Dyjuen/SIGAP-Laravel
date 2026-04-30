<?php

namespace App\Services;

use App\Core\Database;
use App\Models\Notifikasi; // Assuming User model is needed for some context
use App\Models\User;

class FlasherNotificationService
{
    private $notifikasiModel;

    private $kegiatanTimerService;

    private $userModel;

    private $db;

    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
        $this->notifikasiModel = new Notifikasi;
        $this->kegiatanTimerService = new KegiatanTimerService;
        $this->userModel = new User;
    }

    /**
     * Generates and retrieves flasher notifications for the logged-in user upon dashboard load.
     * This method will:
     * 1. Check for a "Welcome" flasher message from a recent login (once per login).
     * 2. Get all overdue approvals.
     * 3. For each overdue approval, attempt to create a flasher notification for the relevant user
     *    (if not already created recently).
     * 4. Fetch all unread flasher notifications for the current user.
     * 5. Mark these fetched notifications as read.
     * 6. Return the messages of these notifications.
     *
     * @param  int  $userId  The ID of the currently logged-in user.
     * @return array An array of notification messages to be displayed as flashers.
     */
    public function getLoginFlasherNotifications(int $userId): array
    {
        // Ensure session is started for $_SESSION usage
        if (session_status() == PHP_SESSION_NONE) {
            session_start();
        }
        error_log("FlasherNotificationService: getLoginFlasherNotifications called for userId: {$userId}");

        $flasherMessages = [];
        $userRoles = $this->kegiatanTimerService->getUserRoles($userId); // Get user's roles
        error_log('FlasherNotificationService: User roles: '.implode(', ', $userRoles));

        // 1. Check for one-time "Welcome" flasher message from login
        if (isset($_SESSION['login_welcome_message'])) {
            $flasherMessages[] = $_SESSION['login_welcome_message'];
            unset($_SESSION['login_welcome_message']); // Ensure it's shown only once
            error_log('FlasherNotificationService: Welcome message added from session flash.');
        } else {
            error_log('FlasherNotificationService: No login welcome message in session.');
        }

        // Only generate overdue flasher notifications for PPK or Wadir roles
        if (in_array('PPK', $userRoles) || in_array('Wadir', $userRoles)) {
            error_log('FlasherNotificationService: User has PPK or Wadir role, checking for overdue approvals.');
            // 2. Get all overdue approvals from the database
            $overdueApprovals = $this->kegiatanTimerService->getOverdueApprovals();
            error_log('FlasherNotificationService: Found '.count($overdueApprovals).' overdue approvals.');

            // 3. For each overdue approval, attempt to create a flasher notification for this user
            foreach ($overdueApprovals as $approval) {
                // Check if the current user has the role required to approve this overdue item
                $requiredApprovalLevel = ($approval['approval_level'] === 'Wadir2') ? 'Wadir' : $approval['approval_level'];
                if (in_array($requiredApprovalLevel, $userRoles)) {
                    error_log("FlasherNotificationService: Processing overdue approval for kegiatan_id {$approval['kegiatan_id']}.");
                    $created = $this->kegiatanTimerService->createOverdueFlasherNotification($userId, $approval, null);
                    if ($created) {
                        error_log("FlasherNotificationService: Created new overdue flasher notification for kegiatan_id {$approval['kegiatan_id']}.");
                    } else {
                        error_log("FlasherNotificationService: Overdue flasher notification for kegiatan_id {$approval['kegiatan_id']} not created (duplicate or error).");
                    }
                } else {
                    error_log("FlasherNotificationService: User role ({$userRoles[0]}) does not match required approval level ({$requiredApprovalLevel}) for kegiatan_id {$approval['kegiatan_id']}."); // Adjusted logging
                }
            }
        } else {
            error_log('FlasherNotificationService: User does not have PPK or Wadir role, skipping overdue approval check.');
        }

        // 4. Fetch all UNREAD flasher notifications for the current user
        // Flasher notifications are identified by link_tujuan IS NULL
        $unreadFlasherNotifications = $this->notifikasiModel->getByUser($userId, true, true); // true for unreadOnly, true for flasherOnly
        error_log('FlasherNotificationService: Found '.count($unreadFlasherNotifications).' unread flasher notifications in DB.');

        foreach ($unreadFlasherNotifications as $notification) {
            $flasherMessages[] = $notification['pesan'];
            // 5. Mark these fetched notifications as read (so they don't reappear as flashers)
            $this->notifikasiModel->markAsRead($notification['notifikasi_id']);
            error_log("FlasherNotificationService: Added message to list and marked as read: {$notification['pesan']}");
        }

        error_log('FlasherNotificationService: Final flasherMessages count: '.count($flasherMessages));

        return $flasherMessages;
    }
}

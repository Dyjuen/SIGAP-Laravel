<?php

namespace App\Services;

use App\Core\Database;
use App\Models\Notifikasi;
use App\Models\Role;
use App\Models\User;

class KegiatanTimerService
{
    private $db;

    private $notifikasiModel;

    private $userModel;

    private $roleModel;

    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
        $this->notifikasiModel = new Notifikasi;
        $this->userModel = new User;
        $this->roleModel = new Role;
    }

    /**
     * Retrieves all kegiatan approvals that are active and overdue for PPK or Wadir2.
     * Does NOT create notifications.
     *
     * @return array An array of overdue approval records.
     */
    public function getOverdueApprovals(): array
    {
        $sql = "SELECT 
                    ka.kegiatan_id, 
                    ka.approval_level,
                    tk.nama_kegiatan,
                    tk.pengusul_user_id,
                    DATEDIFF(NOW(), ka.updated_at) as days_pending
                FROM t_kegiatan_approval ka
                JOIN t_kegiatan k ON ka.kegiatan_id = k.kegiatan_id
                JOIN t_kak tk ON k.kak_id = tk.kak_id
                WHERE ka.status = 'Aktif'
                  AND ka.approval_level IN ('PPK', 'Wadir2')
                  AND ka.updated_at < DATE_SUB(NOW(), INTERVAL 3 DAY)";

        $stmt = $this->db->prepare($sql);
        $stmt->execute();

        return $stmt->fetchAll();
    }

    /**
     * Creates an overdue flasher notification for a specific user and overdue approval.
     * This method handles the duplicate check.
     *
     * @param  int  $userId  The ID of the recipient user.
     * @param  array  $approval  The overdue approval record from getOverdueApprovals().
     * @param  string|null  $linkTujuan  Optional link for the notification. Null for flasher.
     * @return bool True if notification was created, false otherwise (e.g., duplicate).
     */
    public function createOverdueFlasherNotification(int $userId, array $approval, ?string $linkTujuan = null): bool
    {
        $pesan = "Kegiatan \"{$approval['nama_kegiatan']}\" menunggu persetujuan {$approval['approval_level']} Anda lebih dari {$approval['days_pending']} hari.";

        // Use a unique pattern for flasher notifications for duplicate checking without link_tujuan
        $messagePatternForDuplicateCheck = md5($pesan.$approval['kegiatan_id'].$approval['approval_level']);

        if ($this->hasFlasherNotificationRecently($userId, $messagePatternForDuplicateCheck)) {
            return false; // Notification already sent recently
        }

        try {
            $this->notifikasiModel->create([
                'penerima_user_id' => $userId,
                'pesan' => $pesan,
                'link_tujuan' => $linkTujuan, // Should be null for flasher
                'is_read' => false,
            ]);

            return true;
        } catch (\Exception $e) {
            error_log("Failed to create overdue flasher notification for user {$userId} and kegiatan_id {$approval['kegiatan_id']}: ".$e->getMessage());

            return false;
        }
    }

    /**
     * Checks if a specific flasher notification for a user has been sent recently (e.g., within 24 hours).
     * This checks against the database 't_notifikasi' table itself, specifically for notifications
     * with NULL link_tujuan (which indicates a flasher type).
     *
     * @param  int  $userId  The recipient user ID.
     * @param  string  $messagePatternHash  A unique hash generated from the notification message and relevant IDs.
     * @return bool True if a similar notification was sent recently.
     */
    private function hasFlasherNotificationRecently(int $userId, string $messagePatternHash): bool
    {
        // This query checks for any notification for the user, with NULL link_tujuan,
        // and a message containing the specific hash, created within the last 24 hours.
        $sql = 'SELECT COUNT(*) as count 
                FROM t_notifikasi 
                WHERE penerima_user_id = :user_id
                  AND link_tujuan IS NULL
                  AND pesan LIKE :message_pattern_hash_like
                  AND created_at >= DATE_SUB(NOW(), INTERVAL 1 DAY)';

        // We use LIKE here with the hash in case the full message varies slightly,
        // but the core identifying hash remains.
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':user_id' => $userId,
            ':message_pattern_hash_like' => "%{$messagePatternHash}%",
        ]);
        $result = $stmt->fetch();

        return $result && $result['count'] > 0;
    }

    /**
     * Helper to get roles for a user.
     * This method is added here as it's useful for determining
     * which approver roles a user has when checking for flasher notifications.
     *
     * @return array An array of role names the user has.
     */
    public function getUserRoles(int $userId): array
    {
        $roles = [];
        $sql = 'SELECT r.nama_role FROM m_roles r JOIN m_users u ON r.role_id = u.role_id WHERE u.user_id = :user_id';
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':user_id' => $userId]);
        foreach ($stmt->fetchAll() as $row) {
            $roles[] = $row['nama_role'];
        }

        return $roles;
    }
}

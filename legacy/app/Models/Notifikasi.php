<?php

namespace App\Models;

use App\Core\Model;

class Notifikasi extends Model
{
    protected $table = 't_notifikasi';

    protected $primaryKey = 'notifikasi_id';

    /**
     * Create notifikasi baru
     */
    public function create(array $data): bool
    {
        $sql = "INSERT INTO {$this->table} 
                (penerima_user_id, pesan, link_tujuan, is_read, created_at) 
                VALUES 
                (:penerima_user_id, :pesan, :link_tujuan, :is_read, NOW())";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'penerima_user_id' => $data['penerima_user_id'],
            'pesan' => $data['pesan'],
            'link_tujuan' => $data['link_tujuan'] ?? null,
            'is_read' => (int) ($data['is_read'] ?? false),
        ]);

        return $stmt->rowCount() > 0;
    }

    /**
     * Get notifikasi untuk user tertentu
     *
     * @param  int  $userId  The ID of the recipient user.
     * @param  bool  $unreadOnly  If true, only unread notifications are returned.
     * @param  bool  $flasherOnly  If true, only notifications with link_tujuan IS NULL are returned (flasher type).
     * @return array An array of notification records.
     */
    public function getByUser(int $userId, bool $unreadOnly = false, bool $flasherOnly = false): array
    {
        $sql = "SELECT * FROM {$this->table} 
                WHERE penerima_user_id = :user_id";

        if ($unreadOnly) {
            $sql .= ' AND is_read = 0';
        }

        if ($flasherOnly) {
            $sql .= ' AND link_tujuan IS NULL';
        }

        $sql .= ' ORDER BY created_at DESC LIMIT 50';

        $stmt = $this->db->prepare($sql);
        $stmt->execute(['user_id' => $userId]);

        return $stmt->fetchAll();
    }

    /**
     * Mark notifikasi sebagai dibaca
     */
    public function markAsRead(int $notifikasiId): bool
    {
        $sql = "UPDATE {$this->table} 
                SET is_read = 1 
                WHERE notifikasi_id = :id";

        $stmt = $this->db->prepare($sql);
        $stmt->execute(['id' => $notifikasiId]);

        return $stmt->rowCount() > 0;
    }

    /**
     * Mark semua notifikasi user sebagai dibaca
     */
    public function markAllAsRead(int $userId): bool
    {
        $sql = "UPDATE {$this->table} 
                SET is_read = 1 
                WHERE penerima_user_id = :user_id AND is_read = 0";

        $stmt = $this->db->prepare($sql);
        $stmt->execute(['user_id' => $userId]);

        return $stmt->rowCount() > 0;
    }

    /**
     * Get jumlah notifikasi belum dibaca
     */
    public function getUnreadCount(int $userId): int
    {
        $sql = "SELECT COUNT(*) as total FROM {$this->table} 
                WHERE penerima_user_id = :user_id AND is_read = 0";

        $stmt = $this->db->prepare($sql);
        $stmt->execute(['user_id' => $userId]);
        $result = $stmt->fetch();

        return (int) ($result['total'] ?? 0);
    }

    /**
     * Delete notifikasi
     */
    public function deleteNotifikasi(int $notifikasiId): bool
    {
        return $this->delete($notifikasiId);
    }

    /**
     * Delete notifikasi lama (lebih dari 30 hari)
     */
    public function deleteOldNotifications(): int
    {
        $sql = "DELETE FROM {$this->table} 
                WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)";

        $stmt = $this->db->prepare($sql);
        $stmt->execute();

        return $stmt->rowCount();
    }
}

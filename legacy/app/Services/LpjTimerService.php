<?php

namespace App\Services;

use App\Core\Database;
use App\Models\Kegiatan;
use App\Models\Notifikasi;
use App\Models\User;
use DateTime;

class LpjTimerService
{
    private $db;

    private $kegiatanModel;

    private $notifikasiModel;

    private $userModel;

    private $mailService;

    // Durasi deadline LPJ (14 hari)
    const LPJ_DEADLINE_DAYS = 14;

    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
        $this->kegiatanModel = new Kegiatan;
        $this->notifikasiModel = new Notifikasi;
        $this->userModel = new User;
        $this->mailService = new MailService;
    }

    /**
     * Start timer LPJ setelah bendahara approve pencairan
     * Dipanggil saat approval level 'Bendahara-Cair' disetujui
     */
    public function startLpjTimer(int $kegiatanId): bool
    {
        $now = new DateTime;
        $deadline = clone $now;
        $deadline->modify('+'.self::LPJ_DEADLINE_DAYS.' days');

        $sql = 'UPDATE t_kegiatan 
                SET tgl_batas_lpj = :deadline
                WHERE kegiatan_id = :kegiatan_id';

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'deadline' => $deadline->format('Y-m-d H:i:s'),
            'kegiatan_id' => $kegiatanId,
        ]);

        return $stmt->rowCount() > 0;
    }

    /**
     * Mark LPJ sebagai submitted
     */
    public function markLpjSubmitted(int $kegiatanId): bool
    {
        $sql = 'UPDATE t_kegiatan 
                SET lpj_submitted_at = :submitted_at
                WHERE kegiatan_id = :kegiatan_id';

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'submitted_at' => date('Y-m-d H:i:s'),
            'kegiatan_id' => $kegiatanId,
        ]);

        return $stmt->rowCount() > 0;
    }

    /**
     * Check dan kirim reminder untuk semua kegiatan yang perlu diingatkan
     * Function ini dipanggil secara periodik (cron job atau manual trigger)
     */
    public function checkAndSendReminders(): array
    {
        $sentEmails = [];
        $failedEmails = [];
        $h7SentCount = 0;
        $h3SentCount = 0;
        $h1SentCount = 0;
        $overdueSentCount = 0;

        // Get kegiatan yang perlu reminder
        $kegiatan = $this->getKegiatanNeedingReminders();

        foreach ($kegiatan as $k) {
            $daysLeft = $this->getDaysUntilDeadline($k['tgl_batas_lpj']);

            // H-7
            if ($daysLeft <= 7 && $daysLeft > 6 && ! $this->hasSentReminderRecently($k['kegiatan_id'], 'h7')) {
                $result = $this->sendReminder($k, 7);
                if ($result && $result['status'] === 'sent') {
                    $sentEmails[] = $result;
                    $h7SentCount++;
                } elseif ($result) {
                    $failedEmails[] = $result;
                }
            }

            // H-3
            if ($daysLeft <= 3 && $daysLeft > 2 && ! $this->hasSentReminderRecently($k['kegiatan_id'], 'h3')) {
                $result = $this->sendReminder($k, 3);
                if ($result && $result['status'] === 'sent') {
                    $sentEmails[] = $result;
                    $h3SentCount++;
                } elseif ($result) {
                    $failedEmails[] = $result;
                }
            }

            // H-1
            if ($daysLeft <= 1 && $daysLeft > 0 && ! $this->hasSentReminderRecently($k['kegiatan_id'], 'h1')) {
                $result = $this->sendReminder($k, 1);
                if ($result && $result['status'] === 'sent') {
                    $sentEmails[] = $result;
                    $h1SentCount++;
                } elseif ($result) {
                    $failedEmails[] = $result;
                }
            }

            // Overdue
            if ($daysLeft < 0 && ! $this->hasSentReminderRecently($k['kegiatan_id'], 'overdue')) {
                $result = $this->sendOverdueNotification($k);
                if ($result && $result['status'] === 'sent') {
                    $sentEmails[] = $result;
                    $overdueSentCount++;
                } elseif ($result) {
                    $failedEmails[] = $result;
                }
            }
        }

        return [
            'sent' => $sentEmails,
            'failed' => $failedEmails,
            'h7_sent' => $h7SentCount,
            'h3_sent' => $h3SentCount,
            'h1_sent' => $h1SentCount,
            'overdue_sent' => $overdueSentCount,
        ];
    }

    /**
     * Get kegiatan yang perlu diingatkan
     */
    private function getKegiatanNeedingReminders(): array
    {
        $sql = 'SELECT k.kegiatan_id, t.nama_kegiatan, k.tgl_batas_lpj,
                       t.pengusul_user_id
                FROM t_kegiatan k
                JOIN t_kak t ON k.kak_id = t.kak_id
                WHERE k.bendahara_cair_approved_at IS NOT NULL
                  AND k.lpj_submitted_at IS NULL
                  AND k.tgl_batas_lpj IS NOT NULL';

        return $this->db->query($sql)->fetchAll();
    }

    /**
     * Hitung hari tersisa sampai deadline
     */
    private function getDaysUntilDeadline(string $deadline): int
    {
        $now = new DateTime;
        $deadlineDate = new DateTime($deadline);
        $diff = $now->diff($deadlineDate);

        return $diff->invert ? -$diff->days : $diff->days;
    }

    /**
     * Kirim reminder notification
     */
    private function sendReminder(array $kegiatan, int $daysLeft): ?array
    {
        $pesan = "Reminder: Anda memiliki {$daysLeft} hari untuk submit LPJ untuk kegiatan \"{$kegiatan['nama_kegiatan']}\"";

        $this->notifikasiModel->create([
            'penerima_user_id' => $kegiatan['pengusul_user_id'],
            'pesan' => $pesan,
            'link_tujuan' => '/pengusul/kegiatan/'.$kegiatan['kegiatan_id'].'/lpj',
            'is_read' => false,
        ]);

        $proposer = $this->userModel->findById($kegiatan['pengusul_user_id']);
        if ($proposer && ! empty($proposer['email'])) {
            $kegiatanDataForEmail = [
                'nama_kegiatan' => $kegiatan['nama_kegiatan'],
                'pengusul_nama' => $proposer['nama_lengkap'],
                'pengusul_email' => $proposer['email'],
                'kegiatan_id' => $kegiatan['kegiatan_id'],
            ];

            switch ($daysLeft) {
                case 7:
                    $this->mailService->remindLPJH7($kegiatanDataForEmail);
                    break;
                case 3:
                    $this->mailService->remindLPJH3($kegiatanDataForEmail);
                    break;
                case 1:
                    $sendResult = $this->mailService->remindLPJH1($kegiatanDataForEmail);

                    return ['status' => $sendResult['success'] ? 'sent' : 'failed', 'to' => $sendResult['to'], 'subject' => "Reminder: {$daysLeft} Hari Lagi Deadline LPJ", 'error' => $sendResult['error'] ?? null];
            }
        }

        return null;
    }

    /**
     * Kirim notifikasi overdue
     */
    private function sendOverdueNotification(array $kegiatan): ?array
    {
        $daysOverdue = abs($this->getDaysUntilDeadline($kegiatan['tgl_batas_lpj']));
        $pesan = "PERINGATAN: Anda terlambat {$daysOverdue} hari submit LPJ untuk kegiatan \"{$kegiatan['nama_kegiatan']}\"";

        $this->notifikasiModel->create([
            'penerima_user_id' => $kegiatan['pengusul_user_id'],
            'pesan' => $pesan,
            'link_tujuan' => '/pengusul/kegiatan/'.$kegiatan['kegiatan_id'].'/lpj',
            'is_read' => false,
        ]);

        $proposer = $this->userModel->findById($kegiatan['pengusul_user_id']);
        if ($proposer && ! empty($proposer['email'])) {
            $kegiatanDataForEmail = [
                'nama_kegiatan' => $kegiatan['nama_kegiatan'],
                'pengusul_nama' => $proposer['nama_lengkap'],
                'pengusul_email' => $proposer['email'],
                'kegiatan_id' => $kegiatan['kegiatan_id'],
            ];
            $sendResult = $this->mailService->alertLPJOverdue($kegiatanDataForEmail, $daysOverdue);

            return ['status' => $sendResult['success'] ? 'sent' : 'failed', 'to' => $sendResult['to'], 'subject' => "OVERDUE: LPJ Terlambat {$daysOverdue} Hari!", 'error' => $sendResult['error'] ?? null];
        }

        return null;
    }

    private function hasSentReminderRecently(int $kegiatanId, string $reminderType): bool
    {
        $linkLike = '%/kegiatan/'.$kegiatanId.'/lpj%';
        $pesanLike = '';
        switch ($reminderType) {
            case 'h7':
                $pesanLike = '%7 hari%';
                break;
            case 'h3':
                $pesanLike = '%3 hari%';
                break;
            case 'h1':
                $pesanLike = '%1 hari%';
                break;
            case 'overdue':
                $pesanLike = '%terlambat%';
                break;
        }

        if (empty($pesanLike)) {
            return false;
        }

        $sql = 'SELECT COUNT(*) as count 
                FROM t_notifikasi 
                WHERE link_tujuan LIKE :linkLike 
                  AND pesan LIKE :pesanLike 
                  AND created_at >= DATE_SUB(NOW(), INTERVAL 1 DAY)';

        $stmt = $this->db->prepare($sql);
        $stmt->execute([':linkLike' => $linkLike, ':pesanLike' => $pesanLike]);
        $result = $stmt->fetch();

        return $result && $result['count'] > 0;
    }

    /**
     * Get status LPJ untuk kegiatan tertentu
     */
    public function getLpjStatus(int $kegiatanId): array
    {
        $sql = 'SELECT bendahara_cair_approved_at, tgl_batas_lpj, 
                       lpj_submitted_at
                FROM t_kegiatan 
                WHERE kegiatan_id = :id';

        $stmt = $this->db->prepare($sql);
        $stmt->execute(['id' => $kegiatanId]);
        $result = $stmt->fetch();

        if (! $result || ! $result['tgl_batas_lpj']) {
            return [
                'status' => 'not_started',
                'message' => 'Timer LPJ belum dimulai',
            ];
        }

        if ($result['lpj_submitted_at']) {
            return [
                'status' => 'submitted',
                'message' => 'LPJ sudah disubmit',
                'submitted_at' => $result['lpj_submitted_at'],
            ];
        }

        $daysLeft = $this->getDaysUntilDeadline($result['tgl_batas_lpj']);

        if ($daysLeft < 0) {
            return [
                'status' => 'overdue',
                'message' => 'Terlambat '.abs($daysLeft).' hari',
                'deadline' => $result['tgl_batas_lpj'],
                'days_overdue' => abs($daysLeft),
            ];
        }

        return [
            'status' => 'active',
            'message' => "Sisa waktu: {$daysLeft} hari",
            'deadline' => $result['tgl_batas_lpj'],
            'days_left' => $daysLeft,
        ];
    }
}

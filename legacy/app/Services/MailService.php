<?php

namespace App\Services;

use App\Models\KAK;
use App\Models\User;

class MailService
{
    private $mailer;

    private $userModel;

    private $kakModel;

    private $baseUrl;

    public function __construct()
    {
        $this->mailer = new Mailer;
        $this->userModel = new User;
        $this->kakModel = new KAK;
        $this->baseUrl = $this->getBaseUrl();
    }

    private function getBaseUrl()
    {
        $protocol = (! empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https://' : 'http://';
        $host = $_SERVER['HTTP_HOST'] ?? 'localhost';

        return rtrim($protocol.$host, '/');
    }

    /**
     * Prepare embedded images untuk email (logo, dll)
     */
    private function getEmbeddedImages()
    {
        $embeddedImages = [];
        $logoPath = $this->mailer->getLogoPath();
        if ($logoPath) {
            $embeddedImages[] = ['path' => $logoPath, 'cid' => 'logo'];
        }

        $backgroundPath = $this->mailer->getBackgroundPath();
        if ($backgroundPath) {
            $embeddedImages[] = ['path' => $backgroundPath, 'cid' => 'background'];
        }

        return $embeddedImages;
    }

    /**
     * Send email dengan embedded images (helper method)
     */
    private function sendWithEmbeddedImages($to, $subject, $htmlBody, $attachments = [])
    {
        // Original recipient: $originalTo = $to;

        $sendResult = $this->mailer->send(
            $to,
            $subject,
            $htmlBody,
            null,
            $attachments,
            $this->getEmbeddedImages()
        );

        return $sendResult; // Return the structured array from Mailer::send()
    }

    // ==================== KAK WORKFLOW ====================

    /**
     * A. Pengusul Submit KAK → Kirim ke Verifikator
     */
    public function notifyKAKSubmitted($kakId, $kakData)
    {
        try {
            // Fetch full KAK data to get tipe_kegiatan_id
            $fullKakData = $this->kakModel->find($kakId);
            if (! $fullKakData || ! isset($fullKakData['tipe_kegiatan_id'])) {
                error_log("Error: KAK not found or tipe_kegiatan_id missing for kakId: {$kakId}");

                return false;
            }

            // Find the specific Verifikator based on tipe_kegiatan_id
            $verifikator = $this->userModel->findVerifikatorByTipeKegiatanId($fullKakData['tipe_kegiatan_id']);

            if (! $verifikator || empty($verifikator['email'])) {
                error_log("Error: No Verifikator found or email missing for tipe_kegiatan_id: {$fullKakData['tipe_kegiatan_id']}");

                return false;
            }

            $htmlBody = $this->mailer->renderTemplate('kak-submitted', [
                'nama_kegiatan' => $kakData['nama_kegiatan'],
                'pengusul_nama' => $kakData['pengusul_nama'],
                'kak_id' => $kakId,
                'link_detail' => $this->baseUrl.'/app/kak/verify/'.$kakId,
                'actionLink' => $this->baseUrl.'/app/kak/verify/'.$kakId,
            ]);

            // Send email only to the specific Verifikator
            $this->sendWithEmbeddedImages(
                $verifikator['email'],
                '🔔 KAK Baru Membutuhkan Verifikasi',
                $htmlBody
            );

            return true;
        } catch (\Exception $e) {
            error_log('Error sending KAK submitted notification: '.$e->getMessage());

            return false;
        }
    }

    /**
     * B. Verifikator Approve KAK → Kirim ke Pengusul
     */
    public function notifyKAKApproved($kakId, $kakData)
    {
        try {
            $htmlBody = $this->mailer->renderTemplate('kak-approved', [
                'nama_kegiatan' => $kakData['nama_kegiatan'],
                'pengusul_nama' => $kakData['pengusul_nama'],
                'kak_id' => $kakId,
                'link_detail' => $this->baseUrl.'/app/kak/detail/'.$kakId,
                'actionLink' => $this->baseUrl.'/app/kak/detail/'.$kakId,
            ]);

            return $this->sendWithEmbeddedImages(
                $kakData['pengusul_email'],
                '✅ KAK Disetujui - Lanjutkan ke Kegiatan',
                $htmlBody
            );
        } catch (\Exception $e) {
            error_log('Error sending KAK approved notification: '.$e->getMessage());

            return false;
        }
    }

    /**
     * Z. Verifikator Approve KAK (Notification to Proposer via email)
     * This is a specific request from the user for automation.
     */
    public function sendKakApprovedVerifikatorEmail($recipientEmail, $recipientName, $kakName, $kakId)
    {
        try {
            $htmlBody = $this->mailer->renderTemplate('kak-approved-verifikator', [
                'nama_pengusul' => $recipientName,
                'nama_kegiatan' => $kakName,
                'kak_id' => $kakId,
                'link_detail' => $this->baseUrl.'/app/kak/detail/'.$kakId,
                'actionLink' => $this->baseUrl.'/app/kak/detail/'.$kakId,
            ]);

            $sendResult = $this->sendWithEmbeddedImages(
                $recipientEmail,
                '✅ KAK Anda Telah Disetujui Verifikator',
                $htmlBody
            );

            if (is_string($sendResult)) { // If it's a string, it's an error message
                return $sendResult;
            }

            return true; // Otherwise, it was successful

        } catch (\Exception $e) {
            error_log('Error sending KAK approved by verifikator email: '.$e->getMessage());

            return 'Error preparing KAK approved by verifikator email: '.$e->getMessage();
        }
    }

    /**
     * C. Verifikator Minta Revisi → Kirim ke Pengusul
     */
    public function notifyKAKRevisionRequested($kakId, $kakData, $catatan)
    {
        try {
            $htmlBody = $this->mailer->renderTemplate('kak-revision-requested', [
                'nama_kegiatan' => $kakData['nama_kegiatan'],
                'pengusul_nama' => $kakData['pengusul_nama'],
                'kak_id' => $kakId,
                'catatan' => $catatan,
                'link_detail' => $this->baseUrl.'/app/kak/edit/'.$kakId,
                'actionLink' => $this->baseUrl.'/app/kak/edit/'.$kakId,
            ]);

            return $this->sendWithEmbeddedImages(
                $kakData['pengusul_email'],
                '⚠️ KAK Perlu Revisi',
                $htmlBody
            );
        } catch (\Exception $e) {
            error_log('Error sending KAK revision requested notification: '.$e->getMessage());

            return false;
        }
    }

    /**
     * D. Verifikator Reject KAK → Kirim ke Pengusul
     */
    public function notifyKAKRejected($kakId, $kakData, $catatan)
    {
        try {
            $htmlBody = $this->mailer->renderTemplate('kak-rejected', [
                'nama_kegiatan' => $kakData['nama_kegiatan'],
                'pengusul_nama' => $kakData['pengusul_nama'],
                'kak_id' => $kakId,
                'catatan' => $catatan,
                'link_detail' => $this->baseUrl.'/app/kak/detail/'.$kakId,
            ]);

            return $this->sendWithEmbeddedImages(
                $kakData['pengusul_email'],
                '❌ KAK Ditolak',
                $htmlBody
            );
        } catch (\Exception $e) {
            error_log('Error sending KAK rejected notification: '.$e->getMessage());

            return false;
        }
    }

    /**
     * E. Pengusul Resubmit Setelah Revisi → Kirim ke Verifikator
     */
    public function notifyKAKResubmitted($kakId, $kakData)
    {
        try {
            $verifikators = $this->userModel->findByRoleId(2); // Verifikator

            $htmlBody = $this->mailer->renderTemplate('kak-resubmitted', [
                'nama_kegiatan' => $kakData['nama_kegiatan'],
                'pengusul_nama' => $kakData['pengusul_nama'],
                'kak_id' => $kakId,
                'link_detail' => $this->baseUrl.'/app/kak/verify/'.$kakId,
                'actionLink' => $this->baseUrl.'/app/kak/verify/'.$kakId,
            ]);

            foreach ($verifikators as $v) {
                $this->sendWithEmbeddedImages(
                    $v['email'],
                    '🔄 KAK Sudah Direvisi - Perlu Review Ulang',
                    $htmlBody
                );
            }

            return true;
        } catch (\Exception $e) {
            error_log('Error sending KAK resubmitted notification: '.$e->getMessage());

            return false;
        }
    }

    // ==================== KEGIATAN APPROVAL WORKFLOW ====================

    /**
     * F. PPK Approve Kegiatan → Kirim ke Pengusul
     */
    public function notifyKegiatanApprovedByPPK($kegiatanId, $kegiatanData)
    {
        try {
            $htmlBody = $this->mailer->renderTemplate('kegiatan-approved-ppk', [
                'nama_kegiatan' => $kegiatanData['nama_kegiatan'],
                'pengusul_nama' => $kegiatanData['pengusul_nama'],
                'kegiatan_id' => $kegiatanId,
                'link_detail' => $this->baseUrl.'/app/kegiatan/detail/'.$kegiatanId,
                'actionLink' => $this->baseUrl.'/app/kegiatan/detail/'.$kegiatanId,
            ]);

            return $this->sendWithEmbeddedImages(
                $kegiatanData['pengusul_email'],
                '✅ Kegiatan Disetujui oleh PPK',
                $htmlBody
            );
        } catch (\Exception $e) {
            error_log('Error sending kegiatan PPK approval notification: '.$e->getMessage());

            return false;
        }
    }

    /**
     * G. Wadir Approve Kegiatan → Kirim ke Pengusul
     */
    public function notifyKegiatanApprovedByWadir($kegiatanId, $kegiatanData)
    {
        try {
            $htmlBody = $this->mailer->renderTemplate('kegiatan-approved-wadir', [
                'nama_kegiatan' => $kegiatanData['nama_kegiatan'],
                'pengusul_nama' => $kegiatanData['pengusul_nama'],
                'kegiatan_id' => $kegiatanId,
                'link_detail' => $this->baseUrl.'/app/kegiatan/detail/'.$kegiatanId,
                'actionLink' => $this->baseUrl.'/app/kegiatan/detail/'.$kegiatanId,
            ]);

            return $this->sendWithEmbeddedImages(
                $kegiatanData['pengusul_email'],
                '✅ Kegiatan Disetujui oleh Wadir',
                $htmlBody
            );
        } catch (\Exception $e) {
            error_log('Error sending kegiatan Wadir approval notification: '.$e->getMessage());

            return false;
        }
    }

    /**
     * H. Bendahara Cair Dana ⭐ PENTING → Kirim ke Pengusul
     */
    public function notifyFundsReleased($kegiatanId, $kegiatanData, $jumlahCair)
    {
        try {
            $batasPengajuanLPJ = date('Y-m-d', strtotime('+14 days'));

            $htmlBody = $this->mailer->renderTemplate('dana-dicairkan', [
                'nama_kegiatan' => $kegiatanData['nama_kegiatan'],
                'pengusul_nama' => $kegiatanData['pengusul_nama'],
                'kegiatan_id' => $kegiatanId,
                'jumlah_dicair' => $jumlahCair,
                'batas_lpj' => $batasPengajuanLPJ,
                'link_detail' => $this->baseUrl.'/app/kegiatan/detail/'.$kegiatanId,
                'actionLink' => $this->baseUrl.'/app/kegiatan/detail/'.$kegiatanId,
            ]);

            return $this->sendWithEmbeddedImages(
                $kegiatanData['pengusul_email'],
                '🚀 Dana Dicairkan - Deadline LPJ 14 Hari',
                $htmlBody
            );
        } catch (\Exception $e) {
            error_log('Error sending funds released notification: '.$e->getMessage());

            return false;
        }
    }

    // ==================== LPJ REMINDERS (AUTOMATED) ====================

    /**
     * I. Reminder H-7 sebelum deadline LPJ
     */
    public function remindLPJH7($kegiatanData)
    {
        try {
            $htmlBody = $this->mailer->renderTemplate('lpj-reminder-h7', [
                'nama_kegiatan' => $kegiatanData['nama_kegiatan'],
                'pengusul_nama' => $kegiatanData['pengusul_nama'],
                'kegiatan_id' => $kegiatanData['kegiatan_id'],
                'sisa_hari' => 7,
                'link_detail' => $this->baseUrl.'/app/kegiatan/detail/'.$kegiatanData['kegiatan_id'],
                'actionLink' => $this->baseUrl.'/app/kegiatan/lpj/'.$kegiatanData['kegiatan_id'],
            ]);

            return $this->sendWithEmbeddedImages(
                $kegiatanData['pengusul_email'],
                '⏰ Reminder: 7 Hari Lagi Deadline LPJ',
                $htmlBody
            );
        } catch (\Exception $e) {
            error_log('Error sending H-7 LPJ reminder: '.$e->getMessage());

            return false;
        }
    }

    /**
     * J. Reminder H-3 (Urgent)
     */
    public function remindLPJH3($kegiatanData)
    {
        try {
            $htmlBody = $this->mailer->renderTemplate('lpj-reminder-h3', [
                'nama_kegiatan' => $kegiatanData['nama_kegiatan'],
                'pengusul_nama' => $kegiatanData['pengusul_nama'],
                'kegiatan_id' => $kegiatanData['kegiatan_id'],
                'sisa_hari' => 3,
                'link_detail' => $this->baseUrl.'/app/kegiatan/detail/'.$kegiatanData['kegiatan_id'],
                'actionLink' => $this->baseUrl.'/app/kegiatan/lpj/'.$kegiatanData['kegiatan_id'],
            ]);

            return $this->sendWithEmbeddedImages(
                $kegiatanData['pengusul_email'],
                '🚨 URGENT: 3 Hari Lagi Deadline LPJ',
                $htmlBody
            );
        } catch (\Exception $e) {
            error_log('Error sending H-3 LPJ reminder: '.$e->getMessage());

            return false;
        }
    }

    /**
     * K. Reminder H-1 (Very Urgent)
     */
    public function remindLPJH1($kegiatanData)
    {
        try {
            $htmlBody = $this->mailer->renderTemplate('lpj-reminder-h1', [
                'nama_kegiatan' => $kegiatanData['nama_kegiatan'],
                'pengusul_nama' => $kegiatanData['pengusul_nama'],
                'kegiatan_id' => $kegiatanData['kegiatan_id'],
                'sisa_hari' => 1,
                'link_detail' => $this->baseUrl.'/app/kegiatan/detail/'.$kegiatanData['kegiatan_id'],
                'actionLink' => $this->baseUrl.'/app/kegiatan/lpj/'.$kegiatanData['kegiatan_id'],
            ]);

            return $this->sendWithEmbeddedImages(
                $kegiatanData['pengusul_email'],
                '🚨 SANGAT URGENT: Besok Deadline LPJ!',
                $htmlBody
            );
        } catch (\Exception $e) {
            error_log('Error sending H-1 LPJ reminder: '.$e->getMessage());

            return false;
        }
    }

    /**
     * L. Alert Overdue LPJ
     */
    public function alertLPJOverdue($kegiatanData, $hariTerlambat)
    {
        try {
            $bendahara = $this->userModel->findByRoleId(6); // role_id 6 = Bendahara
            $admin = $this->userModel->findByRoleId(1); // role_id 1 = Admin

            $htmlBody = $this->mailer->renderTemplate('lpj-overdue', [
                'nama_kegiatan' => $kegiatanData['nama_kegiatan'],
                'pengusul_nama' => $kegiatanData['pengusul_nama'],
                'kegiatan_id' => $kegiatanData['kegiatan_id'],
                'hari_terlambat' => $hariTerlambat,
                'link_detail' => $this->baseUrl.'/app/kegiatan/detail/'.$kegiatanData['kegiatan_id'],
            ]);

            // Kirim ke pengusul
            $this->sendWithEmbeddedImages(
                $kegiatanData['pengusul_email'],
                "🚨 OVERDUE: LPJ Terlambat {$hariTerlambat} Hari!",
                $htmlBody
            );

            // CC ke bendahara & admin
            foreach ($bendahara as $b) {
                $this->sendWithEmbeddedImages(
                    $b['email'],
                    "🚨 OVERDUE: LPJ Terlambat {$hariTerlambat} Hari - {$kegiatanData['nama_kegiatan']}",
                    $htmlBody
                );
            }

            foreach ($admin as $a) {
                $this->sendWithEmbeddedImages(
                    $a['email'],
                    "🚨 OVERDUE: LPJ Terlambat {$hariTerlambat} Hari - {$kegiatanData['nama_kegiatan']}",
                    $htmlBody
                );
            }

            return true;
        } catch (\Exception $e) {
            error_log('Error sending LPJ overdue alert: '.$e->getMessage());

            return false;
        }
    }

    // ==================== LPJ SUBMIT & REVIEW ====================

    /**
     * M. Pengusul Submit LPJ → Kirim ke Bendahara
     */
    public function notifyLPJSubmitted($kegiatanId, $kegiatanData)
    {
        try {
            $bendahara = $this->userModel->findByRoleId(6); // role_id 6 = Bendahara

            $htmlBody = $this->mailer->renderTemplate('lpj-submitted', [
                'nama_kegiatan' => $kegiatanData['nama_kegiatan'],
                'pengusul_nama' => $kegiatanData['pengusul_nama'],
                'kegiatan_id' => $kegiatanId,
                'link_detail' => $this->baseUrl.'/app/kegiatan/lpj/review/'.$kegiatanId,
                'actionLink' => $this->baseUrl.'/app/kegiatan/lpj/review/'.$kegiatanId,
            ]);

            foreach ($bendahara as $b) {
                $this->sendWithEmbeddedImages(
                    $b['email'],
                    '📋 LPJ Baru Perlu Review',
                    $htmlBody
                );
            }

            return true;
        } catch (\Exception $e) {
            error_log('Error sending LPJ submitted notification: '.$e->getMessage());

            return false;
        }
    }

    /**
     * N. Bendahara Approve LPJ → Kirim ke Pengusul
     */
    public function notifyLPJApproved($kegiatanId, $kegiatanData)
    {
        try {
            $htmlBody = $this->mailer->renderTemplate('lpj-approved', [
                'nama_kegiatan' => $kegiatanData['nama_kegiatan'],
                'pengusul_nama' => $kegiatanData['pengusul_nama'],
                'kegiatan_id' => $kegiatanId,
                'link_detail' => $this->baseUrl.'/app/kegiatan/detail/'.$kegiatanId,
                'actionLink' => $this->baseUrl.'/app/kegiatan/detail/'.$kegiatanId,
            ]);

            return $this->sendWithEmbeddedImages(
                $kegiatanData['pengusul_email'],
                '✅ LPJ Disetujui - Kegiatan Selesai',
                $htmlBody
            );
        } catch (\Exception $e) {
            error_log('Error sending LPJ approved notification: '.$e->getMessage());

            return false;
        }
    }

    /**
     * O. Bendahara Reject LPJ → Kirim ke Pengusul
     */
    public function notifyLPJRejected($kegiatanId, $kegiatanData, $catatan)
    {
        try {
            $htmlBody = $this->mailer->renderTemplate('lpj-rejected', [
                'nama_kegiatan' => $kegiatanData['nama_kegiatan'],
                'pengusul_nama' => $kegiatanData['pengusul_nama'],
                'kegiatan_id' => $kegiatanId,
                'catatan' => $catatan,
                'link_detail' => $this->baseUrl.'/app/kegiatan/lpj/'.$kegiatanId,
                'actionLink' => $this->baseUrl.'/app/kegiatan/lpj/'.$kegiatanId,
            ]);

            return $this->sendWithEmbeddedImages(
                $kegiatanData['pengusul_email'],
                '❌ LPJ Ditolak - Perlu Perbaikan',
                $htmlBody
            );
        } catch (\Exception $e) {
            error_log('Error sending LPJ rejected notification: '.$e->getMessage());

            return false;
        }
    }

    /**
     * Send password reset email
     */
    public function sendPasswordResetEmail($user, $newPassword)
    {
        try {
            $htmlBody = $this->mailer->renderTemplate('password-reset', [
                'nama_user' => $user['nama_lengkap'],
                'new_password' => $newPassword,
                'login_link' => $this->baseUrl.'/login',
            ]);

            return $this->sendWithEmbeddedImages(
                $user['email'],
                '🔑 Password Anda Telah Direset',
                $htmlBody
            );
        } catch (\Exception $e) {
            error_log('Error sending password reset email: '.$e->getMessage());

            return false;
        }
    }
}

<?php

namespace App\Services;

use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\PHPMailer;

/**
 * Email Service using PHPMailer
 *
 * Image URLs in emails:
 * - Emails require absolute URLs (http://domain.com/path/image.png)
 * - Set APP_URL environment variable for production
 * - Images must be publicly accessible via HTTP
 * - Logo URL is automatically added to all templates
 */
class Mailer
{
    private $mail;

    private $config;

    public function __construct()
    {
        $this->mail = new PHPMailer(true);
        $this->config = $this->getConfig();
        $this->setupMailer();
    }

    /**
     * Setup konfigurasi PHPMailer
     */
    private function setupMailer()
    {
        try {
            // Enable verbose debug output
            $this->mail->SMTPDebug = 2;
            $this->mail->Debugoutput = 'error_log';

            // Gunakan SMTP
            $this->mail->isSMTP();
            $this->mail->Host = $this->config['host'];
            $this->mail->SMTPAuth = true;
            $this->mail->Username = $this->config['username'];
            $this->mail->Password = $this->config['password'];
            $this->mail->SMTPSecure = $this->config['encryption']; // PHPMailer::ENCRYPTION_STARTTLS or ENCRYPTION_SMTPS
            $this->mail->Port = $this->config['port'];
            $this->mail->CharSet = 'UTF-8';
            $this->mail->Encoding = 'base64';

            // Set from address
            $this->mail->setFrom($this->config['from_email'], $this->config['from_name']);
            error_log("PHPMailer Setup Complete. Host: {$this->config['host']}, Username: {$this->config['username']}");
        } catch (Exception $e) {
            error_log('[PHPMailer Setup Error]: '.$e->getMessage());
            throw new Exception('Mailer setup error: '.$e->getMessage());
        }
    }

    /**
     * Ambil konfigurasi email dari environment atau hardcoded
     */
    private function getConfig()
    {
        $config = [
            'host' => getenv('MAIL_HOST') ?: 'smtp.gmail.com',
            'port' => getenv('MAIL_PORT') ?: 587,
            'username' => getenv('MAIL_USERNAME') ?: 'sigap.pnj@gmail.com',
            'password' => getenv('MAIL_PASSWORD') ?: 'mjnlzufpkauacqwl',
            'encryption' => getenv('MAIL_ENCRYPTION') ?: PHPMailer::ENCRYPTION_STARTTLS,
            'from_email' => getenv('MAIL_FROM_EMAIL') ?: 'noreply@pnj.ac.id',
            'from_name' => getenv('MAIL_FROM_NAME') ?: 'SIGAP PNJ',
        ];
        error_log('Mailer Config Loaded: '.json_encode($config));

        return $config;
    }

    /**
     * Kirim email dengan template
     *
     * @param  string  $to  Email penerima
     * @param  string  $subject  Subjek email
     * @param  string  $body  Body HTML email
     * @param  string|null  $altBody  Plain text alternatif
     * @param  array  $attachments  Array file attachments
     * @param  array  $embeddedImages  Array of embedded images [['path' => 'file.jpg', 'cid' => 'logo']]
     */
    public function send($to, $subject, $body, $altBody = null, $attachments = [], $embeddedImages = [])
    {
        try {
            $this->mail->clearAddresses();
            $this->mail->clearAttachments();
            $this->mail->addAddress($to);
            $this->mail->Subject = $subject;
            $this->mail->isHTML(true);
            $this->mail->Body = $body;
            $this->mail->AltBody = $altBody ?? strip_tags($body);

            // Tambah attachment jika ada
            if (! empty($attachments)) {
                foreach ($attachments as $file) {
                    $this->mail->addAttachment($file);
                }
            }

            // Tambah embedded images jika ada (untuk ditampilkan di body email)
            if (! empty($embeddedImages)) {
                foreach ($embeddedImages as $image) {
                    if (isset($image['path']) && isset($image['cid']) && file_exists($image['path'])) {
                        $this->mail->addEmbeddedImage(
                            $image['path'],
                            $image['cid'],
                            basename($image['path'])
                        );
                    }
                }
            }

            $this->mail->send();

            return ['success' => true, 'to' => $to];
        } catch (Exception $e) {
            error_log('[PHPMailer Send Error]: '.$e->getMessage().' ErrorInfo: '.$this->mail->ErrorInfo);

            // Instead of throwing, return the error message for display
            return ['success' => false, 'error' => 'Email send failed: '.$e->getMessage().' ErrorInfo: '.$this->mail->ErrorInfo, 'to' => $to];
        }
    }

    /**
     * Kirim ke multiple recipients
     */
    public function sendBatch($recipients, $subject, $body, $altBody = null, $attachments = [], $embeddedImages = [])
    {
        $failed = [];

        foreach ($recipients as $email) {
            try {
                $this->send($email, $subject, $body, $altBody, $attachments, $embeddedImages);
            } catch (Exception $e) {
                $failed[] = [
                    'email' => $email,
                    'error' => $e->getMessage(),
                ];
            }
        }

        return [
            'success' => count($recipients) - count($failed),
            'failed' => $failed,
        ];
    }

    /**
     * Render template dengan variabel
     */
    public function renderTemplate($templateName, $data = [])
    {
        $templatePath = __DIR__.'/../../public/emails/'.$templateName.'.php';

        if (! file_exists($templatePath)) {
            throw new Exception("Email template not found: {$templateName}");
        }

        // Add base URL for email assets (images, etc)
        // Change this to your production domain when deploying
        $baseUrl = getenv('APP_URL') ?: 'http://localhost';

        // Use CID for embedded images instead of URL
        // Logo akan di-embed sebagai attachment dengan cid:logo
        $data['logoUrl'] = 'cid:logo';
        $data['baseUrl'] = $baseUrl;

        extract($data);
        ob_start();
        include $templatePath;
        $html = ob_get_clean();

        return $html;
    }

    /**
     * Get logo path untuk embedded image
     * Note: SVG tidak bisa di-embed di email, jadi gunakan PNG/JPG
     */
    public function getLogoPath()
    {
        // Cari logo dalam format yang didukung email (PNG, JPG, GIF)
        // SVG tidak didukung oleh banyak email client
        $possiblePaths = [
            __DIR__.'/../../public/assets/img/logo/logo.png',
            __DIR__.'/../../public/assets/img/branding/logo.png',
            __DIR__.'/../../public/assets/img/logo.png',
            __DIR__.'/../../public/assets/img/logo/logo.jpg',
            __DIR__.'/../../public/assets/img/logo.jpg',
        ];

        foreach ($possiblePaths as $path) {
            if (file_exists($path)) {
                return $path;
            }
        }

        // Return null if no logo found
        return null;
    }

    /**
     * Get background image path for embedded image
     * Note: SVG cannot be embedded in emails, so use PNG/JPG
     */
    public function getBackgroundPath()
    {
        $possiblePaths = [
            __DIR__.'/../../public/assets/img/background/email_bg.png',
            __DIR__.'/../../public/assets/img/background.png',
            __DIR__.'/../../public/assets/img/background/email_bg.jpg',
            __DIR__.'/../../public/assets/img/background.jpg',
        ];

        foreach ($possiblePaths as $path) {
            if (file_exists($path)) {
                return $path;
            }
        }

        // Return null if no background image found
        return null;
    }
}

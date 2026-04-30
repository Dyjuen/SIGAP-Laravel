<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PasswordResetMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public $mailData;

    public function __construct(array $mailData)
    {
        $this->mailData = $mailData;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Reset Password - SIGAP PNJ',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'mail.general',
            with: [
                'title' => 'Password Direset',
                'recipient_name' => $this->mailData['recipient_name'],
                'body' => "Password Anda telah direset. Silakan login menggunakan password baru berikut:<br><br>Password: <strong>{$this->mailData['new_password']}</strong>",
                'action_link' => $this->mailData['action_link'],
                'action_text' => 'Login Sekarang',
                'status_color' => '#dc3545',
            ],
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}

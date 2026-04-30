<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class FundsReleasedMail extends Mailable implements ShouldQueue
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
            subject: 'Dana Dicairkan - SIGAP PNJ',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'mail.general',
            with: [
                'title' => 'Dana Telah Dicairkan',
                'recipient_name' => $this->mailData['recipient_name'],
                'body' => "Dana untuk kegiatan <strong>{$this->mailData['nama_kegiatan']}</strong> sebesar <strong>Rp ".number_format($this->mailData['jumlah'], 0, ',', '.').'</strong> telah dicairkan oleh Bendahara. Silakan ajukan LPJ maksimal 14 hari setelah pelaksanaan.',
                'action_link' => $this->mailData['action_link'],
                'action_text' => 'Lihat Detail Kegiatan',
                'status_color' => '#1ABDD4',
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

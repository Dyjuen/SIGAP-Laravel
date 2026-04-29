<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class KAKWorkflowMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public $mailData;

    /**
     * Create a new message instance.
     */
    public function __construct(array $mailData)
    {
        $this->mailData = $mailData;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: $this->mailData['subject'] ?? 'Pemberitahuan KAK - SIGAP PNJ',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'mail.kak-workflow',
            with: [
                'title' => $this->mailData['title'],
                'recipient_name' => $this->mailData['recipient_name'],
                'body' => $this->mailData['body'],
                'details' => $this->mailData['details'] ?? [],
                'action_link' => $this->mailData['action_link'] ?? null,
                'action_text' => $this->mailData['action_text'] ?? null,
                'status_color' => $this->mailData['status_color'] ?? '#1ABDD4',
            ],
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}

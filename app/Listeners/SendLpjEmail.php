<?php

namespace App\Listeners;

use App\Events\LpjSubmitted;
use App\Events\LpjRevised;
use App\Events\LpjApproved;
use App\Events\LpjCompleted;
use App\Mail\LPJWorkflowMail;
use App\Models\User;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Mail;

class SendLpjEmail
{
    use InteractsWithQueue;

    /**
     * Handle the event.
     */
    public function handle(mixed $event): void
    {
        $kegiatan = $event->kegiatan;
        $kegiatan->load(['kak.pengusul']);

        if ($event instanceof LpjSubmitted) {
            $bendahara = User::whereHas('role', function ($q) {
                $q->where('nama_role', 'Bendahara');
            })->first();

            if ($bendahara && $bendahara->email) {
                $isResubmit = ($event->type === 'resubmitted');
                $data = [
                    'subject' => $isResubmit ? '🔄 LPJ Direvisi - Perlu Review Ulang' : '📋 LPJ Baru Perlu Review - SIGAP PNJ',
                    'title' => 'Review LPJ Baru',
                    'recipient_name' => $bendahara->nama_lengkap,
                    'body' => $isResubmit
                        ? 'Halo <strong>Bendahara</strong>,<br><br>LPJ yang sebelumnya diminta revisi telah diajukan kembali oleh pengusul.'
                        : 'Halo <strong>Bendahara</strong>,<br><br>Ada LPJ baru yang telah disubmit dan memerlukan review Anda.',
                    'details' => [
                        'Nama Kegiatan' => $kegiatan->kak->nama_kegiatan,
                        'Pengusul' => $kegiatan->kak->pengusul->nama_lengkap,
                    ],
                    'action_link' => config('app.url')."/lpj/review/{$kegiatan->kegiatan_id}",
                    'status_color' => '#dc3545',
                ];

                Mail::to($bendahara->email)->send(new LPJWorkflowMail($data));
            }
        } else {
            // LpjRevised, LpjApproved, LpjCompleted go to Pengusul
            $pengusul = $kegiatan->kak->pengusul;

            if ($pengusul && $pengusul->email) {
                $statusType = 'updated';
                $statusColor = '#28a745';

                if ($event instanceof LpjRevised) {
                    $statusType = 'revised';
                    $statusColor = '#ffc107';
                } elseif ($event instanceof LpjApproved) {
                    $statusType = 'approved';
                    $statusColor = '#28a745';
                } elseif ($event instanceof LpjCompleted) {
                    $statusType = 'completed';
                    $statusColor = '#28a745';
                }

                $data = [
                    'subject' => 'Status LPJ: ' . strtoupper($statusType) . ' - SIGAP PNJ',
                    'title' => 'Update Status LPJ',
                    'recipient_name' => $pengusul->nama_lengkap,
                    'body' => $event->message,
                    'details' => [
                        'Nama Kegiatan' => $kegiatan->kak->nama_kegiatan,
                    ],
                    'action_link' => config('app.url') . '/lpj',
                    'status_color' => $statusColor,
                ];

                Mail::to($pengusul->email)->send(new LPJWorkflowMail($data));
            }
        }
    }
}

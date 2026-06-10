<?php

namespace App\Listeners;

use App\Events\KegiatanApproved;
use App\Mail\KAKWorkflowMail;
use App\Models\Notifikasi;
use App\Services\FcmService;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Mail;

class SendKegiatanEmail
{
    use InteractsWithQueue;

    protected FcmService $fcmService;

    /**
     * Create the event listener.
     */
    public function __construct(FcmService $fcmService)
    {
        $this->fcmService = $fcmService;
    }

    /**
     * Handle the event.
     */
    public function handle(KegiatanApproved $event): void
    {
        $kegiatan = $event->kegiatan;
        $kegiatan->load(['kak.pengusul', 'kak.status']);

        $kak = $kegiatan->kak;
        $pengusul = $kak->pengusul;

        if (! $pengusul || ! $pengusul->email) {
            return;
        }

        $role = $event->approvedByRole;
        $catatan = $event->catatan;

        $data = [
            'subject' => "✅ Kegiatan Disetujui oleh {$role} - SIGAP PNJ",
            'title' => 'Kegiatan Disetujui',
            'recipient_name' => $pengusul->nama_lengkap,
            'body' => "Kegiatan Anda telah disetujui oleh <strong>{$role}</strong>. "
                ."Status kegiatan saat ini: <strong>{$kak->status->nama_status}</strong>."
                .($catatan ? "<br><br><strong>Catatan:</strong> {$catatan}" : ''),
            'details' => [
                'Nama Kegiatan' => $kak->nama_kegiatan,
            ],
            'action_link' => config('app.url')."/kegiatan/{$kegiatan->kegiatan_id}",
            'action_text' => 'Lihat Detail Kegiatan',
            'status_color' => '#28a745',
        ];

        Mail::to($pengusul->email)->send(new KAKWorkflowMail($data));

        // In-app notification
        Notifikasi::create([
            'penerima_user_id' => $pengusul->user_id,
            'pesan' => $pesan = "Kegiatan '{$kak->nama_kegiatan}' Anda telah disetujui oleh {$role}.",
            'link_tujuan' => "/kegiatan/{$kegiatan->kegiatan_id}",
            'is_read' => 0,
        ]);

        // Send push notification
        $this->fcmService->sendToUser(
            $pengusul->user_id,
            '✅ Kegiatan Disetujui',
            $pesan,
            ['click_action' => 'FLUTTER_NOTIFICATION_CLICK', 'link_tujuan' => "/kegiatan/{$kegiatan->kegiatan_id}"]
        );
    }
}

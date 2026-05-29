<?php

namespace App\Listeners;

use App\Events\KakSubmitted;
use App\Events\KakApproved;
use App\Events\KakRejected;
use App\Events\KakRevised;
use App\Mail\KAKWorkflowMail;
use App\Models\User;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Mail;

class SendKakWorkflowEmail implements ShouldQueue
{
    use InteractsWithQueue;

    /**
     * Handle the event.
     */
    public function handle(mixed $event): void
    {
        $kak = $event->kak;

        if ($event instanceof KakSubmitted) {
            $kak->load('pengusul');
            $verifikatorUsername = 'verifikator'.$kak->tipe_kegiatan_id;
            $verifikator = User::where('username', $verifikatorUsername)->first();

            if ($verifikator && $verifikator->email) {
                $isResubmit = ($event->type === 'resubmitted');
                $data = [
                    'subject' => $isResubmit ? '🔄 KAK Sudah Direvisi - Perlu Review Ulang' : '🔔 KAK Baru Membutuhkan Verifikasi',
                    'title' => $isResubmit ? 'KAK Telah Direvisi' : 'KAK Baru Disubmit',
                    'recipient_name' => $verifikator->nama_lengkap,
                    'body' => $isResubmit
                        ? 'Halo <strong>Verifikator</strong>,<br><br>KAK yang sebelumnya diminta revisi telah diajukan kembali.'
                        : 'Halo <strong>Verifikator</strong>,<br><br>Ada KAK baru yang telah disubmit dan membutuhkan verifikasi.',
                    'details' => [
                        'Nama Kegiatan' => $kak->nama_kegiatan,
                        'Diajukan oleh' => $kak->pengusul->nama_lengkap,
                    ],
                    'action_link' => config('app.url')."/kak/{$kak->kak_id}",
                    'action_text' => 'Review KAK Sekarang',
                    'status_color' => '#1ABDD4',
                ];

                Mail::to($verifikator->email)->send(new KAKWorkflowMail($data));
            }
        } else {
            // Approved, Rejected, Revised are sent to Pengusul
            $kak->load('pengusul');
            $pengusul = $kak->pengusul;

            if ($pengusul && $pengusul->email) {
                $type = $event->type;
                
                // Fetch catatan safely based on event type
                $catatan = null;
                if ($event instanceof KakRejected || $event instanceof KakRevised) {
                    $catatan = $event->catatan;
                }

                $config = [
                    'approved' => [
                        'subject' => '✅ KAK Disetujui - SIGAP PNJ',
                        'title' => 'KAK Disetujui',
                        'body' => 'Selamat! KAK Anda telah disetujui oleh Verifikator. Silakan melanjutkan ke tahap pengajuan kegiatan.',
                        'color' => '#28a745',
                    ],
                    'rejected' => [
                        'subject' => '❌ KAK Ditolak - SIGAP PNJ',
                        'title' => 'KAK Ditolak',
                        'body' => 'Mohon maaf, KAK Anda telah ditolak oleh Verifikator.<br><br><strong>Catatan:</strong> '.($catatan ?? '-'),
                        'color' => '#dc3545',
                    ],
                    'revised' => [
                        'subject' => '⚠️ KAK Perlu Revisi - SIGAP PNJ',
                        'title' => 'Permintaan Revisi KAK',
                        'body' => 'Verifikator telah mereview KAK Anda dan meminta beberapa perbaikan.<br><br><strong>Catatan:</strong> '.($catatan ?? '-'),
                        'color' => '#ffc107',
                    ],
                ];

                if (isset($config[$type])) {
                    $c = $config[$type];
                    $data = [
                        'subject' => $c['subject'],
                        'title' => $c['title'],
                        'recipient_name' => $pengusul->nama_lengkap,
                        'body' => $c['body'],
                        'details' => [
                            'Nama Kegiatan' => $kak->nama_kegiatan,
                        ],
                        'action_link' => config('app.url')."/kak/{$kak->kak_id}",
                        'action_text' => 'Lihat KAK',
                        'status_color' => $c['color'],
                    ];

                    Mail::to($pengusul->email)->send(new KAKWorkflowMail($data));
                }
            }
        }
    }
}

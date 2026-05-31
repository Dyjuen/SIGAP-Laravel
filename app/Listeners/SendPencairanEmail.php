<?php

namespace App\Listeners;

use App\Events\PencairanSelesai;
use App\Mail\FundsReleasedMail;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Mail;

class SendPencairanEmail
{
    use InteractsWithQueue;

    /**
     * Handle the event.
     */
    public function handle(PencairanSelesai $event): void
    {
        $kegiatan = $event->kegiatan;
        $kegiatan->load(['kak.pengusul']);
        $kak = $kegiatan->kak;
        $pengusul = $kak->pengusul;

        if ($pengusul && $pengusul->email) {
            $data = [
                'recipient_name' => $pengusul->nama_lengkap,
                'nama_kegiatan' => $kak->nama_kegiatan,
                'jumlah' => $event->jumlah,
                'action_link' => config('app.url')."/kegiatan/{$kegiatan->kegiatan_id}",
            ];

            Mail::to($pengusul->email)->send(new FundsReleasedMail($data));
        }
    }
}

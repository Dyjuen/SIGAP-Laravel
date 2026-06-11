<?php

namespace App\Console\Commands;

use App\Mail\WorkflowReminderMail;
use App\Models\KAK;
use App\Models\KegiatanApproval;
use App\Models\Notifikasi;
use App\Models\Role;
use App\Models\User;
use App\Services\FcmService;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class CheckWorkflowReminders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:check-workflow-reminders';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check for stale workflows and LPJ deadlines to send reminders.';

    // FcmService is resolved dynamically to prevent command scanner boot errors when Firebase is not configured.

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Checking for workflow reminders...');

        $this->checkKakBottlenecks();
        $this->checkKegiatanBottlenecks();
        $this->checkLpjDeadlines();

        $this->info('Reminders check completed.');
    }

    private function checkKakBottlenecks()
    {
        $staleKaks = KAK::where('status_id', 2) // Review Verifikator
            ->where('updated_at', '<', Carbon::now()->subDays(3))
            ->get();

        foreach ($staleKaks as $kak) {
            $verifUsername = 'verifikator'.$kak->tipe_kegiatan_id;
            $verifikator = User::where('username', $verifUsername)->first();

            if ($verifikator) {
                $this->notify(
                    $verifikator,
                    "KAK '{$kak->nama_kegiatan}' telah menunggu verifikasi selama lebih dari 3 hari.",
                    "/kak/{$kak->kak_id}",
                    'Pengingat Verifikasi KAK'
                );
            }
        }
    }

    private function checkKegiatanBottlenecks()
    {
        // Stale approvals (PPK, WD2, Bendahara-Cair, Bendahara-LPJ review, Bendahara-Setor)
        $staleApprovals = KegiatanApproval::where('status', 'Aktif')
            ->where('updated_at', '<', Carbon::now()->subDays(3))
            ->with('kegiatan.kak')
            ->get();

        foreach ($staleApprovals as $approval) {
            $kegiatan = $approval->kegiatan;
            if (! $kegiatan) {
                continue;
            }

            $recipient = null;

            if ($approval->approval_level === 'PPK') {
                $recipient = User::where('role_id', Role::PPK)->first();
            } elseif ($approval->approval_level === 'Wadir2') {
                $recipient = User::where('role_id', Role::WADIR)->first();
            } elseif (str_contains($approval->approval_level, 'Bendahara')) {
                // If Bendahara-LPJ but LPJ NOT submitted yet, it's Pengusul's responsibility (handled in checkLpjDeadlines)
                // If LPJ IS submitted, then it's Bendahara's responsibility
                if ($approval->approval_level === 'Bendahara-LPJ' && ! $kegiatan->lpj_submitted_at) {
                    continue; // Skip, handled by checkLpjDeadlines
                }
                $recipient = User::where('role_id', Role::BENDAHARA)->first();
            }

            if ($recipient) {
                $this->notify(
                    $recipient,
                    "Kegiatan/LPJ '{$kegiatan->kak->nama_kegiatan}' ({$approval->approval_level}) telah menunggu tindakan Anda selama lebih dari 3 hari.",
                    $this->getLink($kegiatan, $approval),
                    'Pengingat Persetujuan'
                );
            }
        }
    }

    private function checkLpjDeadlines()
    {
        $staleLpjs = KegiatanApproval::where('approval_level', 'Bendahara-LPJ')
            ->where('status', 'Aktif')
            ->where('updated_at', '<', Carbon::now()->subDays(10))
            ->with('kegiatan.kak.pengusul')
            ->get();

        foreach ($staleLpjs as $approval) {
            $kegiatan = $approval->kegiatan;
            if (! $kegiatan || $kegiatan->lpj_submitted_at) {
                continue;
            }

            $pengusul = $kegiatan->kak->pengusul;

            if ($pengusul) {
                $this->notify(
                    $pengusul,
                    "Kegiatan '{$kegiatan->kak->nama_kegiatan}' hampir melewati tenggat waktu LPJ (14 hari). Silakan segera submit LPJ.",
                    '/lpj',
                    '⚠️ Peringatan Tenggat Waktu LPJ'
                );
            }
        }
    }

    private function notify(User $user, string $message, string $link, string $subject)
    {
        // 1. In-App
        Notifikasi::create([
            'penerima_user_id' => $user->user_id,
            'pesan' => $message,
            'link_tujuan' => $link,
            'is_read' => 0,
        ]);

        // 2. Email
        if ($user->email) {
            Mail::to($user->email)->send(new WorkflowReminderMail([
                'subject' => $subject,
                'title' => $subject,
                'body' => $message,
                'action_link' => config('app.url').$link,
                'action_text' => 'Lihat Sekarang',
            ]));
        }

        // 3. Push Notification
        app(FcmService::class)->sendToUser(
            $user->user_id,
            $subject,
            $message,
            ['click_action' => 'FLUTTER_NOTIFICATION_CLICK', 'link_tujuan' => $link]
        );
    }

    private function getLink($kegiatan, $approval)
    {
        if (str_contains($approval->approval_level, 'Bendahara-LPJ')) {
            return "/lpj/review/{$kegiatan->kegiatan_id}";
        }

        return "/kegiatan/{$kegiatan->kegiatan_id}";
    }
}

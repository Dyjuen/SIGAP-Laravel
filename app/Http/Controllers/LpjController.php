<?php

namespace App\Http\Controllers;

use App\Http\Requests\ApproveLpjRequest;
use App\Http\Requests\CompleteLpjRequest;
use App\Http\Requests\ResubmitLpjRequest;
use App\Http\Requests\ReviseLpjRequest;
use App\Http\Requests\SubmitLpjRequest;
use App\Mail\LPJWorkflowMail;
use App\Models\KAKAnggaran;
use App\Models\Kegiatan;
use App\Models\KegiatanApproval;
use App\Models\KegiatanLampiran;
use App\Models\KegiatanLogStatus;
use App\Models\Satuan;
use App\Models\SpkConfig;
use App\Models\User;
use App\Services\LpjService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;


class LpjController extends Controller
{
    protected LpjService $lpjService;

    public function __construct(LpjService $lpjService)
    {
        $this->lpjService = $lpjService;
    }

    /**
     * Display the LPJ index page for Admin, Bendahara, and Pengusul.
     */
    public function index(Request $request): Response
    {
        $kegiatans = $this->lpjService->getEligibleLpjs($request->user());

        return Inertia::render('Lpj/Index', [
            'kegiatans' => $kegiatans,
        ]);
    }

    /**
     * Submit LPJ for a given kegiatan (Pengusul).
     */
    public function submit(SubmitLpjRequest $request, Kegiatan $kegiatan): RedirectResponse
    {
        Log::info('LPJ Submit Method Reached', [
            'user_id' => $request->user()->user_id,
            'kegiatan_id' => $kegiatan->kegiatan_id,
            'has_realisasi' => $request->has('realisasi'),
            'has_bukti' => ! empty($request->file('bukti')),
        ]);

        try {
            // Check authorization before invoking service to respect feature tests
            if ($kegiatan->kak->pengusul_user_id !== $request->user()->user_id) {
                abort(403, 'Anda tidak memiliki akses ke kegiatan ini.');
            }

            $spkInputs = [
                'spk_kesesuaian_waktu' => $request->spk_kesesuaian_waktu,
                'spk_kesesuaian_output' => $request->spk_kesesuaian_output,
            ];

            $this->lpjService->submit(
                $kegiatan,
                $request->realisasi ?? [],
                $request->file('bukti'),
                $spkInputs,
                $request->user()
            );

            return redirect()->route('lpj.index')->with('success', 'LPJ berhasil disubmit dan menunggu review dari Bendahara LPJ.');
        } catch (\Exception $e) {
            Log::error('LPJ Submit Failed', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return redirect()->back()->withErrors(['message' => 'Terjadi kesalahan saat submit LPJ: '.$e->getMessage()]);
        }
    }

    /**
     * Review LPJ (Bendahara or Pengusul).
     */
    public function review(Request $request, Kegiatan $kegiatan): Response
    {
        $user = $request->user();
        if (! $this->canAccessLpj($user, $kegiatan)) {
            abort(403, 'Anda tidak memiliki akses ke LPJ ini.');
        }

        $kegiatan->load(['kak.pengusul', 'kak.mataAnggaran', 'approvals']);

        $anggaran = KAKAnggaran::with(['kategoriBelanja', 'lampiran.uploader'])
            ->where('kak_id', $kegiatan->kak_id)
            ->get();

        // Resolve storage URLs for lampiran
        $lampirans = $anggaran->pluck('lampiran')->flatten()->map(function ($l) {
            if ($l->path_file_disimpan && ! str_starts_with($l->path_file_disimpan, 'http')) {
                $l->path_file_disimpan = Storage::disk('supabase')->url($l->path_file_disimpan);
            }

            return $l;
        });

        return Inertia::render('Lpj/Form', [
            'kegiatan' => $kegiatan,
            'anggaran' => $anggaran,
            'lampiran' => $lampirans,
            'satuans' => Satuan::all(),
            'spk_config' => SpkConfig::getActive(),
        ]);
    }

    /**
     * Revise LPJ (Bendahara).
     */
    public function revise(ReviseLpjRequest $request, Kegiatan $kegiatan): RedirectResponse
    {
        try {
            $this->lpjService->revise(
                $kegiatan,
                $request->anggaran_comments ?? [],
                $request->lampiran_comments ?? [],
                $request->user()
            );

            return redirect()->route('lpj.index')->with('success', 'LPJ telah dikembalikan untuk revisi.');
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['message' => $e->getMessage()]);
        }
    }

    /**
     * Resubmit LPJ (Pengusul).
     */
    public function resubmit(ResubmitLpjRequest $request, Kegiatan $kegiatan): RedirectResponse
    {
        Log::info('LPJ Resubmit Method Reached', [
            'user_id' => $request->user()->user_id,
            'kegiatan_id' => $kegiatan->kegiatan_id,
        ]);

        try {
            // Check authorization before invoking service to respect feature tests
            if ($kegiatan->kak->pengusul_user_id !== $request->user()->user_id) {
                abort(403, 'Anda tidak memiliki akses ke kegiatan ini.');
            }

            $spkInputs = [
                'spk_kesesuaian_waktu' => $request->spk_kesesuaian_waktu,
                'spk_kesesuaian_output' => $request->spk_kesesuaian_output,
            ];

            $this->lpjService->resubmit(
                $kegiatan,
                $request->realisasi,
                $request->file('bukti'),
                $request->files_to_delete,
                $spkInputs,
                $request->user()
            );

            return redirect()->route('lpj.index')->with('success', 'LPJ berhasil disubmit ulang dan menunggu review dari Bendahara.');
        } catch (\Exception $e) {
            Log::error('LPJ Resubmit Failed', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return redirect()->back()->withErrors(['message' => 'Terjadi kesalahan saat submit ulang LPJ: '.$e->getMessage()]);
        }
    }

    /**
     * Approve LPJ (Bendahara).
     */
    public function approve(ApproveLpjRequest $request, Kegiatan $kegiatan): RedirectResponse
    {
        try {
            $this->lpjService->approve($kegiatan, $request->user());

            return redirect()->route('lpj.index')->with('success', 'LPJ berhasil disetujui.');
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['message' => $e->getMessage()]);
        }
    }

    /**
     * Complete LPJ (Bendahara).
     */
    public function complete(CompleteLpjRequest $request, Kegiatan $kegiatan): RedirectResponse
    {
        try {
            $this->lpjService->complete($kegiatan, $request->user());

            return redirect()->route('lpj.index')->with('success', 'LPJ telah ditandai selesai.');
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['message' => $e->getMessage()]);
        }
    }



    private function canAccessLpj($user, Kegiatan $kegiatan): bool
    {
        $role = $user->getRoleName();
        if (in_array($role, ['Bendahara', 'Admin'])) {
            return true;
        }

        return $kegiatan->kak && $kegiatan->kak->pengusul_user_id === $user->user_id;
    }
}


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
        $user = $request->user();
        $role = $user->getRoleName();

        if (! in_array($role, ['Admin', 'Bendahara', 'Pengusul'])) {
            abort(403, 'Anda tidak memiliki akses ke halaman ini.');
        }

        $query = Kegiatan::with([
            'kak.pengusul',
            'kak.mataAnggaran',
            'kak.tipeKegiatan',
            'kak.status',
            'approvals',
        ])->whereHas('kak', function ($q) {
            $q->where('status_id', '>=', 10)->where('status_id', '!=', 14);
        });

        if ($role === 'Pengusul') {
            $query->whereHas('kak', function ($q) use ($user) {
                $q->where('pengusul_user_id', $user->user_id);
            });
        }

        $kegiatans = $query->get();

        // For accurate total_anggaran, we need to load the sum of anggaran
        $kegiatans->load(['kak' => fn ($q) => $q->withSum('anggaran', 'jumlah_diusulkan')]);

        $kegiatans = $kegiatans->map(function (Kegiatan $kegiatan) {
            $totalAnggaran = (float) ($kegiatan->kak?->anggaran_sum_jumlah_diusulkan ?? 0);

            // Re-use logic from Pencairan to get total dicairkan and calculate sisa dana
            $totalDicairkan = $kegiatan->pencairanDana()->sum('jumlah_dicairkan');

            return [
                'kegiatan_id' => $kegiatan->kegiatan_id,
                'kak_id' => $kegiatan->kak_id,
                'nama_kegiatan' => $kegiatan->kak?->nama_kegiatan ?? '-',
                'status_id' => $kegiatan->kak?->status_id,
                'status_nama' => $kegiatan->kak?->status?->nama_status ?? '-',
                'total_anggaran_diusulkan' => $totalAnggaran,
                'dana_dicairkan' => $totalDicairkan,
                'sisa_dana' => $totalAnggaran - $totalDicairkan,
            ];
        });

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

    // ============ API Methods (for mobile) ============

    /**
     * Get list of LPJ items eligible for the current user
     * GET /api/lpj
     */
    public function indexApi(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            $role = $user->getRoleName();

            // Build query based on role
            $query = Kegiatan::with([
                'kak.pengusul',
                'kak.mataAnggaran',
                'kak.tipeKegiatan',
                'kak.status',
                'approvals',
            ])->whereHas('kak', function ($q) {
                // Only show kegiatan with status >= 10 (Approved KAK) and not rejected
                $q->where('status_id', '>=', 10)->where('status_id', '!=', 14);
            });

            // Filter by role
            if ($role === 'Pengusul') {
                $query->whereHas('kak', function ($q) use ($user) {
                    $q->where('pengusul_user_id', $user->user_id);
                });
            } elseif ($role === 'Bendahara') {
                // Bendahara sees all submitted LPJ
            } elseif ($role !== 'Admin') {
                return response()->json([
                    'success' => false,
                    'message' => 'Anda tidak memiliki akses ke LPJ.',
                ], 403);
            }

            $kegiatans = $query->get();
            $kegiatans->load(['kak' => fn ($q) => $q->withSum('anggaran', 'jumlah_diusulkan')]);

            $data = $kegiatans->map(function (Kegiatan $kegiatan) {
                $totalAnggaran = (float) ($kegiatan->kak?->anggaran_sum_jumlah_diusulkan ?? 0);
                $totalDicairkan = $kegiatan->pencairanDana()->sum('jumlah_dicairkan');

                return [
                    'kegiatan_id' => $kegiatan->kegiatan_id,
                    'kak_id' => $kegiatan->kak_id,
                    'nama_kegiatan' => $kegiatan->kak?->nama_kegiatan ?? '-',
                    'status_id' => $kegiatan->kak?->status_id,
                    'status_nama' => $kegiatan->kak?->status?->nama_status ?? '-',
                    'total_anggaran_diusulkan' => $totalAnggaran,
                    'dana_dicairkan' => $totalDicairkan,
                    'sisa_dana' => $totalAnggaran - $totalDicairkan,
                    'lpj_submitted_at' => $kegiatan->lpj_submitted_at,
                    'lpj_status' => $this->getLpjStatus($kegiatan),
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $data,
                'message' => 'Data LPJ berhasil diambil.',
            ]);
        } catch (\Exception $e) {
            Log::error('LPJ Index Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data LPJ.',
            ], 500);
        }
    }

    /**
     * Get LPJ detail for a specific kegiatan
     * GET /api/lpj/{kegiatan}
     */
    public function showApi(Kegiatan $kegiatan): JsonResponse
    {
        try {
            $user = auth()->user();

            // Authorization
            if ($user->getRoleName() === 'Pengusul' && $kegiatan->kak->pengusul_user_id !== $user->user_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized',
                ], 403);
            }

            $kegiatan->load([
                'kak.pengusul',
                'kak.anggaran',
                'kak.mataAnggaran',
                'approvals',
            ]);

            $data = [
                'kegiatan_id' => $kegiatan->kegiatan_id,
                'kak_id' => $kegiatan->kak_id,
                'nama_kegiatan' => $kegiatan->kak?->nama_kegiatan ?? '-',
                'lpj_status' => $this->getLpjStatus($kegiatan),
                'lpj_submitted_at' => $kegiatan->lpj_submitted_at,
                'lpj_approved_at' => $kegiatan->lpj_approved_at ?? null,
                'lpj_completed_at' => $kegiatan->lpj_completed_at ?? null,
                'pengusul' => $kegiatan->kak?->pengusul ? [
                    'user_id' => $kegiatan->kak->pengusul->user_id,
                    'nama_lengkap' => $kegiatan->kak->pengusul->nama_lengkap,
                ] : null,
                'anggaran_items' => $kegiatan->kak?->anggaran->map(function ($item) {
                    return [
                        'anggaran_id' => $item->anggaran_id,
                        'kak_id' => $item->kak_id,
                        'mata_anggaran_nama' => $item->mataAnggaran?->nama_mata_anggaran ?? '-',
                        'uraian_kegiatan' => $item->uraian_kegiatan,
                        'volume' => $item->volume,
                        'satuan_id' => $item->satuan_id,
                        'harga_satuan' => (float) $item->harga_satuan,
                        'jumlah_diusulkan' => (float) $item->jumlah_diusulkan,
                        // Realization fields
                        'realisasi_volume1' => $item->realisasi_volume1,
                        'realisasi_satuan1_id' => $item->realisasi_satuan1_id,
                        'realisasi_volume2' => $item->realisasi_volume2,
                        'realisasi_satuan2_id' => $item->realisasi_satuan2_id,
                        'realisasi_volume3' => $item->realisasi_volume3,
                        'realisasi_satuan3_id' => $item->realisasi_satuan3_id,
                        'realisasi_harga_satuan' => (float) $item->realisasi_harga_satuan,
                        'realisasi_jumlah' => (float) $item->realisasi_jumlah,
                    ];
                })->toArray() ?? [],
                'approval_status' => $kegiatan->approvals->where('approval_level', 'Bendahara-LPJ')->first()?->status ?? 'Pending',
                'approval_notes' => $kegiatan->approvals->where('approval_level', 'Bendahara-LPJ')->first()?->catatan ?? null,
            ];

            return response()->json([
                'success' => true,
                'data' => $data,
                'message' => 'Detail LPJ berhasil diambil.',
            ]);
        } catch (\Exception $e) {
            Log::error('LPJ Show Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil detail LPJ.',
            ], 500);
        }
    }

    /**
     * Submit LPJ (Pengusul) - API version
     * POST /api/kegiatan/{kegiatan}/lpj/submit
     */
    public function submitApi(Request $request, Kegiatan $kegiatan): JsonResponse
    {
        try {
            // Validate user is the pengusul
            if ($kegiatan->kak->pengusul_user_id !== $request->user()->user_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Anda tidak memiliki akses untuk submit LPJ.',
                ], 403);
            }

            // Validate request
            $validated = $request->validate([
                'realisasi' => 'required|array',
                'realisasi.*.anggaran_id' => 'required|integer',
                'realisasi.*.volume1' => 'nullable|numeric|min:0',
                'realisasi.*.satuan1_id' => 'nullable|integer',
                'realisasi.*.volume2' => 'nullable|numeric|min:0',
                'realisasi.*.satuan2_id' => 'nullable|integer',
                'realisasi.*.volume3' => 'nullable|numeric|min:0',
                'realisasi.*.satuan3_id' => 'nullable|integer',
                'realisasi.*.harga_satuan' => 'nullable|numeric|min:0',
                'bukti_files' => 'nullable|array',
                'bukti_files.*' => 'file|max:10240|mimes:jpg,jpeg,png,pdf',
            ]);

            // Convert realisasi array to keyed array
            $realizasiData = [];
            foreach ($validated['realisasi'] ?? [] as $item) {
                $realizasiData[$item['anggaran_id']] = [
                    'volume1' => $item['volume1'] ?? '',
                    'satuan1_id' => $item['satuan1_id'] ?? '',
                    'volume2' => $item['volume2'] ?? '',
                    'satuan2_id' => $item['satuan2_id'] ?? '',
                    'volume3' => $item['volume3'] ?? '',
                    'satuan3_id' => $item['satuan3_id'] ?? '',
                    'harga_satuan' => $item['harga_satuan'] ?? '',
                ];
            }

            // Process file uploads
            $buktiFiles = [];
            if ($request->hasFile('bukti_files')) {
                foreach ($request->file('bukti_files') as $file) {
                    $buktiFiles[] = $file;
                }
            }

            // Submit LPJ
            $this->lpjService->submit(
                $kegiatan,
                $realizasiData,
                !empty($buktiFiles) ? $buktiFiles : null,
                [], // SPK inputs
                $request->user()
            );

            return response()->json([
                'success' => true,
                'message' => 'LPJ berhasil disubmit. Tunggu approval dari Bendahara.',
            ], 201);
        } catch (\Exception $e) {
            Log::error('LPJ Submit Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal submit LPJ: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Approve LPJ (Bendahara) - API version
     * POST /api/kegiatan/{kegiatan}/lpj/approve
     */
    public function approveApi(Request $request, Kegiatan $kegiatan): JsonResponse
    {
        try {
            // Authorize: only Bendahara
            if ($request->user()->getRoleName() !== 'Bendahara' && $request->user()->getRoleName() !== 'Admin') {
                return response()->json([
                    'success' => false,
                    'message' => 'Hanya Bendahara yang dapat approve LPJ.',
                ], 403);
            }

            $this->lpjService->approve($kegiatan, $request->user());

            return response()->json([
                'success' => true,
                'message' => 'LPJ berhasil disetujui.',
            ]);
        } catch (\Exception $e) {
            Log::error('LPJ Approve Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal approve LPJ: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Request revision for LPJ (Bendahara) - API version
     * POST /api/kegiatan/{kegiatan}/lpj/revise
     */
    public function reviseApi(Request $request, Kegiatan $kegiatan): JsonResponse
    {
        try {
            // Authorize: only Bendahara
            if ($request->user()->getRoleName() !== 'Bendahara' && $request->user()->getRoleName() !== 'Admin') {
                return response()->json([
                    'success' => false,
                    'message' => 'Hanya Bendahara yang dapat request revisi LPJ.',
                ], 403);
            }

            $validated = $request->validate([
                'catatan' => 'required|string|min:10',
            ]);

            $this->lpjService->revise(
                $kegiatan,
                $validated['catatan'],
                $request->user()
            );

            return response()->json([
                'success' => true,
                'message' => 'Permintaan revisi LPJ berhasil dikirim ke Pengusul.',
            ]);
        } catch (\Exception $e) {
            Log::error('LPJ Revise Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal request revisi: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Resubmit LPJ after revision (Pengusul) - API version
     * POST /api/kegiatan/{kegiatan}/lpj/resubmit
     */
    public function resubmitApi(Request $request, Kegiatan $kegiatan): JsonResponse
    {
        try {
            // Validate user is the pengusul
            if ($kegiatan->kak->pengusul_user_id !== $request->user()->user_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Anda tidak memiliki akses untuk resubmit LPJ.',
                ], 403);
            }

            $validated = $request->validate([
                'realisasi' => 'required|array',
                'realisasi.*.anggaran_id' => 'required|integer',
                'realisasi.*.volume1' => 'nullable|numeric|min:0',
                'realisasi.*.satuan1_id' => 'nullable|integer',
                'realisasi.*.volume2' => 'nullable|numeric|min:0',
                'realisasi.*.satuan2_id' => 'nullable|integer',
                'realisasi.*.volume3' => 'nullable|numeric|min:0',
                'realisasi.*.satuan3_id' => 'nullable|integer',
                'realisasi.*.harga_satuan' => 'nullable|numeric|min:0',
                'bukti_files' => 'nullable|array',
                'bukti_files.*' => 'file|max:10240|mimes:jpg,jpeg,png,pdf',
            ]);

            // Convert realisasi array
            $realizasiData = [];
            foreach ($validated['realisasi'] ?? [] as $item) {
                $realizasiData[$item['anggaran_id']] = [
                    'volume1' => $item['volume1'] ?? '',
                    'satuan1_id' => $item['satuan1_id'] ?? '',
                    'volume2' => $item['volume2'] ?? '',
                    'satuan2_id' => $item['satuan2_id'] ?? '',
                    'volume3' => $item['volume3'] ?? '',
                    'satuan3_id' => $item['satuan3_id'] ?? '',
                    'harga_satuan' => $item['harga_satuan'] ?? '',
                ];
            }

            $buktiFiles = [];
            if ($request->hasFile('bukti_files')) {
                foreach ($request->file('bukti_files') as $file) {
                    $buktiFiles[] = $file;
                }
            }

            $this->lpjService->resubmit(
                $kegiatan,
                $realizasiData,
                !empty($buktiFiles) ? $buktiFiles : null,
                [], // Files to delete
                [],
                $request->user()
            );

            return response()->json([
                'success' => true,
                'message' => 'LPJ berhasil diresubmit untuk review ulang.',
            ]);
        } catch (\Exception $e) {
            Log::error('LPJ Resubmit Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal resubmit LPJ: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Complete LPJ (Bendahara) - API version
     * POST /api/kegiatan/{kegiatan}/lpj/complete
     */
    public function completeApi(Request $request, Kegiatan $kegiatan): JsonResponse
    {
        try {
            // Authorize: only Bendahara
            if ($request->user()->getRoleName() !== 'Bendahara' && $request->user()->getRoleName() !== 'Admin') {
                return response()->json([
                    'success' => false,
                    'message' => 'Hanya Bendahara yang dapat complete LPJ.',
                ], 403);
            }

            $this->lpjService->complete($kegiatan, $request->user());

            return response()->json([
                'success' => true,
                'message' => 'LPJ berhasil diselesaikan.',
            ]);
        } catch (\Exception $e) {
            Log::error('LPJ Complete Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal complete LPJ: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Helper: Get LPJ status based on timestamps
     */
    private function getLpjStatus(Kegiatan $kegiatan): string
    {
        if ($kegiatan->lpj_completed_at) {
            return 'Completed';
        }
        if ($kegiatan->lpj_approved_at) {
            return 'Approved';
        }
        if ($kegiatan->lpj_submitted_at) {
            // Check if revision is requested
            $approval = $kegiatan->approvals->where('approval_level', 'Bendahara-LPJ')->first();
            if ($approval && $approval->status === 'Revisi') {
                return 'Revision Requested';
            }
            return 'Submitted';
        }
        return 'Draft';
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


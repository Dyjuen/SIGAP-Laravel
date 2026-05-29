<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Exceptions\KegiatanException;
use App\Http\Requests\ApproveKegiatanRequest;
use App\Http\Requests\StoreKegiatanRequest;
use App\Models\KAK;
use App\Models\Kegiatan;
use App\Services\KegiatanService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class KegiatanApiController extends Controller
{
    public function __construct(protected KegiatanService $kegiatanService) {}

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $role = $user->getRoleName();

        $approvedKaks    = [];
        $pendingKegiatan = [];

        if ($role === 'Pengusul') {
            $approvedKaks = KAK::with(['tipeKegiatan', 'mataAnggaran', 'ikus.iku'])
                ->where('status_id', 3)
                ->where('pengusul_user_id', $user->user_id)
                ->whereDoesntHave('kegiatan')
                ->get();
        } elseif ($role === 'PPK' || $role === 'Wadir') {
            $approvalLevel = $role === 'Wadir' ? 'Wadir2' : 'PPK';

            $pendingKegiatan = Kegiatan::with([
                'kak.tipeKegiatan',
                'kak.mataAnggaran',
                'kak.pengusul',
                'activeApproval',
            ])
                ->whereHas('activeApproval', function ($query) use ($approvalLevel) {
                    $query->where('approval_level', $approvalLevel)
                        ->where('status', 'Aktif');
                })
                ->get();

            if ($approvalLevel === 'Wadir2') {
                $pendingKegiatan->load([
                    'approvals' => function ($query) {
                        $query->where('approval_level', 'PPK')
                            ->where('status', 'Disetujui')
                            ->latest();
                    },
                ]);
            }
        }

        return response()->json([
            'approvedKaks'    => $approvedKaks,
            'pendingKegiatan' => $pendingKegiatan,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreKegiatanRequest $request)
    {
        $kak = KAK::findOrFail($request->kak_id);

        try {
            $kegiatan = $this->kegiatanService->store(
                $kak,
                $request->validated(),
                $request->file('surat_pengantar'),
                $request->user(),
            );

            return response()->json([
                'message' => 'Kegiatan berhasil diajukan.',
                'kegiatan' => $kegiatan,
            ], 201);
        } catch (KegiatanException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Terjadi kesalahan saat menyimpan data: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Kegiatan $kegiatan)
    {
        $kegiatan->load([
            'kak.pengusul',
            'kak.mataAnggaran',
            'kak.tipeKegiatan',
            'kak.ikus.iku',
            'kak.anggaran.kategoriBelanja',
            'kak.anggaran.satuan1',
            'kak.anggaran.satuan2',
            'kak.anggaran.satuan3',
            'approvals.approver',
            'logs.actor',
            'logs.newStatus',
        ]);

        if ($kegiatan->surat_pengantar_path && ! str_starts_with($kegiatan->surat_pengantar_path, 'http')) {
            $kegiatan->surat_pengantar_url = Storage::disk('supabase')->url($kegiatan->surat_pengantar_path);
        }

        return response()->json([
            'kegiatan' => $kegiatan,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(StoreKegiatanRequest $request, Kegiatan $kegiatan)
    {
        // Sanitize for XSS prevention
        $namaKegiatan      = strip_tags($request->nama_kegiatan);
        $deskripsiKegiatan = strip_tags($request->deskripsi_kegiatan);

        $kegiatan->kak->update([
            'nama_kegiatan'      => $namaKegiatan,
            'deskripsi_kegiatan' => $deskripsiKegiatan,
            'tanggal_mulai'      => $request->tanggal_mulai,
            'tanggal_selesai'    => $request->tanggal_selesai,
            'lokasi'             => $request->lokasi,
            'mata_anggaran_id'   => $request->mata_anggaran_id,
        ]);

        if ($request->has('penanggung_jawab_manual')) {
            $kegiatan->update(['penanggung_jawab_manual' => $request->penanggung_jawab_manual]);
        }

        if ($request->has('pelaksana_manual')) {
            $kegiatan->update(['pelaksana_manual' => $request->pelaksana_manual]);
        }

        return response()->json([
            'message' => 'Kegiatan berhasil diperbarui.',
            'kegiatan' => $kegiatan->fresh(['kak']),
        ]);
    }

    /**
     * Approve the specified kegiatan.
     */
    public function approve(ApproveKegiatanRequest $request, Kegiatan $kegiatan)
    {
        $user = $request->user();
        $role = $user->getRoleName();

        try {
            $this->kegiatanService->approve($kegiatan, $role, $request->catatan, $user);
            return response()->json([
                'message' => 'Kegiatan berhasil disetujui.',
            ]);
        } catch (KegiatanException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    /**
     * Display the monitoring kegiatan page.
     */
    public function monitoring(Request $request)
    {
        $user = $request->user();
        $role = $user->getRoleName();

        $query = Kegiatan::with(['kak.tipeKegiatan', 'approvals']);

        if ($role === 'Pengusul') {
            $query->whereHas('kak', function ($q) use ($user) {
                $q->where('pengusul_user_id', $user->user_id);
            });
        } elseif ($role === 'Verifikator') {
            preg_match('/verifikator(\d+)/i', $user->username, $matches);
            if (isset($matches[1])) {
                $tipeKegiatanId = $matches[1];
                $query->whereHas('kak', function ($q) use ($tipeKegiatanId) {
                    $q->where('tipe_kegiatan_id', $tipeKegiatanId);
                });
            }
        }

        if ($request->has('search') && $request->search) {
            $searchTerm = $request->search;
            $query->whereHas('kak', function ($q) use ($searchTerm) {
                $q->where('nama_kegiatan', 'like', '%' . $searchTerm . '%');
            });
        }

        $kegiatans = $query->latest('kegiatan_id')->paginate(10)->withQueryString();

        $approvalStepMapping = [
            'PPK'             => ['step' => 1, 'dateKey' => 'accPPK'],
            'Wadir2'          => ['step' => 2, 'dateKey' => 'accWD2'],
            'Bendahara-Cair'  => ['step' => 3, 'dateKey' => 'uangMuka'],
            'Bendahara-LPJ'   => ['step' => 4, 'dateKey' => 'lpj'],
            'Bendahara-Setor' => ['step' => 5, 'dateKey' => 'setorFisik'],
        ];

        $mappedKegiatans = $kegiatans->getCollection()->map(function ($kegiatan) use ($approvalStepMapping) {
            $dates = ['accPPK' => null, 'accWD2' => null, 'uangMuka' => null, 'lpj' => null, 'setorFisik' => null];
            $approvedSteps = [];
            $currentStatus = 1;

            foreach ($kegiatan->approvals as $approval) {
                if (
                    ($approval->status === 'Disetujui' || $approval->status === 'Bendahara-Setor')
                    && isset($approvalStepMapping[$approval->approval_level])
                ) {
                    $mapping = $approvalStepMapping[$approval->approval_level];
                    $dates[$mapping['dateKey']] = $approval->updated_at
                        ? $approval->updated_at->format('d/m/Y')
                        : null;
                    $approvedSteps[] = $mapping['step'];
                }
            }

            $maxApprovedStep = ! empty($approvedSteps) ? max($approvedSteps) : 0;
            $activeApproval  = $kegiatan->approvals->where('status', 'Aktif')->first();

            if ($activeApproval && isset($approvalStepMapping[$activeApproval->approval_level])) {
                $currentStatus = $approvalStepMapping[$activeApproval->approval_level]['step'];
            } else {
                $currentStatus = $maxApprovedStep === 5 ? 6 : $maxApprovedStep + 1;
            }

            return [
                'kak_id'       => $kegiatan->kak_id,
                'kegiatan_id'  => $kegiatan->kegiatan_id,
                'nama_kegiatan' => $kegiatan->kak ? $kegiatan->kak->nama_kegiatan : '-',
                'status'       => $currentStatus,
                'dates'        => $dates,
                'overdueDays'  => 0,
            ];
        });

        $kegiatans->setCollection($mappedKegiatans);

        // Stats
        $statsQuery = Kegiatan::query();
        if ($role === 'Pengusul') {
            $statsQuery->whereHas('kak', function ($q) use ($user) {
                $q->where('pengusul_user_id', $user->user_id);
            });
        } elseif ($role === 'Verifikator') {
            preg_match('/verifikator(\d+)/i', $user->username, $matches);
            if (isset($matches[1])) {
                $tipeKegiatanId = $matches[1];
                $statsQuery->whereHas('kak', function ($q) use ($tipeKegiatanId) {
                    $q->where('tipe_kegiatan_id', $tipeKegiatanId);
                });
            }
        }

        $monitoringStats = [
            'total'     => $statsQuery->count(),
            'running'   => (clone $statsQuery)->whereHas('kak', function ($q) {
                $q->whereNotIn('status_id', [5, 10]);
            })->whereHas('approvals', function ($q) {
                $q->where('approval_level', 'Bendahara-Setor')->where('status', '!=', 'Disetujui');
            })->count(),
            'completed' => (clone $statsQuery)->whereHas('approvals', function ($q) {
                $q->where('approval_level', 'Bendahara-Setor')->where('status', 'Disetujui');
            })->count(),
        ];

        return response()->json([
            'data' => $kegiatans,
            'stats' => $monitoringStats,
        ]);
    }
}

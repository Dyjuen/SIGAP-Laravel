<?php

namespace App\Http\Controllers\Api;

use App\Exceptions\KegiatanException;
use App\Http\Controllers\Controller;
use App\Http\Requests\ApproveKegiatanRequest;
use App\Http\Requests\StoreKegiatanRequest;
use App\Models\KAK;
use App\Models\Kegiatan;
use App\Services\KegiatanMonitoringService;
use App\Services\KegiatanService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

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

        $approvedKaks = [];
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
            'approvedKaks' => $approvedKaks,
            'pendingKegiatan' => $pendingKegiatan,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreKegiatanRequest $request)
    {
        $kak = KAK::findOrFail($request->kak_id);

        // Diagnostic logging: record request headers and uploaded file metadata
        try {
            Log::info('Kegiatan upload headers', $request->headers->all());
            $uploaded = $request->file('surat_pengantar');
            if ($uploaded) {
                Log::info('Kegiatan upload file info', [
                    'originalName' => $uploaded->getClientOriginalName(),
                    'clientMime' => $uploaded->getClientMimeType(),
                    'phpMime' => $uploaded->getMimeType(),
                    'size' => $uploaded->getSize(),
                    'path' => $uploaded->getRealPath(),
                ]);
            } else {
                Log::info('Kegiatan upload file info', ['file' => 'none']);
            }
        } catch (\Throwable $e) {
            Log::error('Failed to log kegiatan upload diagnostic: ' . $e->getMessage());
        }

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
            return response()->json(['message' => 'Terjadi kesalahan saat menyimpan data: '.$e->getMessage()], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, Kegiatan $kegiatan)
    {
        $user = $request->user();
        if ($user->role_id === 3 && $kegiatan->kak->pengusul_user_id !== $user->user_id) {
            return response()->json(['message' => 'Akses ditolak.'], 403);
        }

        $kegiatan->load([
            'kak.pengusul',
            'kak.mataAnggaran',
            'kak.tipeKegiatan',
            'kak.ikus.iku',
            'kak.manfaat',
            'kak.tahapan',
            'kak.targets',
            'kak.anggaran.kategoriBelanja',
            'kak.anggaran.satuan1',
            'kak.anggaran.satuan2',
            'kak.anggaran.satuan3',
            'approvals.approver',
            'logs.actor',
            'logs.newStatus',
        ]);

        if ($kegiatan->surat_pengantar_path && ! str_starts_with($kegiatan->surat_pengantar_path, 'http')) {
            /** @var \Illuminate\Filesystem\FilesystemAdapter $supabaseDisk */
            $supabaseDisk = Storage::disk('supabase');
            $kegiatan->surat_pengantar_url = $supabaseDisk->url($kegiatan->surat_pengantar_path);
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
        $user = $request->user();
        if ($kegiatan->kak->pengusul_user_id !== $user->user_id) {
            return response()->json(['message' => 'Akses ditolak.'], 403);
        }

        // Sanitize for XSS prevention
        $namaKegiatan = strip_tags($request->nama_kegiatan);
        $deskripsiKegiatan = strip_tags($request->deskripsi_kegiatan);

        $kegiatan->kak->update([
            'nama_kegiatan' => $namaKegiatan,
            'deskripsi_kegiatan' => $deskripsiKegiatan,
            'tanggal_mulai' => $request->tanggal_mulai,
            'tanggal_selesai' => $request->tanggal_selesai,
            'lokasi' => $request->lokasi,
            'mata_anggaran_id' => $request->mata_anggaran_id,
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
    public function monitoring(Request $request, KegiatanMonitoringService $monitoringService)
    {
        $user = $request->user();
        $searchTerm = $request->search;

        $kegiatans = $monitoringService->buildMonitoringQuery($user, $searchTerm)
            ->latest('kegiatan_id')
            ->paginate(10)
            ->withQueryString();

        $mappedKegiatans = $kegiatans->getCollection()->map(function ($kegiatan) use ($monitoringService) {
            return $monitoringService->mapMonitoringItem($kegiatan);
        });

        $kegiatans->setCollection($mappedKegiatans);

        $monitoringStats = $monitoringService->getStats($user);

        return response()->json([
            'data' => $kegiatans,
            'stats' => $monitoringStats,
        ]);
    }
}

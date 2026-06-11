<?php

namespace App\Http\Controllers\Api;

use App\Exceptions\KakWorkflowException;
use App\Http\Controllers\Controller;
use App\Http\Requests\KakWorkflow\ApproveKakRequest;
use App\Http\Requests\KakWorkflow\RejectKakRequest;
use App\Http\Requests\KakWorkflow\ReviseKakRequest;
use App\Http\Requests\StoreKakRequest;
use App\Http\Requests\UpdateKakRequest;
use App\Models\KAK;
use App\Models\User;
use App\Services\KakService;
use App\Services\KakWorkflowService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Laravel\Sanctum\PersonalAccessToken;

class KakApiController extends Controller
{
    protected KakWorkflowService $kakWorkflowService;

    protected KakService $kakService;

    public function __construct(KakWorkflowService $kakWorkflowService, KakService $kakService)
    {
        $this->kakWorkflowService = $kakWorkflowService;
        $this->kakService = $kakService;
    }

    /**
     * List KAKs for the current user (role-aware).
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $query = KAK::with(['status', 'tipeKegiatan']);

        if (! in_array($user->role_id, [1, 2, 3])) {
            return response()->json(['message' => 'Akses ditolak.'], 403);
        }

        $query = $this->kakService->applyListFilters($query, $user);

        if ($request->filled('search')) {
            $query->where('nama_kegiatan', 'ilike', '%'.$request->search.'%');
        }

        if ($request->filled('status_id')) {
            $query->where('status_id', $request->status_id);
        }

        $kaks = $query->orderBy('updated_at', 'desc')->paginate(20)->through(fn ($kak) => [
            'kak_id' => $kak->kak_id,
            'nama_kegiatan' => $kak->nama_kegiatan,
            'status_id' => $kak->status_id,
            'status_nama' => $kak->status?->nama_status ?? 'Draft',
            'tipe' => $kak->tipeKegiatan?->nama_tipe,
            'updated_at' => $kak->updated_at?->format('d M Y'),
            'tanggal_mulai' => $kak->tanggal_mulai?->format('d M Y'),
            'tanggal_selesai' => $kak->tanggal_selesai?->format('d M Y'),
        ]);

        return response()->json($kaks);
    }

    /**
     * Get Pengusul's dashboard stats (real data per their user_id).
     */
    public function dashboardStats(Request $request)
    {
        $user = $request->user();

        if ($user->role_id === 3) {
            $uid = $user->user_id;

            return response()->json([
                'total_kak' => KAK::where('pengusul_user_id', $uid)->where('status_id', '<=', 5)->count(),
                'draft_kak' => KAK::where('pengusul_user_id', $uid)->where('status_id', 1)->count(),
                'review_kak' => KAK::where('pengusul_user_id', $uid)->where('status_id', 2)->count(),
                'approved_kak' => KAK::where('pengusul_user_id', $uid)->where('status_id', 3)->count(),
                'rejected_kak' => KAK::where('pengusul_user_id', $uid)->whereIn('status_id', [4, 5])->count(),
            ]);
        }

        return response()->json(['message' => 'Akses ditolak.'], 403);
    }

    /**
     * Get recent KAKs for Pengusul dashboard.
     */
    public function recentKaks(Request $request)
    {
        $user = $request->user();

        if ($user->role_id !== 3) {
            return response()->json(['message' => 'Akses ditolak.'], 403);
        }

        $query = KAK::with(['status', 'tipeKegiatan']);
        $query = $this->kakService->applyListFilters($query, $user);

        $kaks = $query->orderBy('updated_at', 'desc')
            ->limit(5)
            ->get()
            ->map(fn ($kak) => [
                'kak_id' => $kak->kak_id,
                'nama_kegiatan' => $kak->nama_kegiatan,
                'status_id' => $kak->status_id,
                'status_nama' => $kak->status?->nama_status ?? 'Draft',
                'tipe' => $kak->tipeKegiatan?->nama_tipe,
                'updated_at' => $kak->updated_at?->format('d M Y'),
            ]);

        return response()->json($kaks);
    }

    /**
     * Show a single KAK detail.
     */
    public function show(Request $request, $id)
    {
        $user = $request->user();
        $kak = KAK::with([
            'status', 'tipeKegiatan', 'pengusul', 'mataAnggaran',
            'manfaat', 'tahapan', 'targets',
            'ikus.iku', 'ikus.satuan',
            'anggaran.kategoriBelanja', 'anggaran.satuan1', 'anggaran.satuan2', 'anggaran.satuan3',
            'approvals.approver',
        ])->findOrFail($id);

        // Pengusul can only see own KAKs
        if ($user->role_id === 3 && $kak->pengusul_user_id !== $user->user_id) {
            return response()->json(['message' => 'Akses ditolak.'], 403);
        }

        return response()->json([
            'kak_id' => $kak->kak_id,
            'nama_kegiatan' => $kak->nama_kegiatan,
            'deskripsi_kegiatan' => $kak->deskripsi_kegiatan,
            'metode_pelaksanaan' => $kak->metode_pelaksanaan,
            'tanggal_mulai' => $kak->tanggal_mulai?->format('Y-m-d'),
            'tanggal_selesai' => $kak->tanggal_selesai?->format('Y-m-d'),
            'lokasi' => $kak->lokasi,
            'sasaran_utama' => $kak->sasaran_utama,
            'output_kegiatan' => $kak->output_kegiatan,
            'kurun_waktu_pelaksanaan' => $kak->kurun_waktu_pelaksanaan,
            'mata_anggaran_id' => $kak->mata_anggaran_id,
            'mata_anggaran_nama' => $kak->mataAnggaran
                ? "{$kak->mataAnggaran->kode_anggaran} - {$kak->mataAnggaran->nama_sumber_dana}"
                : '-',
            'catatan_nama_kegiatan' => $kak->catatan_nama_kegiatan,
            'catatan_deskripsi_kegiatan' => $kak->catatan_deskripsi_kegiatan,
            'catatan_tipe_kegiatan' => $kak->catatan_tipe_kegiatan,
            'catatan_sasaran_utama' => $kak->catatan_sasaran_utama,
            'catatan_metode_pelaksanaan' => $kak->catatan_metode_pelaksanaan,
            'catatan_lokasi' => $kak->catatan_lokasi,
            'catatan_tanggal' => $kak->catatan_tanggal,
            'status_id' => $kak->status_id,
            'status_nama' => $kak->status?->nama_status,
            'tipe' => $kak->tipeKegiatan?->nama_tipe,
            'tipe_kegiatan_id' => $kak->tipe_kegiatan_id,
            'pengusul_nama' => $kak->pengusul?->nama_lengkap,
            'updated_at' => $kak->updated_at?->format('d M Y'),
            'manfaat' => $kak->manfaat->map(fn ($m) => [
                'manfaat_id' => $m->manfaat_id,
                'manfaat' => $m->manfaat,
                'catatan_manfaat' => $m->catatan_manfaat,
            ]),
            'tahapan' => $kak->tahapan->map(fn ($t) => [
                'tahapan_id' => $t->tahapan_id,
                'nama_tahapan' => $t->nama_tahapan,
                'urutan' => $t->urutan,
                'catatan_verifikator' => $t->catatan_verifikator,
            ])->sortBy('urutan')->values(),
            'indikator_kinerja' => $kak->targets->map(fn ($t) => [
                'target_id' => $t->target_id,
                'bulan_indikator' => $t->bulan_indikator,
                'deskripsi_target' => $t->deskripsi_target,
                'persentase_target' => $t->persentase_target,
                'catatan_verifikator' => $t->catatan_verifikator,
            ]),
            'target_iku' => $kak->ikus->map(fn ($ti) => [
                'iku_id' => $ti->iku_id,
                'kode_iku' => $ti->iku?->kode_iku,
                'nama_iku' => $ti->iku?->nama_iku,
                'target' => $ti->target,
                'satuan_id' => $ti->satuan_id,
                'nama_satuan' => $ti->satuan?->nama_satuan,
                'catatan_verifikator' => $ti->catatan_verifikator,
            ]),
            'rab' => $kak->anggaran->map(fn ($a) => [
                'anggaran_id' => $a->anggaran_id,
                'uraian' => $a->uraian,
                'kategori_belanja_id' => $a->kategori_belanja_id,
                'kategori_belanja' => [
                    'id' => $a->kategori_belanja_id,
                    'nama' => $a->kategoriBelanja?->nama_kategori_belanja ?? '-',
                ],
                'volume1' => $a->volume1,
                'satuan1_id' => $a->satuan1_id,
                'satuan1_nama' => $a->satuan1?->nama_satuan,
                'volume2' => $a->volume2,
                'satuan2_id' => $a->satuan2_id,
                'satuan2_nama' => $a->satuan2?->nama_satuan,
                'volume3' => $a->volume3,
                'satuan3_id' => $a->satuan3_id,
                'satuan3_nama' => $a->satuan3?->nama_satuan,
                'harga_satuan' => $a->harga_satuan,
                'jumlah_diusulkan' => $a->jumlah_diusulkan,
                'catatan_verifikator' => $a->catatan_verifikator,
            ]),
            'approvals' => $kak->approvals->map(fn ($a) => [
                'approver_nama' => $a->approver?->nama_lengkap,
                'status' => $a->status,
                'catatan' => $a->catatan,
                'tanggal' => $a->tanggal_telaah?->format('d M Y'),
            ]),
        ]);
    }

    /**
     * Create a new KAK (Pengusul only).
     */
    public function store(StoreKakRequest $request)
    {
        $kak = $this->kakService->create($request->validated(), $request->user());

        return response()->json([
            'message' => 'KAK berhasil dibuat.',
            'kak_id' => $kak->kak_id,
        ], 201);
    }

    /**
     * Update an existing KAK (Draft or Revisi only, Pengusul owner only).
     */
    public function update(UpdateKakRequest $request, $id)
    {
        $kak = KAK::findOrFail($id);
        $this->kakService->update($kak, $request->all());

        return response()->json(['message' => 'KAK berhasil diperbarui.']);
    }

    /**
     * Submit KAK for review (Draft/Revisi → Review).
     */
    public function submit(Request $request, $id)
    {
        $user = $request->user();
        $kak = KAK::findOrFail($id);

        if ($user->role_id !== 3 || $kak->pengusul_user_id !== $user->user_id) {
            return response()->json(['message' => 'Akses ditolak.'], 403);
        }

        try {
            $this->kakWorkflowService->submit($kak, $user);

            return response()->json(['message' => 'KAK berhasil diajukan untuk verifikasi.']);
        } catch (KakWorkflowException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    /**
     * Delete KAK (Draft or Rejected only, Pengusul owner only).
     */
    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        $kak = KAK::findOrFail($id);

        if ($user->role_id !== 3 || $kak->pengusul_user_id !== $user->user_id) {
            return response()->json(['message' => 'Akses ditolak.'], 403);
        }

        if (! in_array($kak->status_id, [1, 4])) {
            return response()->json(['message' => 'KAK hanya dapat dihapus jika berstatus Draft atau Ditolak.'], 422);
        }

        $this->kakService->delete($kak);

        return response()->json(['message' => 'KAK berhasil dihapus.']);
    }

    /**
     * Approve KAK (Verifikator only, Review → Approved).
     */
    public function approve(ApproveKakRequest $request, $id)
    {
        $user = $request->user();
        $kak = KAK::findOrFail($id);

        $this->authorizeVerifikator($kak, $user);

        try {
            $this->kakWorkflowService->approve($kak, $request->validated(), $user);

            return response()->json(['message' => 'KAK berhasil disetujui.']);
        } catch (KakWorkflowException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    /**
     * Reject KAK (Verifikator only, Review → Rejected).
     */
    public function reject(RejectKakRequest $request, $id)
    {
        $user = $request->user();
        $kak = KAK::findOrFail($id);

        $this->authorizeVerifikator($kak, $user);

        try {
            $this->kakWorkflowService->reject($kak, $request->validated('catatan'), $user);

            return response()->json(['message' => 'KAK telah ditolak.']);
        } catch (KakWorkflowException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    /**
     * Request Revision (Verifikator only, Review → Revision).
     */
    public function revise(ReviseKakRequest $request, $id)
    {
        $user = $request->user();
        $kak = KAK::findOrFail($id);

        $this->authorizeVerifikator($kak, $user);

        try {
            $this->kakWorkflowService->revise($kak, $request->validated(), $user);

            return response()->json(['message' => 'Pengusul diminta untuk merevisi KAK.']);
        } catch (KakWorkflowException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    /**
     * Resubmit Revised KAK (Revisi -> Review).
     */
    public function resubmit(Request $request, $id)
    {
        $user = $request->user();
        $kak = KAK::findOrFail($id);

        if ($user->role_id !== 3) {
            return response()->json(['message' => 'Akses ditolak.'], 403);
        }

        if ($kak->pengusul_user_id !== $user->user_id) {
            return response()->json(['message' => 'Akses ditolak.'], 403);
        }

        if ($kak->status_id !== 5) {
            return response()->json(['message' => 'Hanya KAK dalam status Revisi yang dapat diajukan kembali.'], 403);
        }

        try {
            $this->kakWorkflowService->submit($kak, $user);

            return response()->json(['message' => 'KAK berhasil diajukan kembali.']);
        } catch (KakWorkflowException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    /**
     * Authorize Verifikator check for API.
     */
    private function authorizeVerifikator(KAK $kak, User $user)
    {
        if ($user->role_id !== 2) {
            abort(403, 'Hanya Verifikator yang dapat memverifikasi KAK.');
        }

        $allowedTipeId = $user->getVerifikatorTipeId();
        if ($allowedTipeId !== null) {
            if ($kak->tipe_kegiatan_id !== $allowedTipeId) {
                abort(403, 'Anda hanya dapat memverifikasi KAK dengan Tipe Kegiatan '.$allowedTipeId);
            }
        } else {
            abort(403, 'Username verifikator tidak valid untuk pemetaan tipe kegiatan.');
        }

        if ($kak->pengusul_user_id === $user->user_id) {
            abort(403, 'Verifikator tidak dapat memverifikasi KAK sendiri.');
        }
    }

    /**
     * Helper to manually authenticate and authorize KAK access for API / url_launcher.
     */
    private function authenticateAndAuthorizeKak(Request $request, $id)
    {
        $user = auth('sanctum')->user() ?? $request->user();

        // Try token query parameter if guard was empty
        if (! $user && $request->has('token')) {
            $token = $request->query('token');
            $accessToken = PersonalAccessToken::findToken($token);
            if ($accessToken) {
                $user = $accessToken->tokenable;
                $request->setUserResolver(fn () => $user);
            }
        }

        if (! $user) {
            abort(401, 'Unauthenticated.');
        }

        $kak = KAK::findOrFail($id);

        // 1. Admin
        if ($user->role_id === 1) {
            return $kak;
        }

        // 2. Pengusul (only own KAKs)
        if ($user->role_id === 3) {
            if ($kak->pengusul_user_id !== $user->user_id) {
                abort(403, 'Akses ditolak.');
            }

            return $kak;
        }

        // 3. Verifikator (only matched tipe_kegiatan_id)
        if ($user->role_id === 2) {
            $allowedTipeId = $user->getVerifikatorTipeId();
            if ($allowedTipeId !== null && $kak->tipe_kegiatan_id === $allowedTipeId) {
                return $kak;
            }
            abort(403, 'Akses ditolak.');
        }

        // 4. PPK, Wadir, Direktur/Rektorat (read-only access permitted)
        if (in_array($user->role_id, [4, 5, 7])) {
            return $kak;
        }

        abort(403, 'Akses ditolak.');
    }

    /**
     * Generate PDF payload for frontend blob preview.
     */
    public function previewPdfBlob(Request $request, $id)
    {
        $kak = $this->authenticateAndAuthorizeKak($request, $id);

        $kak->load([
            'status', 'tipeKegiatan', 'mataAnggaran', 'pengusul',
            'manfaat', 'tahapan', 'targets',
            'ikus.iku', 'ikus.satuan',
            'anggaran.kategoriBelanja', 'anggaran.satuan1',
        ]);

        $pdf = Pdf::loadView('pdf.kak', compact('kak'))
            ->setPaper('a4', 'portrait');

        $fileName = 'KAK_'.str_replace(' ', '_', $kak->nama_kegiatan).'.pdf';

        return response()->json([
            'fileName' => $fileName,
            'mimeType' => 'application/pdf',
            'base64' => base64_encode($pdf->output()),
        ]);
    }

    /**
     * Stream inline PDF.
     */
    public function previewPdf(Request $request, $id)
    {
        $kak = $this->authenticateAndAuthorizeKak($request, $id);

        $kak->load([
            'status', 'tipeKegiatan', 'mataAnggaran', 'pengusul',
            'manfaat', 'tahapan', 'targets',
            'ikus.iku', 'ikus.satuan',
            'anggaran.kategoriBelanja', 'anggaran.satuan1',
        ]);

        $pdf = Pdf::loadView('pdf.kak', compact('kak'))
            ->setPaper('a4', 'portrait');

        $fileName = 'KAK_'.str_replace(' ', '_', $kak->nama_kegiatan).'.pdf';

        return response($pdf->output(), 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename="'.$fileName.'"',
        ]);
    }

    /**
     * Force download PDF.
     */
    public function downloadPdf(Request $request, $id)
    {
        $kak = $this->authenticateAndAuthorizeKak($request, $id);

        $kak->load([
            'status', 'tipeKegiatan', 'mataAnggaran', 'pengusul',
            'manfaat', 'tahapan', 'targets',
            'ikus.iku', 'ikus.satuan',
            'anggaran.kategoriBelanja', 'anggaran.satuan1',
        ]);

        $pdf = Pdf::loadView('pdf.kak', compact('kak'))
            ->setPaper('a4', 'portrait');

        $fileName = 'KAK_'.str_replace(' ', '_', $kak->nama_kegiatan).'.pdf';

        return response($pdf->output(), 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="'.$fileName.'"',
        ]);
    }
}

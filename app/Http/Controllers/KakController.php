<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreKakRequest;
use App\Http\Requests\UpdateKakRequest;
use App\Models\Iku;
use App\Models\KAK;
use App\Models\KAKAnggaran;
use App\Models\KAKIku;
use App\Models\KAKManfaat;
use App\Models\KAKTahapan;
use App\Models\KAKTarget;
use App\Models\KategoriBelanja;
use App\Models\MataAnggaran;
use App\Models\Satuan;
use App\Models\TipeKegiatan;
use App\Traits\AuthorizesKakAccess;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

use App\Services\KakService;

class KakController extends Controller
{
    use AuthorizesKakAccess;

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = KAK::with(['status', 'tipeKegiatan', 'mataAnggaran', 'pengusul']);

        // Filter by role access
        $this->applyAccessFilter($query);

        // Apply filters from request
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where('nama_kegiatan', 'ilike', "%{$search}%");
        }

        if ($request->filled('status_id')) {
            $query->where('status_id', $request->status_id);
        }

        $kaks = $query->orderBy('updated_at', 'desc')->paginate(10);

        return Inertia::render('Kak/Index', [
            'kaks' => $kaks,
            'filters' => $request->only(['search', 'status_id']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        if (Auth::user()->role_id !== 3) {
            abort(403, 'Hanya Pengusul yang dapat membuat KAK.');
        }

        return Inertia::render('Kak/Form', [
            'tipe_kegiatan' => TipeKegiatan::all(),
            'satuan' => Satuan::all(),
            'iku' => Iku::all(),
            'kategori_belanja' => KategoriBelanja::whereRaw('is_active = true')->orderBy('urutan')->get(),
            'master_iku' => Iku::all(), // Duplicate for clarity in props if needed
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreKakRequest $request)
    {
        if (Auth::user()->role_id !== 3) {
            abort(403, 'Hanya Pengusul yang dapat membuat KAK.');
        }

        $this->kakService->create($request->all(), Auth::user());

        return redirect()->route('kak.index')->with('success', 'KAK berhasil dibuat.');
    }

    /**
     * Display the specified resource.
     */
    public function show(KAK $kak)
    {
        // Permission check
        $this->authorizeAccess($kak);

        $kak->load([
            'status',
            'tipeKegiatan',
            'mataAnggaran',
            'pengusul',
            'manfaat',
            'tahapan',
            'targets',
            'ikus.iku',
            'ikus.satuan',
            'anggaran.kategoriBelanja',
            'anggaran.satuan1',
            'logStatuses.actor',
            'logStatuses.oldStatus',
            'logStatuses.newStatus',
            'approvals.approver',
        ]);

        return Inertia::render('Kak/Show', [
            'kak' => $kak,
            'tipe_kegiatan' => TipeKegiatan::all(),
            'satuan' => Satuan::all(),
            'iku' => Iku::all(),
            'kategori_belanja' => KategoriBelanja::whereRaw('is_active = true')->orderBy('urutan')->get(),
            'mata_anggaran' => MataAnggaran::all(),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(KAK $kak)
    {
        $this->authorizeAccess($kak, true); // true = require edit permission (Pengusul only)

        // Only allow edit if Draft (1), Rejected (4), or Revision (5)
        if (! in_array($kak->status_id, [1, 4, 5])) {
            abort(403, 'Anda tidak dapat mengedit KAK ini.');
        }

        $kak->load([
            'manfaat',
            'tahapan',
            'targets',
            'ikus',
            'anggaran',
        ]);

        return Inertia::render('Kak/Form', [
            'kak' => $kak,
            'tipe_kegiatan' => TipeKegiatan::all(),
            'satuan' => Satuan::all(),
            'iku' => Iku::all(),
            'kategori_belanja' => KategoriBelanja::whereRaw('is_active = true')->orderBy('urutan')->get(),
            'mata_anggaran' => MataAnggaran::all(),
        ]);
    }

    public function update(UpdateKakRequest $request, KAK $kak)
    {
        $this->authorizeAccess($kak, true);

        $this->kakService->update($kak, $request->all());

        return redirect()->route('kak.index')->with('success', 'KAK berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(KAK $kak)
    {
        $this->authorizeAccess($kak, true);

        if (! in_array($kak->status_id, [1, 4])) { // Draft or Rejected only
            abort(403, 'Anda hanya dapat menghapus KAK dengan status Draft atau Ditolak.');
        }

        $this->kakService->delete($kak);

        return redirect()->route('kak.index')->with('success', 'KAK berhasil dihapus.');
    }




    /**
     * Generate PDF for a specific KAK — inline preview (stream).
     */
    public function previewPdf(KAK $kak)
    {
        $this->authorizeAccess($kak);

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
     * Generate PDF payload for frontend blob preview.
     */
    public function previewPdfBlob(KAK $kak)
    {
        $this->authorizeAccess($kak);

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
     * Generate PDF for a specific KAK — force download.
     */
    public function exportPdf(KAK $kak)
    {
        $this->authorizeAccess($kak);

        $kak->load([
            'status', 'tipeKegiatan', 'mataAnggaran', 'pengusul',
            'manfaat', 'tahapan', 'targets',
            'ikus.iku', 'ikus.satuan',
            'anggaran.kategoriBelanja', 'anggaran.satuan1',
        ]);

        $pdf = Pdf::loadView('pdf.kak', compact('kak'))
            ->setPaper('a4', 'portrait');

        return $pdf->download('KAK_'.str_replace(' ', '_', $kak->nama_kegiatan).'.pdf');
    }
}

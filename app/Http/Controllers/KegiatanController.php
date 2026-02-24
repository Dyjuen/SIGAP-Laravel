<?php

namespace App\Http\Controllers;

use App\Http\Requests\ApproveKegiatanRequest;
use App\Http\Requests\StoreKegiatanRequest;
use App\Models\KAK;
use App\Models\Kegiatan;
use App\Models\KegiatanApproval;
use App\Models\KegiatanLogStatus;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class KegiatanController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $role = $user->getRoleName();

        $approvedKaks = [];
        $pendingKegiatan = [];
        $monitoringKegiatan = [];

        if ($role === 'Pengusul') {
            // Get KAKs that are approved by Verifikator (status_id = 3) but have no Kegiatan yet
            // that belong to this user
            $approvedKaks = KAK::with(['tipeKegiatan', 'mataAnggaran', 'ikus.iku'])
                ->where('status_id', 3)
                ->where('pengusul_user_id', $user->user_id)
                ->whereDoesntHave('kegiatan')
                ->get();
        } elseif ($role === 'PPK' || $role === 'Wadir') {
            // Need pending approvals for their role
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

            // For Wadir, we need to load PPK's catatan from previous approval step
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

        return Inertia::render('Kegiatan/Index', [
            'approvedKaks' => $approvedKaks,
            'pendingKegiatan' => $pendingKegiatan,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreKegiatanRequest $request)
    {
        // 1. Validate KAK is approved
        $kak = KAK::findOrFail($request->kak_id);

        if ($kak->kegiatan()->exists()) {
            return back()->with('error', 'Kegiatan untuk KAK ini sudah diajukan.');
        }

        if ($kak->status_id !== 3) { // 3 = Disetujui Verifikator
            return back()->with('error', 'KAK belum disetujui Verifikator.');
        }

        DB::beginTransaction();

        try {
            // 2. Upload surat pengantar
            $filePath = null;
            if ($request->hasFile('surat_pengantar')) {
                $file = $request->file('surat_pengantar');
                $filename = time().'_'.$file->getClientOriginalName();
                $file->storeAs('uploads/documents', $filename, 'public');
                $filePath = 'uploads/documents/'.$filename;
            }

            // 3. Create Kegiatan
            $kegiatan = Kegiatan::create([
                'kak_id' => $request->kak_id,
                'penanggung_jawab_manual' => $request->penanggung_jawab_manual,
                'pelaksana_manual' => $request->pelaksana_manual,
                'surat_pengantar_path' => $filePath,
            ]);

            // 4. Seed Approvals
            $approvalSteps = ['PPK', 'Wadir2', 'Bendahara-Cair', 'Bendahara-LPJ', 'Bendahara-Setor'];

            foreach ($approvalSteps as $step) {
                KegiatanApproval::create([
                    'kegiatan_id' => $kegiatan->kegiatan_id,
                    'approval_level' => $step,
                    'status' => $step === 'PPK' ? 'Aktif' : 'Menunggu',
                ]);
            }

            // 5. Update KAK Status
            $oldStatus = $kak->status_id;
            $newStatus = 6; // 6 = Review PPK

            $kak->update(['status_id' => $newStatus]);

            // 6. Log Status Change
            KegiatanLogStatus::create([
                'kegiatan_id' => $kegiatan->kegiatan_id,
                'status_id_lama' => $oldStatus,
                'status_id_baru' => $newStatus,
                'actor_user_id' => $request->user()->user_id,
                'catatan' => 'Mengajukan Kegiatan',
            ]);

            DB::commit();

            return redirect()->route('kegiatan.index')->with('success', 'Kegiatan berhasil diajukan.');
        } catch (\Exception $e) {
            DB::rollBack();

            // Re-throw or return generic error
            return back()->with('error', 'Terjadi kesalahan saat menyimpan data: '.$e->getMessage());
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

        return Inertia::render('Kegiatan/Show', [
            'kegiatan' => $kegiatan,
        ]);
    }

    /**
     * Approve the specified kegiatan.
     */
    public function approve(ApproveKegiatanRequest $request, Kegiatan $kegiatan)
    {
        $user = $request->user();
        $role = $user->getRoleName();

        $activeApproval = $kegiatan->activeApproval()->first();

        if (! $activeApproval) {
            return back()->with('error', 'Tidak ada langkah persetujuan yang aktif.');
        }

        // Verify role matches expected step
        $expectedRoleMap = [
            'PPK' => 'PPK',
            'Wadir2' => 'Wadir',
            // Others outside of current scope
        ];

        if (! isset($expectedRoleMap[$activeApproval->approval_level]) || $expectedRoleMap[$activeApproval->approval_level] !== $role) {
            abort(403, 'Akses ditolak: level persetujuan tidak sesuai dengan role Anda.');
        }

        DB::beginTransaction();

        try {
            // Lock the active approval row
            $activeApproval = KegiatanApproval::where('approval_kegiatan_id', $activeApproval->approval_kegiatan_id)
                ->lockForUpdate()
                ->first();

            if ($activeApproval->status !== 'Aktif') {
                // Already processed possibly by concurrent request
                DB::rollBack();

                return back()->with('error', 'Persetujuan ini sudah diproses.');
            }

            // Update current approval
            $activeApproval->update([
                'status' => 'Disetujui',
                'approver_user_id' => $user->user_id,
                'catatan' => $request->catatan,
            ]);

            $kak = $kegiatan->kak;
            $oldStatus = $kak->status_id;
            $newStatus = null;

            if ($activeApproval->approval_level === 'PPK') {
                // Activate Wadir2 step
                $nextStep = KegiatanApproval::where('kegiatan_id', $kegiatan->kegiatan_id)
                    ->where('approval_level', 'Wadir2')
                    ->first();
                if ($nextStep) {
                    $nextStep->update(['status' => 'Aktif']);
                }
                $newStatus = 7; // Review Wadir 2
            } elseif ($activeApproval->approval_level === 'Wadir2') {
                // Activate Bendahara-Cair step
                $nextStep = KegiatanApproval::where('kegiatan_id', $kegiatan->kegiatan_id)
                    ->where('approval_level', 'Bendahara-Cair')
                    ->first();
                if ($nextStep) {
                    $nextStep->update(['status' => 'Aktif']);
                }
                $newStatus = 8; // Proses Pencairan
            }

            if ($newStatus) {
                // Update KAK status
                $kak->update(['status_id' => $newStatus]);

                // Log status
                KegiatanLogStatus::create([
                    'kegiatan_id' => $kegiatan->kegiatan_id,
                    'status_id_lama' => $oldStatus,
                    'status_id_baru' => $newStatus,
                    'actor_user_id' => $user->user_id,
                    'catatan' => $request->catatan ?: 'Disetujui oleh '.$role,
                ]);
            }

            DB::commit();

            return redirect()->route('kegiatan.index')->with('success', 'Kegiatan berhasil disetujui.');

        } catch (\Exception $e) {
            DB::rollBack();

            return back()->with('error', 'Gagal memproses persetujuan: '.$e->getMessage());
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
            // Extract number from username (e.g., verifikator1 -> 1)
            preg_match('/verifikator(\d+)/i', $user->username, $matches);
            if (isset($matches[1])) {
                $tipeKegiatanId = $matches[1];
                $query->whereHas('kak', function ($q) use ($tipeKegiatanId) {
                    $q->where('tipe_kegiatan_id', $tipeKegiatanId);
                });
            }
        }

        // Apply search if provided
        if ($request->has('search') && $request->search) {
            $searchTerm = $request->search;
            $query->whereHas('kak', function ($q) use ($searchTerm) {
                $q->where('nama_kegiatan', 'like', '%'.$searchTerm.'%');
            });
        }

        $kegiatans = $query->latest('kegiatan_id')->paginate(10)->withQueryString();

        // Map data for frontend
        $mappedKegiatans = $kegiatans->getCollection()->map(function ($kegiatan) {
            $approvalStepMapping = [
                'PPK' => ['step' => 1, 'dateKey' => 'accPPK'],
                'Wadir2' => ['step' => 2, 'dateKey' => 'accWD2'],
                'Bendahara-Cair' => ['step' => 3, 'dateKey' => 'uangMuka'],
                'Bendahara-LPJ' => ['step' => 4, 'dateKey' => 'lpj'],
                'Bendahara-Setor' => ['step' => 5, 'dateKey' => 'setorFisik'],
            ];

            $dates = [
                'accPPK' => null,
                'accWD2' => null,
                'uangMuka' => null,
                'lpj' => null,
                'setorFisik' => null,
            ];

            $approvedSteps = [];
            $currentStatus = 1;

            foreach ($kegiatan->approvals as $approval) {
                if (($approval->status === 'Disetujui' || $approval->status === 'Bendahara-Setor') && isset($approvalStepMapping[$approval->approval_level])) {
                    $mapping = $approvalStepMapping[$approval->approval_level];
                    $dates[$mapping['dateKey']] = $approval->updated_at ? $approval->updated_at->format('d/m/Y') : null;
                    $approvedSteps[] = $mapping['step'];
                }
            }

            $maxApprovedStep = ! empty($approvedSteps) ? max($approvedSteps) : 0;

            $activeApproval = $kegiatan->approvals->where('status', 'Aktif')->first();

            if ($activeApproval && isset($approvalStepMapping[$activeApproval->approval_level])) {
                $currentStatus = $approvalStepMapping[$activeApproval->approval_level]['step'];
            } else {
                if ($maxApprovedStep === 5) {
                    $currentStatus = 6;
                } else {
                    $currentStatus = $maxApprovedStep + 1;
                }
            }

            return [
                'kak_id' => $kegiatan->kak_id,
                'kegiatan_id' => $kegiatan->kegiatan_id,
                'nama_kegiatan' => $kegiatan->kak ? $kegiatan->kak->nama_kegiatan : '-',
                'status' => $currentStatus,
                'dates' => $dates,
                'overdueDays' => 0, // Not implemented yet
            ];
        });

        $kegiatans->setCollection($mappedKegiatans);

        return Inertia::render('Kegiatan/Monitoring', [
            'kegiatans' => $kegiatans,
            'filters' => $request->only(['search']),
        ]);
    }
}
